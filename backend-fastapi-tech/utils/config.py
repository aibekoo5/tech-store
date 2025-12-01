from functools import lru_cache

from pydantic import Field, computed_field
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

    @computed_field
    @property
    def cors_origins(self) -> list[str]:
        if self.cors_origins_raw is None:
            return ["http://localhost:5173", "http://localhost:4173"]

        raw_value = self.cors_origins_raw.strip()
        if not raw_value:
            return []

        return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
