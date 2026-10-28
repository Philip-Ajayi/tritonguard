import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TritonGuard Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Nebius Token Factory
    NEBIUS_API_KEY: str = os.getenv("NEBIUS_API_KEY", "")
    NEBIUS_API_BASE_URL: str = os.getenv("NEBIUS_API_BASE_URL", "https://api.tokenfactory.nebius.com/v1")
    NEBIUS_MODEL_PARSER: str = os.getenv("NEBIUS_MODEL_PARSER", "nebius/nvidia/nemotron-3-super-120b-a12b")
    NEBIUS_MODEL_REASONER: str = os.getenv("NEBIUS_MODEL_REASONER", "nebius/nvidia/Nemotron-3-Ultra-550b-a55b")

    # Sandboxing & CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    ENABLE_HARDWARE_SANDBOX: bool = os.getenv("ENABLE_HARDWARE_SANDBOX", "true").lower() == "true"
    ENABLE_CPU_SIMULATOR_FALLBACK: bool = os.getenv("ENABLE_CPU_SIMULATOR_FALLBACK", "true").lower() == "true"

    class Config:
        case_sensitive = True

settings = Settings()
