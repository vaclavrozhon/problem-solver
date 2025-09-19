"""
Custom middleware for the Automatic Researcher backend.

This module contains middleware for logging, request tracking, and other
cross-cutting concerns.
"""

import time
import uuid
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .logging_config import get_logger

logger = get_logger("middleware")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timing
        start_time = time.time()
        
        # Extract request information
        method = request.method
        url = str(request.url)
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Log request
        logger.info(
            f"Request started: {method} {path}",
            extra={
                "request_id": request_id,
                "method": method,
                "endpoint": path,
                "url": url,
                "client_ip": client_ip,
                "user_agent": user_agent,
                "event_type": "request_start"
            }
        )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate response time
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Request completed: {method} {path} - {response.status_code}",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "endpoint": path,
                    "status_code": response.status_code,
                    "response_time": round(process_time, 4),
                    "event_type": "request_complete"
                }
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            # Calculate response time for errors
            process_time = time.time() - start_time
            
            # Log error
            logger.error(
                f"Request failed: {method} {path} - {str(e)}",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "endpoint": path,
                    "error_type": type(e).__name__,
                    "error_details": str(e),
                    "response_time": round(process_time, 4),
                    "event_type": "request_error"
                },
                exc_info=True
            )
            
            # Return error response
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "request_id": request_id
                },
                headers={"X-Request-ID": request_id}
            )
