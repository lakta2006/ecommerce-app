"""
Rate limiting configuration using slowapi.
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)


async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded) -> HTTPException:
    """Custom rate limit exceeded exception handler."""
    return HTTPException(
        status_code=429,
        detail={
            "error": "rate_limit_exceeded",
            "message": f"Too many requests. Please try again later.",
            "retry_after": str(exc.headers.get("Retry-After", "60")),
        },
        headers={"Retry-After": exc.headers.get("Retry-After", "60")}
    )


def setup_rate_limiter(app):
    """Setup rate limiter on FastAPI app."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exception_handler)
