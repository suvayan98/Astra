from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.site_routes import router as site_router
from app.api.analysis_routes import router as analysis_router
from app.api.city_routes import router as city_router
from app.api.advisor_routes import router as advisor_router
from app.api.isro_routes import router as isro_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TerraAI — AI-Powered Sustainable Smart City Planning Platform integrating Indian Space Portals (Bhoonidhi, Bhuvan, MOSDAC, VEDAS) with multi-criteria geospatial intelligence and dynamic future simulations.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware for seamless React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular routers
app.include_router(site_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(city_router, prefix="/api")
app.include_router(advisor_router, prefix="/api")
app.include_router(isro_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "TerraAI",
        "description": "AI-Powered Sustainable Smart City Planning Platform",
        "version": settings.VERSION,
        "isro_space_data_hub": "/api/data-sources/status",
        "interactive_docs": "/docs",
        "status": "operational"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "demo_mode": settings.DEMO_MODE,
        "active_modules": [
            "TerraSite AI (Module A)",
            "TerraTerrain AI (Module B)",
            "TerraSoil AI (Module C)",
            "TerraWater AI (Module D)",
            "TerraClimate AI (Module E)",
            "TerraEnergy AI (Module F)",
            "TerraVegetation AI (Module G)",
            "TerraCity Designer (Module H)",
            "TerraFuture AI (Module I)",
            "TerraAdvisor AI (Module J)",
            "ISRO Space Data Hub (Bhoonidhi, Bhuvan, MOSDAC, VEDAS)"
        ]
    }
