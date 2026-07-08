from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://stadiummind:stadiummind_dev@localhost:5432/stadiummind"

    # Gemini AI
    gemini_api_key: str = ""
    gemini_prediction_model: str = "gemini-1.5-pro"
    gemini_chat_model: str = "gemini-1.5-flash"

    # Firebase
    firebase_project_id: str = ""
    firebase_service_account_path: str = ""

    # Security
    secret_key: str = "dev-secret-key-change-in-production"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Simulation
    simulation_interval_seconds: int = 15

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
