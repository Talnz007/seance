"""
Unit tests for configuration management.

Tests configuration loading, validation, and environment variable parsing.
"""

import pytest
from pydantic import ValidationError
from app.config import Settings


def test_settings_with_valid_env(monkeypatch):
    """Test settings load correctly with valid environment variables."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
    monkeypatch.setenv("JWT_SECRET", "a" * 32)
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.setenv("LOG_LEVEL", "info")
    
    settings = Settings()
    
    assert settings.DATABASE_URL == "postgresql+asyncpg://user:pass@localhost/db"
    assert settings.JWT_SECRET == "a" * 32
    assert settings.ENVIRONMENT == "development"
    assert settings.LOG_LEVEL == "INFO"  # Should be uppercased


def test_settings_missing_required_fields():
    """Test that missing required fields raise validation errors."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(_env_file=None)
    
    errors = exc_info.value.errors()
    error_fields = {error["loc"][0] for error in errors}
    
    assert "DATABASE_URL" in error_fields
    assert "JWT_SECRET" in error_fields


def test_jwt_secret_minimum_length(monkeypatch):
    """Test JWT_SECRET must be at least 32 characters."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
    monkeypatch.setenv("JWT_SECRET", "short")
    
    with pytest.raises(ValidationError) as exc_info:
        Settings()
    
    errors = exc_info.value.errors()
    assert any("JWT_SECRET" in str(error) for error in errors)


def test_cors_origins_parsing_from_json(monkeypatch):
    """Test CORS_ORIGINS can be parsed from JSON string."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
    monkeypatch.setenv("JWT_SECRET", "a" * 32)
    monkeypatch.setenv("CORS_ORIGINS", '["http://localhost:3000","http://localhost:3001"]')
    
    settings = Settings()
    
    assert settings.CORS_ORIGINS == ["http://localhost:3000", "http://localhost:3001"]


def test_cors_origins_as_list(monkeypatch):
    """Test CORS_ORIGINS can be provided as a list directly."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
    monkeypatch.setenv("JWT_SECRET", "a" * 32)
    
    # When using monkeypatch, we can set it as a list directly
    settings = Settings(CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"])
    
    assert settings.CORS_ORIGINS == ["http://localhost:3000", "http://localhost:3001"]


def test_log_level_uppercase_conversion(monkeypatch):
    """Test LOG_LEVEL is converted to uppercase."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
    monkeypatch.setenv("JWT_SECRET", "a" * 32)
    monkeypatch.setenv("LOG_LEVEL", "debug")
    
    settings = Settings()
    
    assert settings.LOG_LEVEL == "DEBUG"


def test_environment_properties(monkeypatch):
    """Test environment detection properties."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
    monkeypatch.setenv("JWT_SECRET", "a" * 32)
    
    # Test development
    monkeypatch.setenv("ENVIRONMENT", "development")
    settings = Settings()
    assert settings.is_development is True
    assert settings.is_production is False
    assert settings.is_staging is False
    
    # Test production
    monkeypatch.setenv("ENVIRONMENT", "production")
    settings = Settings()
    assert settings.is_development is False
    assert settings.is_production is True
    assert settings.is_staging is False
    
    # Test staging
    monkeypatch.setenv("ENVIRONMENT", "staging")
    settings = Settings()
    assert settings.is_development is False
    assert settings.is_production is False
    assert settings.is_staging is True


def test_database_url_sync_conversion(monkeypatch):
    """Test database_url_sync property converts asyncpg to psycopg2."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
    monkeypatch.setenv("JWT_SECRET", "a" * 32)
    
    settings = Settings()
    
    assert "postgresql+asyncpg://" in settings.DATABASE_URL
    assert "postgresql://" in settings.database_url_sync
    assert "postgresql+asyncpg://" not in settings.database_url_sync


def test_default_values(monkeypatch):
    """Test default values are set correctly."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
    monkeypatch.setenv("JWT_SECRET", "a" * 32)
    
    settings = Settings()
    
    assert settings.JWT_ALGORITHM == "HS256"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30
    assert settings.ENVIRONMENT == "development"
    assert settings.LOG_LEVEL == "INFO"
    assert settings.MAX_SESSION_USERS == 6
    assert settings.SESSION_RETENTION_DAYS == 7
    assert settings.DB_POOL_SIZE == 20
    assert settings.DB_MAX_OVERFLOW == 10
    assert settings.DB_POOL_PRE_PING is True
    assert settings.DB_ECHO is False


def test_validation_constraints(monkeypatch):
    """Test field validation constraints."""
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
    monkeypatch.setenv("JWT_SECRET", "a" * 32)
    
    # Test MAX_SESSION_USERS constraints (2-12)
    monkeypatch.setenv("MAX_SESSION_USERS", "1")
    with pytest.raises(ValidationError):
        Settings()
    
    monkeypatch.setenv("MAX_SESSION_USERS", "13")
    with pytest.raises(ValidationError):
        Settings()
    
    # Test valid value
    monkeypatch.setenv("MAX_SESSION_USERS", "8")
    settings = Settings()
    assert settings.MAX_SESSION_USERS == 8
