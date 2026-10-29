import os
import json
from typing import List, Union, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "TritonGuard Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Nebius Token Factory
    NEBIUS_API_KEY: str = ""
    NEBIUS_API_BASE_URL: str = "https://api.tokenfactory.nebius.com/v1"
    NEBIUS_MODEL_PARSER: str = "nebius/nvidia/nemotron-3-super-120b-a12b"
    NEBIUS_MODEL_REASONER: str = "nebius/nvidia/Nemotron-3-Ultra-550b-a55b"

    # Sandboxing & CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    ENABLE_HARDWARE_SANDBOX: bool = True
    ENABLE_CPU_SIMULATOR_FALLBACK: bool = True

    model_config = SettingsConfigDict(
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        elif isinstance(v, (list, tuple, set)):
            return list(v)
        return ["*"]

settings = Settings()