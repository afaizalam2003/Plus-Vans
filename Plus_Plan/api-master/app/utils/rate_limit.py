from fastapi import HTTPException, Request
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time

class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self):
        self.requests: Dict[str, list] = {}
        self.window_size = timedelta(minutes=1)
        self.max_requests = 10  # Max requests per minute for anonymous endpoints
        
    def _clean_old_requests(self, key: str) -> None:
        """Remove requests older than the window size."""
        if key not in self.requests:
            return
            
        current_time = datetime.now()
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if current_time - req_time < self.window_size
        ]
        
    def check_rate_limit(self, key: str) -> bool:
        """
        Check if the request should be rate limited.
        
        Args:
            key: Unique identifier for the client (IP address)
            
        Returns:
            bool: True if request is allowed, False if rate limited
        """
        current_time = datetime.now()
        self._clean_old_requests(key)
        
        if key not in self.requests:
            self.requests[key] = []
            
        if len(self.requests[key]) >= self.max_requests:
            return False
            
        self.requests[key].append(current_time)
        return True

# Global rate limiter instance
rate_limiter = RateLimiter()

async def rate_limit_anonymous(request: Request):
    """
    Rate limiting dependency for anonymous endpoints.
    
    Args:
        request: FastAPI request object
        
    Raises:
        HTTPException: If rate limit is exceeded
    """
    client_ip = request.client.host if request.client else "unknown"
    
    if not rate_limiter.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        ) 