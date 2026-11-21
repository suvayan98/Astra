from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.terrain_service import terrain_service
from app.services.soil_service import soil_service
from app.services.water_service import water_service
from app.services.climate_service import climate_service
from app.services.energy_service import energy_service
from app.services.vegetation_service import vegetation_service
from app.models.schemas import GeoJSONGeometry

router = APIRouter(tags=["Thematic Environmental Modules"])

class BaseAnalysisPayload(BaseModel):
    site_name: Optional[str] = "Candidate Site"
    state: Optional[str] = "Andhra Pradesh"
    district: Optional[str] = "Guntur"
    polygon: Optional[GeoJSONGeometry] = None
    center_lat: Optional[float] = 16.541
    center_lng: Optional[float] = 80.515
    area_acres: Optional[float] = 500.0
    population: Optional[int] = 20000

@router.post("/terrain/analyze")
def analyze_terrain(payload: BaseAnalysisPayload):
    coords = payload.polygon.coordinates[0] if payload.polygon else [[payload.center_lng, payload.center_lat]]
    return terrain_service.analyze(coords, payload.site_name or "Candidate Site")

@router.post("/soil/analyze")
def analyze_soil(payload: BaseAnalysisPayload):
    return soil_service.analyze(payload.center_lat or 16.541, payload.center_lng or 80.515, payload.site_name or "Candidate Site")

@router.post("/water/analyze")
async def analyze_water(payload: BaseAnalysisPayload):
    return await water_service.analyze(
        lat=payload.center_lat or 16.541,
        lng=payload.center_lng or 80.515,
        district=payload.district or "Guntur",
        state=payload.state or "Andhra Pradesh",
        area_acres=payload.area_acres or 500.0,
        population=payload.population or 20000
    )

@router.post("/climate/analyze")
async def analyze_climate(payload: BaseAnalysisPayload):
    return await climate_service.analyze(
        lat=payload.center_lat or 16.541,
        lng=payload.center_lng or 80.515,
        district=payload.district or "Guntur"
    )

@router.post("/energy/analyze")
def analyze_energy(payload: BaseAnalysisPayload):
    return energy_service.analyze(
        lat=payload.center_lat or 16.541,
        lng=payload.center_lng or 80.515,
        area_acres=payload.area_acres or 500.0,
        population=payload.population or 20000
    )

@router.post("/vegetation/analyze")
async def analyze_vegetation(payload: BaseAnalysisPayload):
    return await vegetation_service.analyze(
        lat=payload.center_lat or 16.541,
        lng=payload.center_lng or 80.515,
        area_acres=payload.area_acres or 500.0
    )
