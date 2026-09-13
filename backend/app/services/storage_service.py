import uuid
from functools import lru_cache

from supabase import create_client, Client

from app.core.config import settings
from app.core.exceptions import UpstreamServiceError, ValidationAppError

# WebP files always start with a RIFF header and declare "WEBP" at byte 8.
# Checking these magic bytes (not just the client-sent Content-Type, which
# is trivially spoofable) is what makes this a real server-side guarantee.
_WEBP_RIFF_MAGIC = b"RIFF"
_WEBP_FORMAT_MAGIC = b"WEBP"


@lru_cache
def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def _validate_image(content_type: str, file_bytes: bytes) -> None:
    if content_type not in settings.allowed_image_types_list:
        raise ValidationAppError(
            "Only .webp images are accepted. If your photo isn't a .webp "
            "file yet, search 'webp converter' to convert it first."
        )

    if (
        len(file_bytes) < 12
        or file_bytes[0:4] != _WEBP_RIFF_MAGIC
        or file_bytes[8:12] != _WEBP_FORMAT_MAGIC
    ):
        raise ValidationAppError(
            "This file isn't a valid WebP image (its content doesn't match "
            "its extension/type). Please re-export it as .webp and try again."
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise ValidationAppError(f"Image exceeds the {settings.MAX_UPLOAD_SIZE_MB}MB limit")


def upload_tree_photo(file_bytes: bytes, content_type: str, tree_id: uuid.UUID) -> tuple[str, str]:
    """
    Uploads a photo to the Supabase Storage bucket and returns
    (object_path, signed_url).
    """
    _validate_image(content_type, file_bytes)

    object_path = f"trees/{tree_id}/{uuid.uuid4()}.webp"

    client = get_supabase_client()
    bucket = client.storage.from_(settings.SUPABASE_STORAGE_BUCKET)

    try:
        bucket.upload(
            object_path,
            file_bytes,
            {"content-type": "image/webp"},
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
