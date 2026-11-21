from typing import Dict, Any, List
from app.adapters.mosdac_adapter import mosdac_adapter

class ClimateService:
    """
    Module E: TerraClimate AI — Climate & Disaster Risk Intelligence.
    Assesses multi-hazard vulnerability (flood, heatwave, drought, cyclone) and plans resilient infrastructure.
    """

    async def analyze(self, lat: float, lng: float, district: str = "Candidate District") -> Dict[str, Any]:
        meteo = await mosdac_adapter.get_meteo_analysis(lat, lng)
        
        # Hazard risk profiling
        flood_risk = "High" if meteo["extreme_rainfall_24h_mm"] > 200 else ("Moderate" if meteo["extreme_rainfall_24h_mm"] > 140 else "Low")
        heat_risk = "Severe" if meteo["summer_peak_temp_c"] > 43.0 else ("Moderate" if meteo["summer_peak_temp_c"] > 38.0 else "Low")
        
        # Indian Agro-climatic zone classification
        if lat < 14.5:
            zone = "Zone X: Southern Plateau and Hills (Semi-Arid Dry Agro-Eco Region)"
        elif lat > 20.0 and lng < 74.0:
            zone = "Zone XIII: Gujarat Plains and Hills Region (Saline Semi-Arid Coastal)"
        elif lat > 24.0:
            zone = "Zone VIII: Central Plateau and Hills Region (Bundelkhand Sub-humid)"
        else:
            zone = "Zone XI: East Coast Plains and Hills (Krishna-Godavari Coastal Alluvial)"

        return {
            "flood_susceptibility": flood_risk,
            "heatwave_risk": heat_risk,
            "drought_risk": meteo["drought_susceptibility"],
            "cyclone_risk": meteo["cyclone_exposure"],
            "annual_rainfall_avg_mm": meteo["annual_rainfall_avg_mm"],
            "extreme_rainfall_24h_mm": meteo["extreme_rainfall_24h_mm"],
            "summer_peak_temp_c": meteo["summer_peak_temp_c"],
            "cooling_degree_days": int(meteo["summer_peak_temp_c"] * 85),
            "climate_zone_india": zone,
            "monthly_climatology": meteo["monthly_rainfall_mm"],
            "disaster_buffer_zones": [
                "100m mandatory green ecological buffer along natural flood drainage corridors",
                "Minimum 500m separation buffer between industrial facilities and residential zones",
                "Mandatory cool-roof / high albedo (>0.65) envelope regulation to counter urban heat island (UHI)"
            ],
            "emergency_evacuation_routes": [
                "Primary 45m East-West arterial corridor elevated 1.5m above 100-year flood datum",
                "Secondary 30m North-South relief spine connecting civic disaster shelter clusters"
            ],
            "climate_resilience_recommendations": [
                "Design stormwater drains for a minimum 1-in-50 year return storm intensity (120 mm/hr)",
                "Deploy multi-purpose cyclone/heatwave shelters integrated within secondary school auditoriums",
                "Urban forestry density with multi-tier native canopies to reduce local surface ambient temperature by 2.5°C to 4.0°C"
            ],
            "disclaimer": "CRITICAL NOTICE: Climate hazard classifications are probabilistic models derived from historical satellite observations (ISRO MOSDAC / IMD 1980-2024). They do NOT represent deterministic guaranteed predictions of future weather anomalies."
        }

climate_service = ClimateService()
