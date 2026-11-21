from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routes import (
    site, terrain, soil, water, climate, energy, vegetation, city, isro, advisor, reports
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Geospatial intelligence platform for AI-powered sustainable smart city planning integrating ISRO satellite data (Bhoonidhi, Bhuvan, MOSDAC, VEDAS), CGWB groundwater assessments, and dynamic future simulations."
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routes
app.include_router(site.router)
app.include_router(terrain.router)
app.include_router(soil.router)
app.include_router(water.router)
app.include_router(climate.router)
app.include_router(energy.router)
app.include_router(vegetation.router)
app.include_router(city.router)
app.include_router(isro.router)
app.include_router(advisor.router)
app.include_router(reports.router)

@app.get("/")
async def root():
    return {
        "platform": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "OPERATIONAL",
        "demo_mode": settings.DEMO_MODE,
        "space_data_integrations": [
            "ISRO / NRSC Bhoonidhi (STAC API v1.0.0)",
            "ISRO / NRSC Bhuvan (OGC WMS/WMTS 50K Thematic LULC)",
            "ISRO / SAC MOSDAC (INSAT-3D/3DR Hydro-Estimator)",
            "ISRO / SAC VEDAS (AWiFS/Sentinel-2 15-Day NDVI)"
        ],
        "authoritative_sources": [
            "CGWB / IN-GRES Dynamic Ground Water Resources",
            "NASA SRTM 30m / Copernicus DEM",
            "NASA POWER Solar & Meteorological Database",
            "ICAR National Bureau of Soil Survey & Land Use Planning"
        ]
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "demo_mode": settings.DEMO_MODE,
        "active_modules": [
            "TerraSite AI", "TerraTerrain AI", "TerraSoil AI", "TerraWater AI",
            "TerraClimate AI", "TerraEnergy AI", "TerraVegetation AI",
            "TerraCity Designer", "TerraFuture AI", "TerraAdvisor AI", "ISRO Space Hub"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
