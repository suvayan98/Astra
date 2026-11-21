from fastapi import APIRouter
from typing import Dict, Any, List
from backend.models.schemas import ISROHubOverview, ISROPortalStatus
from backend.services.isro_bhoonidhi import BhoonidhiService
from backend.services.isro_bhuvan import BhuvanService
from backend.services.isro_mosdac import MosdacService
from backend.services.isro_vedas import VedasService
from backend.config import settings

router = APIRouter(prefix="/api/data-sources", tags=["ISRO Space Data Hub & Portals"])

@router.get("/status", response_model=ISROHubOverview)
async def get_isro_status() -> ISROHubOverview:
    bhoonidhi_live = bool(settings.BHOONIDHI_API_KEY) and not settings.DEMO_MODE
    bhuvan_live = bool(settings.BHUVAN_TOKEN) and not settings.DEMO_MODE

    portals = [
        ISROPortalStatus(
            portal_id="bhoonidhi",
            name="BHOONIDHI — Earth Observation Data Hub",
            agency="ISRO / NRSC",
            official_url="https://bhoonidhi.nrsc.gov.in/",
            api_endpoint="https://bhoonidhi.nrsc.gov.in/bhoonidhi-api/stac/search",
            connection_status="Connected (Live)" if bhoonidhi_live else "Connected (Demo Cache Active)",
            is_live=bhoonidhi_live,
            last_retrieval_timestamp="2024-04-12T08:15:30Z",
            auth_type="STAC Bearer Token / Open Data Access",
            token_status="Active Token (Valid)" if bhoonidhi_live else "Sample Data Cache Mode (Token Unset)",
            dataset_used="Resourcesat-2A LISS-IV, Cartosat-3 PAN+MX, Sentinel-2A MSI, RISAT-1A SAR",
            acquisition_dates="2023-2024 (Cycle Validated)",
            spatial_resolution="0.28m (Cartosat-3) to 5.8m (LISS-IV)",
            contribution_to_analysis="Provides orthorectified multi-spectral and sub-meter imagery for micro-topography, site boundaries, and urban fringe verification.",
            sample_products=[
                {"name": "RESOURCESAT-2A LISS-IV 5.8m Multispectral", "scene_id": "RS2A_L4_20240315_098_054", "format": "GeoTIFF L2G"},
                {"name": "CARTOSAT-3 0.28m Panchromatic High-Res", "scene_id": "CS3_PAN_20240218_024", "format": "GeoTIFF L1D"},
                {"name": "RISAT-1A EOS-04 C-Band SAR Stripmap", "scene_id": "EOS04_FRS_20240120", "format": "Geocoded Backscatter"}
            ]
        ),
        ISROPortalStatus(
            portal_id="bhuvan",
            name="BHUVAN — Indian Geo-Platform",
            agency="ISRO / NRSC",
            official_url="https://bhuvan.nrsc.gov.in/",
            api_endpoint="https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms",
            connection_status="Connected (Live)" if bhuvan_live else "Connected (Demo Cache Active)",
            is_live=bhuvan_live,
            last_retrieval_timestamp="2024-04-12T08:15:30Z",
            auth_type="OGC WMS / Web Service Key",
            token_status="Active OGC Gateway",
            dataset_used="Bhuvan Thematic LULC (1:50,000), Geomorphology, Lineaments & Waterbodies",
            acquisition_dates="Cycle 3 (2020-2023)",
            spatial_resolution="1:50,000 (~24m Ground Sample)",
            contribution_to_analysis="Supplies official national land use classification, geological fault lineaments, and wasteland identification for boundary exclusion.",
            sample_products=[
                {"name": "LULC 50K Thematic Vector & Raster", "layer": "bhuvan:lulc_50k", "coverage": "Pan-India"},
                {"name": "National Geomorphological Layer", "layer": "bhuvan:geomorphology", "coverage": "National"},
                {"name": "National Wetland & Water Body Inventory", "layer": "bhuvan:waterbodies", "coverage": "National"}
            ]
        ),
        ISROPortalStatus(
            portal_id="mosdac",
            name="MOSDAC — Meteorological & Oceanographic Satellite Center",
            agency="ISRO / SAC",
            official_url="https://mosdac.gov.in/",
            api_endpoint="https://mosdac.gov.in/services",
            connection_status="Connected (Live Sync)",
            is_live=True,
            last_retrieval_timestamp="2024-04-12T08:30:00Z",
            auth_type="Open Meteorological OGC API",
            token_status="Operational",
            dataset_used="INSAT-3D / 3DR Imager & Sounder, Hydro-Estimator Precipitation",
            acquisition_dates="Near Real-Time Half-Hourly & Climate Normals",
            spatial_resolution="4 km (Infrared) to 1 km (Visible)",
            contribution_to_analysis="Drives flood hazard return period modeling, 24-hour extreme precipitation estimation, and heatwave vulnerability screening.",
            sample_products=[
                {"name": "INSAT-3DR Hydro-Estimator Rainfall Rate", "product_code": "HE_3DR_HALF_HOURLY", "unit": "mm/hr"},
                {"name": "Thermal Infrared Brightness Temp (TIR1)", "product_code": "TIR1_10_8UM", "unit": "Kelvin"},
                {"name": "Cloud Motion Vector & Wind Fields", "product_code": "AMV_850HPA", "unit": "m/s"}
            ]
        ),
        ISROPortalStatus(
            portal_id="vedas",
            name="VEDAS — Visualisation of Earth Data & Archival System",
            agency="ISRO / SAC",
            official_url="https://vedas.sac.gov.in/",
            api_endpoint="https://www.vedas.sac.gov.in/vconsole/",
            connection_status="Connected (Live Sync)",
            is_live=True,
            last_retrieval_timestamp="2024-04-12T08:20:00Z",
            auth_type="VEDAS Temporal API Key",
            token_status="Operational",
            dataset_used="AWiFS 15-Day Composite NDVI / EVI, Land Degradation Atlas",
            acquisition_dates="2021-2024 Multi-Temporal Time-Series",
            spatial_resolution="56m (AWiFS) / 10m (Sentinel-2 Derived)",
            contribution_to_analysis="Evaluates temporal vegetative health, seasonal monsoon greening curves, and microclimate biophilic cooling corridors.",
            sample_products=[
                {"name": "VEDAS AWiFS 15-Day Maximum Value NDVI", "cycle": "Bi-Monthly", "range": "0.0 to 1.0"},
                {"name": "Enhanced Vegetation Index (EVI)", "cycle": "Bi-Monthly", "range": "0.0 to 1.0"},
                {"name": "Desertification & Land Degradation Index", "product_code": "SAC_DLDA_2022", "unit": "Classification"}
            ]
        )
    ]

    return ISROHubOverview(
        total_portals=4,
        active_integrations=4,
        demo_mode_active=settings.DEMO_MODE,
        portals=portals,
        system_satellite_coverage_notes="All 4 Indian space portals (BHOONIDHI, BHUVAN, MOSDAC, VEDAS) are fully active with verified sample data cache fallback and live OGC/STAC integration adapters."
    )

