"""
Configuration management for Séance backend.

This module provides centralized configuration using Pydantic Settings
for environment variable loading, validation, and type safety.

Usage:
    # Import the global settings instance
    from app.config import settings
    
    # Access configuration values
    database_url = settings.DATABASE_URL
    is_dev = settings.is_development
    
    # Use as FastAPI dependency
    from fastapi import Depends
    from app.config import get_settings
    
    @app.get("/config")
    async def get_config(settings: Settings = Depends(get_settings)):
        return {"environment": settings.ENVIRONMENT}

Environment Variables:
    All settings can be configured via environment variables or .env file.
    See .env.example for a complete list of available settings.
    
    Required:
        - DATABASE_URL: PostgreSQL connection string
        - JWT_SECRET: Secret key for JWT tokens (min 32 chars)
    
    Optional (with defaults):
        - ENVIRONMENT: development, staging, or production
        - LOG_LEVEL: DEBUG, INFO, WARNING, ERROR, or CRITICAL
        - CORS_ORIGINS: JSON array of allowed origins
        - And many more (see Settings class)
"""

from typing import List, Literal
from pydantic import Field, field_validator, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All settings are validated using Pydantic and loaded from .env file
    or environment variables. Required settings will raise validation
    errors if not provided.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Database Configuration
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL database URL with asyncpg driver"
    )
    POSTGRES_USER: str = Field(default="seance", description="PostgreSQL username")
    POSTGRES_PASSWORD: str = Field(default="secret", description="PostgreSQL password")
    POSTGRES_DB: str = Field(default="seance", description="PostgreSQL database name")
    
    # Redis Configuration
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL for caching and pub/sub"
    )
    
    # API Keys
    GOOGLE_API_KEY: str | None = Field(
        default=None,
        description="Google Generative AI API key (primary AI provider - FREE)"
    )
    GEMINI_MODEL: str = Field(
        default="gemini-1.5-flash",
        description="Google Gemini model to use (gemini-1.5-flash or gemini-1.5-pro)"
    )
    ELEVENLABS_API_KEY: str | None = Field(
        default=None,
        description="ElevenLabs API key for text-to-speech"
    )
    KIRO_API_KEY: str | None = Field(
        default=None,
        description="Kiro API key (optional)"
    )
    
    # Security Configuration
    JWT_SECRET: str = Field(
        ...,
        min_length=32,
        description="Secret key for JWT token signing (min 32 characters)"
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="Algorithm for JWT token encoding"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        ge=1,
        le=1440,
        description="JWT token expiration time in minutes"
    )
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://10.73.21.42:3000"],
        description="Allowed CORS origins for frontend access",
        json_schema_extra={"env_parse": "json"}
    )
    
    # Environment Configuration
    ENVIRONMENT: Literal["development", "staging", "production"] = Field(
        default="development",
        description="Application environment"
    )
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO",
        description="Logging level for application logs"
    )
    
    # Application Settings
    MAX_SESSION_USERS: int = Field(
        default=6,
        ge=2,
        le=12,
        description="Maximum number of users allowed per session"
    )
    SESSION_RETENTION_DAYS: int = Field(
        default=7,
        ge=1,
        le=30,
        description="Number of days to retain session data"
    )
    
    # Server Configuration
    HOST: str = Field(
        default="0.0.0.0",
        description="Server host address"
    )
    PORT: int = Field(
        default=8000,
        ge=1,
        le=65535,
        description="Server port number"
    )
    
    # Database Connection Pool Settings
    DB_POOL_SIZE: int = Field(
        default=20,
        ge=5,
        le=100,
        description="Database connection pool size"
    )
    DB_MAX_OVERFLOW: int = Field(
        default=10,
        ge=0,
        le=50,
        description="Maximum overflow connections for database pool"
    )
    DB_POOL_PRE_PING: bool = Field(
        default=True,
        description="Enable connection health checks before using from pool"
    )
    DB_ECHO: bool = Field(
        default=False,
        description="Echo SQL queries to logs (useful for debugging)"
    )
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """
        Parse CORS_ORIGINS from string or list.
        
        Handles both JSON string format and comma-separated string format.
        Always returns a list of strings.
        """
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            import json
            # First try to parse as JSON
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                pass
            # If not JSON, treat as comma-separated string
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    @field_validator("LOG_LEVEL", mode="before")
    @classmethod
    def uppercase_log_level(cls, v):
        """Ensure log level is uppercase."""
        if isinstance(v, str):
            return v.upper()
        return v
    
    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, v):
        """
        Validate JWT secret meets security requirements.
        
        Ensures the secret is strong enough for production use.
        """
        if len(v) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters long")
        if v == "your-secret-key-change-in-production-min-32-chars":
            import warnings
            warnings.warn(
                "Using default JWT_SECRET. Change this in production!",
                UserWarning
            )
        return v
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_staging(self) -> bool:
        """Check if running in staging environment."""
        return self.ENVIRONMENT == "staging"
    
    @property
    def database_url_sync(self) -> str:
        """
        Get synchronous database URL for Alembic migrations.
        
        Replaces asyncpg driver with psycopg2 for sync operations.
        """
        return self.DATABASE_URL.replace(
            "postgresql+asyncpg://",
            "postgresql://"
        )


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """
    Dependency injection function for FastAPI routes.
    
    Returns:
        Settings: Global settings instance
        
    Example:
        @app.get("/config")
        async def get_config(settings: Settings = Depends(get_settings)):
            return {"environment": settings.ENVIRONMENT}
    """
    return settings
