import uuid
from functools import lru_cache

from supabase import create_client, Client

from app.core.config import settings
from app.core.exceptions import UpstreamServiceError, ValidationAppError


@lru_cache
def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def _validate_image(content_type: str, size_bytes: int) -> None:
    if content_type not in settings.allowed_image_types_list:
        raise ValidationAppError(
            f"Unsupported image type '{content_type}'. Allowed: {', '.join(settings.allowed_image_types_list)}"
        )
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise ValidationAppError(f"Image exceeds the {settings.MAX_UPLOAD_SIZE_MB}MB limit")


def upload_tree_photo(file_bytes: bytes, content_type: str, tree_id: uuid.UUID) -> tuple[str, str]:
    """
    Uploads a photo to the Supabase Storage bucket and returns
    (object_path, signed_url).
    """
    _validate_image(content_type, len(file_bytes))

    extension = content_type.split("/")[-1]
    object_path = f"trees/{tree_id}/{uuid.uuid4()}.{extension}"

    client = get_supabase_client()
    bucket = client.storage.from_(settings.SUPABASE_STORAGE_BUCKET)

    try:
        bucket.upload(
            object_path,
            file_bytes,
            {"content-type": content_type},
        )
        signed = bucket.create_signed_url(
            object_path, settings.SUPABASE_SIGNED_URL_EXPIRY_SECONDS
        )
        signed_url = signed.get("signedURL") or signed.get("signed_url")
    except Exception as exc:  # noqa: BLE001 - external SDK, translate broadly
        raise UpstreamServiceError(f"Failed to upload image to storage: {exc}") from exc

    return object_path, signed_url


def delete_tree_photo(object_path: str) -> None:
    client = get_supabase_client()
    bucket = client.storage.from_(settings.SUPABASE_STORAGE_BUCKET)
    try:
        bucket.remove([object_path])
    except Exception as exc:  # noqa: BLE001
        raise UpstreamServiceError(f"Failed to delete image from storage: {exc}") from exc
