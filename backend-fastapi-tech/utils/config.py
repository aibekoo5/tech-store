from functools import lru_cache

from pydantic import Field, model_validator
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

    cors_origins_env: str | None = Field(default=None, alias="CORS_ORIGINS")
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://localhost:4173"])

    @model_validator(mode="after")
    def parse_cors_origins(self):
        if self.cors_origins_env is None:
            return self

        raw_value = self.cors_origins_env.strip()
        if not raw_value:
            self.cors_origins = []
            return self

        self.cors_origins = [origin.strip() for origin in raw_value.split(",") if origin.strip()]
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
