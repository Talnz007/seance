"""
Security utilities for authentication and authorization.

This module provides JWT token management and password hashing functions
for securing API endpoints and WebSocket connections.

Usage:
    # Create JWT token
    from app.core.security import create_access_token
    from datetime import timedelta
    
    token = create_access_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=30)
    )
    
    # Verify JWT token
    from app.core.security import verify_token
    
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
    except JWTError:
        # Handle invalid token
        pass
    
    # Hash password (for future user accounts)
    from app.core.security import get_password_hash, verify_password
    
    hashed = get_password_hash("my_password")
    is_valid = verify_password("my_password", hashed)
"""

from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings


# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token with configurable expiration.
    
    Generates a signed JWT token containing the provided data payload
    with an expiration timestamp. The token is signed using the
    JWT_SECRET from application settings.
    
    Args:
        data: Dictionary of claims to encode in the token.
              Typically includes {"sub": user_id} for user identification.
        expires_delta: Optional custom expiration time.
                      If not provided, uses ACCESS_TOKEN_EXPIRE_MINUTES
                      from settings (default 30 minutes).
    
    Returns:
        str: Encoded JWT token string
    
    Example:
        >>> token = create_access_token({"sub": "user123"})
        >>> # Token expires in 30 minutes (default)
        
        >>> from datetime import timedelta
        >>> token = create_access_token(
        ...     {"sub": "user123"},
        ...     expires_delta=timedelta(hours=24)
        ... )
        >>> # Token expires in 24 hours
    
    Requirements:
        - Requirement 7.1: Provide functions to create JWT access tokens
        - Requirement 7.3: Read JWT secret and algorithm from environment
        - Requirement 7.4: Set token expiration based on configured duration
    """
    to_encode = data.copy()
    
    # Calculate expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Add expiration claim
    to_encode.update({"exp": expire})
    
    # Encode and sign the token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode a JWT token.
    
    Validates the token signature and expiration, then returns the
    decoded payload. Raises JWTError if the token is invalid or expired.
    
    Args:
        token: JWT token string to verify
    
    Returns:
        Dict[str, Any]: Decoded token payload containing claims
    
    Raises:
        JWTError: If token is invalid, expired, or signature verification fails
    
    Example:
        >>> try:
        ...     payload = verify_token(token)
        ...     user_id = payload.get("sub")
        ...     print(f"Authenticated user: {user_id}")
        ... except JWTError:
        ...     print("Invalid or expired token")
    
    Requirements:
        - Requirement 7.2: Provide functions to verify and decode JWT tokens
        - Requirement 7.3: Read JWT secret and algorithm from environment
    """
    payload = jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM]
    )
    return payload


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Generates a secure bcrypt hash of the provided password.
    This function is provided for future use when user accounts
    with password authentication are implemented.
    
    Args:
        password: Plain text password to hash
    
    Returns:
        str: Bcrypt hashed password string
    
    Example:
        >>> hashed = get_password_hash("my_secure_password")
        >>> print(hashed)
        $2b$12$...
    
    Note:
        The bcrypt algorithm automatically includes a salt and
        uses a configurable number of rounds for key derivation.
        The default configuration provides strong security.
    
    Requirements:
        - Requirement 7.5: Provide password hashing functions for future use
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Checks if the provided plain text password matches the bcrypt hash.
    This function is provided for future use when user accounts
    with password authentication are implemented.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Bcrypt hashed password to check against
    
    Returns:
        bool: True if password matches hash, False otherwise
    
    Example:
        >>> hashed = get_password_hash("my_password")
        >>> verify_password("my_password", hashed)
        True
        >>> verify_password("wrong_password", hashed)
        False
    
    Requirements:
        - Requirement 7.5: Provide password hashing functions for future use
    """
    return pwd_context.verify(plain_password, hashed_password)
