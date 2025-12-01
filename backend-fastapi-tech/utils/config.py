import json
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _safe_json_loads(value: str):
    """Return JSON-decoded value or the raw string if decoding fails.

    Pydantic will try to JSON-decode complex types (like list[str]) from the
    environment. Allow comma-separated strings such as
    "http://localhost:5173,http://localhost:4173" by falling back to the raw
    value when the env var is not valid JSON.
    """

    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        json_loads=_safe_json_loads,
    )

    database_url: str = Field(default="postgresql+asyncpg://postgres:654321@localhost:5432/tech")
    secret_key: str = Field(default="5f113ece64482703baf05b8f805be00399d21fe58507e7330eb9415785dc8d36")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=60)
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://localhost:4173"])

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
