import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "TerraAI Geospatial Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # ISRO BHOONIDHI (NRSC)
    BHOONIDHI_API_KEY: Optional[str] = os.getenv("BHOONIDHI_API_KEY", "")
    BHOONIDHI_TOKEN: Optional[str] = os.getenv("BHOONIDHI_TOKEN", "")
    BHOONIDHI_BASE_URL: str = "https://bhoonidhi.nrsc.gov.in/bhoonidhi-api"
    
    # ISRO BHUVAN (NRSC)
    BHUVAN_TOKEN: Optional[str] = os.getenv("BHUVAN_TOKEN", "")
    BHUVAN_BASE_URL: str = "https://bhuvan-app1.nrsc.gov.in/api"
    BHUVAN_WMS_URL: str = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"
    
    # ISRO MOSDAC (SAC)
    MOSDAC_USER: Optional[str] = os.getenv("MOSDAC_USER", "")
    MOSDAC_TOKEN: Optional[str] = os.getenv("MOSDAC_TOKEN", "")
    MOSDAC_BASE_URL: str = "https://mosdac.gov.in/api"
    
    # ISRO VEDAS (SAC)
    VEDAS_TOKEN: Optional[str] = os.getenv("VEDAS_TOKEN", "")
    VEDAS_BASE_URL: str = "https://vedas.sac.gov.in/vconsole/api"
    VEDAS_WMS_URL: str = "https://vedas.sac.gov.in/wms"
    
    # External APIs
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal/climatology/point"
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    
    # Demo Mode: Clearly distinguish sample/cached data from live authenticated feeds
    DEMO_MODE: bool = True
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