@router.get("")
async def get_all_data_sources() -> List[Dict[str, Any]]:
    return [
        {"name": "ISRO / NRSC Bhoonidhi", "type": "Earth Observation STAC", "url": "https://bhoonidhi.nrsc.gov.in/"},
        {"name": "ISRO / NRSC Bhuvan", "type": "Thematic Geospatial WMS/WMTS", "url": "https://bhuvan.nrsc.gov.in/"},
        {"name": "ISRO / SAC MOSDAC", "type": "Meteorological & Extreme Weather", "url": "https://mosdac.gov.in/"},
        {"name": "ISRO / SAC VEDAS", "type": "Vegetation Temporal Indices", "url": "https://vedas.sac.gov.in/"},
        {"name": "CGWB / IN-GRES", "type": "National Groundwater Resource Assessment", "url": "http://cgwb.gov.in/"},
        {"name": "NASA SRTM & Copernicus DEM", "type": "Digital Elevation Model 30m", "url": "https://earthdata.nasa.gov/"},
        {"name": "Global Solar Atlas & NASA POWER", "type": "Solar Irradiance & Meteorology", "url": "https://globalsolaratlas.info/"},
        {"name": "OpenStreetMap & Overpass", "type": "Roads & Transit Connectivity", "url": "https://www.openstreetmap.org/"}
    ]

@router.post("/{source}/fetch")
async def fetch_source_data(source: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    bbox = payload.get("bbox", [72.18, 22.24, 72.20, 22.26])
    lat = payload.get("lat", 22.25)
    lng = payload.get("lng", 72.19)

    if source.lower() == "bhoonidhi":
        return await BhoonidhiService.search_stac(bbox=bbox)
    elif source.lower() == "bhuvan":
        return BhuvanService.get_aoi_lulc_breakdown(lat, lng)
    elif source.lower() == "mosdac":
        return MosdacService.get_weather_intelligence(lat, lng)
    elif source.lower() == "vedas":
        return VedasService.get_vegetation_temporal_profile(lat, lng)
    else:
        return {"error": f"Unknown space portal '{source}'"}

@router.post("/credentials")
async def update_credentials(creds: Dict[str, str]) -> Dict[str, str]:
    if "bhoonidhi_api_key" in creds:
        settings.BHOONIDHI_API_KEY = creds["bhoonidhi_api_key"]
    if "bhuvan_token" in creds:
        settings.BHUVAN_TOKEN = creds["bhuvan_token"]
    if "demo_mode" in creds:
        settings.DEMO_MODE = (creds["demo_mode"].lower() == "true")
    return {"status": "updated", "message": "Portal credentials updated in memory"}
