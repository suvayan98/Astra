from fastapi import APIRouter
from typing import Dict, Any
from backend.models.schemas import RenewableEnergyResult
from backend.services.energy_analysis import EnergyService
from backend.data.sample_sites import SAMPLE_SITES

router = APIRouter(prefix="/api/energy", tags=["Renewable Energy Intelligence"])

@router.post("/analyze", response_model=RenewableEnergyResult)
async def analyze_energy(payload: Dict[str, Any]) -> RenewableEnergyResult:
    site_id = payload.get("site_id")
    site = SAMPLE_SITES.get(site_id) if site_id else None

    pop = payload.get("population", 20000)
    acres = payload.get("area_acres", 500.0)
    solar_ghi = site["energy"]["solar_ghi_kwh_m2_day"] if site else payload.get("solar_ghi", 5.5)
    wind_spd = site["energy"]["wind_speed_50m_ms"] if site else payload.get("wind_speed_50m", 5.2)
    wind_wpd = site["energy"]["wind_power_density_wm2"] if site else payload.get("wind_wpd", 180.0)

    return EnergyService.calculate_energy_potential(
        population=pop,
        area_acres=acres,
        solar_ghi=solar_ghi,
        wind_speed_50m=wind_spd,
        wind_wpd=wind_wpd
    )
