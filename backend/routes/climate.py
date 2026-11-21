from fastapi import APIRouter
from typing import Dict, Any
from backend.models.schemas import ClimateDisasterResult
from backend.services.climate_analysis import ClimateService
from backend.data.sample_sites import SAMPLE_SITES

router = APIRouter(prefix="/api/climate", tags=["Climate & Disaster Intelligence"])

@router.post("/analyze", response_model=ClimateDisasterResult)
async def analyze_climate(payload: Dict[str, Any]) -> ClimateDisasterResult:
    site_id = payload.get("site_id")
    site = SAMPLE_SITES.get(site_id) if site_id else None

    climate_data = site.get("climate") if site else payload.get("climate_data")
    elev_min = site["elevation_m"]["min"] if site else payload.get("elev_min_m", 12.0)

    return ClimateService.analyze_climate_disaster(climate_data, elev_min)
