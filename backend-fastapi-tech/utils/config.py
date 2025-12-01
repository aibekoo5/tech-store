from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        populate_by_name=True,
    )

    database_url: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:5432/online_store")
    secret_key: str = Field(default="change-me")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=60)

    cors_origins_raw: str | None = Field(default=None, alias="CORS_ORIGINS")

    @property
    def cors_origins(self) -> list[str]:
        """Return parsed CORS origins while avoiding JSON decoding of env strings.

        Pydantic Settings attempts to JSON-decode values for complex types like lists.
        By keeping the stored value as a simple string (or None) we can safely accept
        comma-separated origins from `.env` files without triggering JSON parsing
        errors, then split them here for application use.
        """

        if self.cors_origins_raw is None:
            return ["http://localhost:5173", "http://localhost:4173"]

        raw_value = self.cors_origins_raw.strip()
        if not raw_value:
            return []

        return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
