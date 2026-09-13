"""
Domain-level exceptions and their FastAPI handlers.

Services/selectors raise these instead of HTTPException directly, so the
business logic layer stays framework-agnostic. The handlers registered in
app.main translate them into proper HTTP responses.
"""


class AppError(Exception):
    status_code: int = 500
    detail: str = "Internal server error"

    def __init__(self, detail: str | None = None):
        if detail:
            self.detail = detail
        super().__init__(self.detail)


class NotFoundError(AppError):
    status_code = 404
    detail = "Resource not found"


class ConflictError(AppError):
    status_code = 409
    detail = "Resource already exists"


class UnauthorizedError(AppError):
    status_code = 401
    detail = "Not authenticated"


class ForbiddenError(AppError):
    status_code = 403
    detail = "Not allowed to perform this action"


class ValidationAppError(AppError):
    status_code = 422
    detail = "Invalid input"


class UpstreamServiceError(AppError):
    """Raised when an external dependency (Gemini, Supabase Storage) fails."""
    status_code = 502
    detail = "Upstream service error"
