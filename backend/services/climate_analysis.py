from typing import Dict, Any, List
from backend.models.schemas import ClimateDisasterResult

class ClimateService:
    """
    Climate and Disaster Intelligence Service.
    Integrates IMD extreme weather return periods, flood vulnerability indices,
    cyclone tracking buffers, and safe development zoning.
    """

    @classmethod
    def analyze_climate_disaster(
        cls,
        climate_data: Dict[str, Any] = None,
        elev_min_m: float = 12.0
    ) -> ClimateDisasterResult:
        if climate_data is None:
            climate_data = {
                "annual_rainfall_mm": 720.0,
                "mean_temp_c": 26.5,
                "max_summer_temp_c": 43.0,
                "extreme_24h_rainfall_mm": 170.0,
                "flood_susceptibility": "Moderate",
                "cyclone_risk": "Low",
                "heatwave_days": 18
            }

        ann_rain = climate_data.get("annual_rainfall_mm", 720.0)
        ext_24h = climate_data.get("extreme_24h_rainfall_mm", 170.0)
        flood_zone = climate_data.get("flood_susceptibility", "Moderate")
        cyclone_risk = climate_data.get("cyclone_risk", "Low")
        heat_days = climate_data.get("heatwave_days", 18)

        shelters = [
            {
                "name": "Central Civic Multi-Purpose Disaster Relief Shelter",
                "capacity_people": 2500,
                "features": "Independent rooftop solar microgrid, 72-hour potable water reservoir, satellite emergency communications, elevated plinth +1.5m above flood datum",
                "location_zone": "High-Elevation Central Civic Hub"
            },
            {
                "name": "North Secondary Community Health & Cyclone Shelter",
                "capacity_people": 1200,
                "features": "Reinforced concrete shear walls (IS 1893 seismic & IS 875 wind code), medical trauma clinic, dedicated diesel-solar hybrid generator",
                "location_zone": "Northern Residential Sector"
            }
        ]

        evac_corridors = [
            "Arterial North-South 45m Transit Spine with elevated grade separation above the 100-year flood level.",
            "Dual-access East-West 30m Green Boulevard linking residential quarters directly to the State Highway.",
            "Dedicated pedestrian bio-corridors serving as secondary non-motorized evacuation routes during grid collapse."
        ]

        measures = [
            f"Mandatory 50m to 100m no-development buffer along natural drainage swales and retention ponds.",
            f"All residential and hospital finished floor levels (FFL) set at minimum {elev_min_m + 1.8:.1f}m AMSL.",
            "Permeable interlocking concrete pavers (PICP) for all internal neighborhood streets and parking bays.",
            "Urban heat island mitigation: Cool-roof reflective coatings (SRI > 78) and shaded tree corridors reducing microclimate temperature by 3.5°C."
        ]

        return ClimateDisasterResult(
            mean_annual_temp_c=climate_data.get("mean_temp_c", 26.5),
            summer_max_temp_c=climate_data.get("max_summer_temp_c", 43.0),
            winter_min_temp_c=14.0 if climate_data.get("mean_temp_c", 26.5) > 25.0 else 8.5,
            mean_annual_rainfall_mm=ann_rain,
            extreme_24h_rainfall_return_50yr_mm=ext_24h,
            flood_susceptibility_zone=flood_zone,
            drought_vulnerability_index="Moderate" if ann_rain < 700 else "Low",
            cyclone_hazard_risk=cyclone_risk,
            heatwave_hazard_days_per_year=heat_days,
            landslide_risk="Very Low (Plain gradient)" if elev_min_m < 200 else "Moderate (Ridge slopes)",
            forest_fire_risk="Low" if ann_rain > 800 else "Moderate (Dry summer scrubland)",
            recommended_safe_development_area_pct=88.0 if "low" in flood_zone.lower() else (82.0 if "mod" in flood_zone.lower() else 74.0),
            flood_drainage_buffer_m=75.0,
            emergency_shelters=shelters,
            evacuation_corridors=evac_corridors,
            disaster_resilience_measures=measures
        )
