from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.models.schemas import (
    CityGenerationRequest, MasterPlanAlternative, ZoneUpdateRequest,
    SimulationRequest, ScenarioSimulationResult
)
from backend.services.city_designer import CityDesignerService
from backend.services.future_simulator import FutureSimulatorService
from backend.data.sample_sites import SAMPLE_SITES

router = APIRouter(prefix="/api/city", tags=["City Master Plan Designer & Simulator"])

# In-memory storage for active plans
ACTIVE_PLANS: Dict[str, List[MasterPlanAlternative]] = {}

@router.post("/generate", response_model=List[MasterPlanAlternative])
async def generate_city_master_plans(req: CityGenerationRequest) -> List[MasterPlanAlternative]:
    # Check if a preset site boundary should be used if coordinates are empty
    if not req.boundary.coordinates or len(req.boundary.coordinates[0]) < 3:
        if req.site_id and req.site_id in SAMPLE_SITES:
            s = SAMPLE_SITES[req.site_id]
            req.boundary.coordinates = s["boundary"]["coordinates"]
            req.total_area_acres = s["area_acres"]
            req.site_name = s["name"]

    plans = CityDesignerService.generate_master_plans(req)
    plan_key = req.site_id or "active_session"
    ACTIVE_PLANS[plan_key] = plans
    return plans

@router.post("/{city_id}/edit", response_model=Dict[str, Any])
async def edit_zone(city_id: str, update: ZoneUpdateRequest) -> Dict[str, Any]:
    plans = ACTIVE_PLANS.get(city_id) or ACTIVE_PLANS.get("active_session")
    if not plans:
        raise HTTPException(status_code=404, detail="No active master plans found for this session. Please generate plans first.")

    target_plan = None
    for p in plans:
        if p.plan_id == update.plan_id or p.plan_code == update.plan_id:
            target_plan = p
            break

    if not target_plan:
        raise HTTPException(status_code=404, detail="Target plan not found")

    target_zone = None
    for z in target_plan.zones:
        if z.id == update.zone_id:
            target_zone = z
            break

    if not target_zone:
        raise HTTPException(status_code=404, detail="Target zone not found")

    # Apply updates
    if update.zone_type:
        target_zone.zone_type = update.zone_type
        if update.zone_type in CityDesignerService.ZONE_COLORS:
            target_zone.color = CityDesignerService.ZONE_COLORS[update.zone_type]
    if update.area_acres is not None:
        target_zone.area_acres = update.area_acres
        target_zone.area_hectares = round(update.area_acres * 0.404686, 1)
        target_zone.area_percentage = round((update.area_acres / target_plan.total_area_acres) * 100.0, 1)
    if update.far_ratio is not None:
        target_zone.far_ratio = update.far_ratio
    if update.geometry:
        target_zone.geometry = update.geometry

    return {
        "status": "success",
        "message": f"Zone {target_zone.name} successfully updated.",
        "updated_zone": target_zone
    }

@router.post("/{city_id}/simulate", response_model=ScenarioSimulationResult)
async def simulate_future_city(city_id: str, sim_req: SimulationRequest) -> ScenarioSimulationResult:
    return FutureSimulatorService.run_simulation(sim_req)

@router.get("/{city_id}/results")
async def get_city_results(city_id: str) -> Dict[str, Any]:
    plans = ACTIVE_PLANS.get(city_id) or ACTIVE_PLANS.get("active_session")
    if not plans:
        raise HTTPException(status_code=404, detail="No active master plans found")
    return {"plans": plans}
