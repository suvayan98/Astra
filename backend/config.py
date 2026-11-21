import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "TerraAI Geospatial Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # ISRO / Indian Space Portals API Keys & Credentials
    BHOONIDHI_API_KEY: str = os.getenv("BHOONIDHI_API_KEY", "")
    BHOONIDHI_CLIENT_ID: str = os.getenv("BHOONIDHI_CLIENT_ID", "")
    BHOONIDHI_CLIENT_SECRET: str = os.getenv("BHOONIDHI_CLIENT_SECRET", "")
    
    BHUVAN_API_KEY: str = os.getenv("BHUVAN_API_KEY", "")
    BHUVAN_TOKEN: str = os.getenv("BHUVAN_TOKEN", "")
    
    MOSDAC_USER: str = os.getenv("MOSDAC_USER", "")
    MOSDAC_KEY: str = os.getenv("MOSDAC_KEY", "")
    
    VEDAS_API_KEY: str = os.getenv("VEDAS_API_KEY", "")
    
    # LLM / AI Assistant API Key (OpenAI / Gemini / Anthropic / Ollama)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Default Demo Mode (True when external live APIs are pending credentials)
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
