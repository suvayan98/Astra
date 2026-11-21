from fastapi import APIRouter
from typing import Dict, Any
from backend.data.sample_sites import SAMPLE_SITES
from backend.services.site_suitability import SiteSuitabilityService
from backend.services.cgwb_water import CGWBWaterService
from backend.services.energy_analysis import EnergyService
from backend.services.city_designer import CityDesignerService
from backend.models.schemas import CityGenerationRequest, GeoPolygon

router = APIRouter(prefix="/api/reports", tags=["Master Plan Reports & Exports"])

@router.post("/generate")
async def generate_full_report(payload: Dict[str, Any]) -> Dict[str, Any]:
    site_id = payload.get("site_id", "site-dholera")
    site = SAMPLE_SITES.get(site_id, SAMPLE_SITES["site-dholera"])
    pop = payload.get("population", 20000)
    acres = payload.get("area_acres", 500.0)

    # Calculate all metrics
    suitability = SiteSuitabilityService.evaluate_suitability(
        site_id=site["id"],
        site_name=site["name"],
        state=site["state"],
        district=site["district"],
        area_acres=acres,
        target_pop=pop,
        raw_site=site
    )

    water = CGWBWaterService.calculate_water_intelligence(
        population=pop,
        area_acres=acres,
        annual_rainfall_mm=site["climate"]["annual_rainfall_mm"],
        state=site["state"],
        district=site["district"],
        block=site["taluka"],
        custom_cgwb=site.get("cgwb")
    )

    energy = EnergyService.calculate_energy_potential(
        population=pop,
        area_acres=acres,
        solar_ghi=site["energy"]["solar_ghi_kwh_m2_day"],
        wind_speed_50m=site["energy"]["wind_speed_50m_ms"],
        wind_wpd=site["energy"]["wind_power_density_wm2"]
    )

    req = CityGenerationRequest(
        site_id=site["id"],
        site_name=site["name"],
        boundary=GeoPolygon(coordinates=site["boundary"]["coordinates"]),
        total_area_acres=acres,
        target_population=pop
    )
    plans = CityDesignerService.generate_master_plans(req)

    return {
        "title": f"TerraAI Executive Master Plan & Geospatial Feasibility Report: {site['name']}",
        "generation_timestamp": "2026-11-22T01:30:00Z",
        "site_metadata": site,
        "suitability_assessment": suitability,
        "water_intelligence": water,
        "renewable_energy": energy,
        "master_plans": plans,
        "isro_audit_trail": {
            "bhoonidhi_scene": site["isro_metadata"]["bhoonidhi_scene_id"],
            "bhuvan_lulc_classification": site["isro_metadata"]["bhuvan_lulc"],
            "mosdac_weather_radar": site["isro_metadata"]["mosdac_rainfall_station"],
            "vedas_ndvi_composite": site["isro_metadata"]["vedas_ndvi_composite"]
        }
    }
