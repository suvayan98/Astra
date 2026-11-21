from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.city_planner import city_planner_service
from app.services.future_simulator import future_simulator_service
from app.models.schemas import GeoJSONGeometry, CityZone

router = APIRouter(prefix="/city", tags=["TerraCity Designer & TerraFuture AI"])

class MasterPlanRequest(BaseModel):
    site_id: Optional[str] = "site_master"
    polygon: GeoJSONGeometry
    population: Optional[int] = 20000
    area_acres: Optional[float] = 500.0
    development_goals: Optional[List[str]] = [
        "15-Minute Polycentric Walkability",
        "High Clean Energy Autonomy (>75%)",
        "Statutory Riparian Flood Buffer Protection",
        "Decentralized Circular Water Harvesting"
    ]
    sustainability_priorities: Optional[List[str]] = ["Water Security", "Microgrid Storage", "Zero Net Sprawl"]

class EditZoneRequest(BaseModel):
    site_polygon: GeoJSONGeometry
    existing_zones: List[Dict[str, Any]]
    updated_zone: Dict[str, Any]

class SimulationRequest(BaseModel):
    base_population: Optional[int] = 20000
    plan_id: Optional[str] = "plan_a"
    pop_growth_rate_pct: Optional[float] = 2.2
    water_lpcd: Optional[float] = 135.0
    re_growth_rate_pct: Optional[float] = 3.5

# In-memory session store for generated plans to support live editing
plan_cache: Dict[str, Any] = {}

@router.post("/generate")
def generate_city_master_plans(payload: MasterPlanRequest):
    """
    Generates 3 full Master Plan alternatives (Plan A: Compact 15-Min City, Plan B: Green Eco-Settlement, Plan C: Resource-Efficient Smart TOD)
    with non-overlapping editable GeoJSON zone polygons and trade-off comparison.
    """
    try:
        coords = payload.polygon.coordinates[0]
        result = city_planner_service.generate_master_plans(
            polygon_coords=coords,
            site_id=payload.site_id or "site_master",
            population=payload.population or 20000,
            area_acres=payload.area_acres or 500.0,
            priorities=payload.sustainability_priorities
        )
        plan_cache[payload.site_id or "site_master"] = result
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Master plan generation error: {str(e)}")

@router.post("/{city_id}/edit")
def edit_city_zone(city_id: str, payload: EditZoneRequest):
    """
    Validates and updates an editable zone polygon, checking containment within site boundary and flagging overlaps.
    """
    try:
        site_coords = payload.site_polygon.coordinates[0]
        validation = city_planner_service.validate_and_edit_zone(
            site_polygon_coords=site_coords,
            existing_zones=payload.existing_zones,
            updated_zone=payload.updated_zone
        )
        return validation
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Zone edit failed: {str(e)}")

@router.post("/{city_id}/simulate")
def simulate_city_future(city_id: str, payload: SimulationRequest):
    """
    Module I: TerraFuture AI — Long-term demographic and resource simulation over 10, 20, 50, and 100 years
    across 5 development scenarios.
    """
    try:
        return future_simulator_service.simulate(
            base_population=payload.base_population or 20000,
            plan_id=payload.plan_id or "plan_a",
            pop_growth_rate_pct=payload.pop_growth_rate_pct or 2.2,
            water_lpcd=payload.water_lpcd or 135.0,
            re_growth_rate_pct=payload.re_growth_rate_pct or 3.5,
            site_id=city_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Simulation failed: {str(e)}")

@router.get("/{city_id}/results")
def get_city_results(city_id: str):
    """
    Retrieves stored master plan alternatives and cached layout for the specified site.
    """
    if city_id in plan_cache:
        return plan_cache[city_id]
        
    # Fallback default generation for Amaravati boundary
    default_coords = [[80.505, 16.533], [80.525, 16.533], [80.528, 16.549], [80.508, 16.551], [80.505, 16.533]]
    return city_planner_service.generate_master_plans(
        polygon_coords=default_coords,
        site_id=city_id,
        population=20000,
        area_acres=500.0
    )
