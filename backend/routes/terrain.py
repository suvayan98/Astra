from fastapi import APIRouter
from typing import Dict, Any
from backend.models.schemas import TerrainAnalysisResult
from backend.services.terrain_analysis import TerrainService
from backend.data.sample_sites import SAMPLE_SITES

router = APIRouter(prefix="/api/terrain", tags=["Terrain & Geology"])

@router.post("/analyze", response_model=TerrainAnalysisResult)
async def analyze_terrain(payload: Dict[str, Any]) -> TerrainAnalysisResult:
    site_id = payload.get("site_id")
    site = SAMPLE_SITES.get(site_id) if site_id else None
    
    elev_data = site.get("elevation_m") if site else {"min": 14.0, "max": 28.0, "mean": 19.5}
    slope_deg = site.get("slope_deg") if site else payload.get("slope_deg", 2.0)
    lat = site["center"]["lat"] if site else payload.get("lat", 22.25)
    lng = site["center"]["lng"] if site else payload.get("lng", 72.19)

    return TerrainService.analyze_terrain(elev_data, slope_deg, lat, lng)
