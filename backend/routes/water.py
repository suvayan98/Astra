from fastapi import APIRouter
from typing import Dict, Any
from backend.models.schemas import WaterIntelligenceResult
from backend.services.cgwb_water import CGWBWaterService
from backend.data.sample_sites import SAMPLE_SITES

router = APIRouter(prefix="/api/water", tags=["Water Intelligence & CGWB"])

@router.post("/analyze", response_model=WaterIntelligenceResult)
async def analyze_water(payload: Dict[str, Any]) -> WaterIntelligenceResult:
    site_id = payload.get("site_id")
    site = SAMPLE_SITES.get(site_id) if site_id else None

    pop = payload.get("population", 20000)
    acres = payload.get("area_acres", 500.0)
    
    annual_rain = site["climate"]["annual_rainfall_mm"] if site else payload.get("annual_rainfall_mm", 750.0)
    state = site["state"] if site else payload.get("state", "Gujarat")
    district = site["district"] if site else payload.get("district", "Ahmedabad")
    block = site.get("taluka", "Dholera") if site else "Central"
    custom_cgwb = site.get("cgwb") if site else None

    return CGWBWaterService.calculate_water_intelligence(
        population=pop,
        area_acres=acres,
        annual_rainfall_mm=annual_rain,
        state=state,
        district=district,
        block=block,
        custom_cgwb=custom_cgwb
    )
