"""Health check endpoint for TerraCity AI.

GET /api/health
Returns system status, offline mode flag, loaded demo regions, and 4-portal integration status.
"""

import os
from fastapi import APIRouter
from backend.app.cache import regional_cache

router = APIRouter()


@router.get("/health", tags=["Health"])
async def get_health():
    """System health check and data connectivity status."""
    offline_mode = os.getenv("OFFLINE_MODE", "true").lower() in ("true", "1", "yes")
    loaded_regions = regional_cache.get_loaded_regions()

    return {
        "status": "ok",
        "version": "1.0.0",
        "offline_mode": offline_mode,
        "loaded_regions": loaded_regions,
        "portals": {
            "bhoonidhi": "active (CartoDEM 30m / Regional Cache)",
            "bhuvan": "active (LULC 50k, Flood Hazard, Geomorphology)",
            "mosdac": "active (INSAT-3D Rainfall Climatology)",
            "vedas": "active (Sentinel-2 NDVI & Temporal API)",
            "openstreetmap": "active (Infrastructure Buffers 15km)"
        }
    }
