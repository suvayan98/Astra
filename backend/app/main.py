"""FastAPI Application entrypoint for TerraCity AI.

Space-Driven Greenfield Urban Site Screening & Resilience Stress-Testing
ASTRA 2026 Hackathon (Theme: Space)
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.cache import analysis_store, regional_cache
from backend.app.api.health import router as health_router
from backend.app.api.regions import router as regions_router
from backend.app.api.layers import router as layers_router
from backend.app.api.sources import router as sources_router
from backend.app.api.proxy import router as proxy_router
from backend.app.api.analyze import router as analyze_router
from backend.app.api.compare import router as compare_router
from backend.app.api.scenarios import router as scenarios_router
from backend.app.api.report import router as report_router
from backend.app.api.export import router as export_router

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
STATIC_DIR = PROJECT_ROOT / "data" / "static"


def load_env_file():
    """Load .env file into environment variables on startup."""
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if "#" in v:
                            v = v.split("#", 1)[0]
                        k, v = k.strip(), v.strip().strip('"').strip("'")
                        if k:
                            os.environ[k] = v
        except Exception:
            pass


load_env_file()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    # Startup
    analysis_store.init_db()
    loaded_regions = regional_cache.get_loaded_regions()
    offline_mode = os.getenv("OFFLINE_MODE", "true").lower() in ("true", "1", "yes")
    print(f"TerraCity AI Engine Initialized.")
    print(f"Offline Mode: {offline_mode} | Loaded Regions: {loaded_regions}")
    yield
    # Shutdown
    print("TerraCity AI Engine Shutdown cleanly.")


app = FastAPI(
    title="TerraCity AI API",
    description=(
        "Space-Driven Greenfield Urban Site Screening & Resilience Stress-Testing. "
        "Integrates Bhoonidhi (CartoDEM 30m), Bhuvan (LULC & Flood Hazards), "
        "MOSDAC (INSAT-3D Rainfall Climatology), and VEDAS (Sentinel-2 NDVI)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# CORS Middleware Configuration
# ---------------------------------------------------------------------------
cors_env = os.getenv("CORS_ORIGINS", "")
if cors_env:
    origins = [orig.strip() for orig in cors_env.split(",") if orig.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://project--astra.web.app",
        "https://project--astra.firebaseapp.com",
        "https://project-astra-6p3.pages.dev",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in origins else origins,
    allow_origin_regex=r"https://.*(\.pages\.dev|\.web\.app|\.firebaseapp\.com|\.onrender\.com|\.railway\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# ---------------------------------------------------------------------------
# Global Exception Handlers
# ---------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle 422 validation errors with clear actionable messages."""
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        errors.append(f"{field}: {msg}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "; ".join(errors),
            "details": exc.errors()
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardize HTTP exception responses."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "Request Error",
            "message": exc.detail
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all unexpected error handler."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": str(exc)
        }
    )


# ---------------------------------------------------------------------------
# Router Inclusions
# ---------------------------------------------------------------------------
app.include_router(health_router, prefix="/api")
app.include_router(regions_router, prefix="/api")
app.include_router(layers_router, prefix="/api")
app.include_router(sources_router, prefix="/api")
app.include_router(proxy_router, prefix="/api")
app.include_router(analyze_router, prefix="/api")
app.include_router(compare_router, prefix="/api")
app.include_router(scenarios_router, prefix="/api")
app.include_router(report_router, prefix="/api")
app.include_router(export_router, prefix="/api")


# ---------------------------------------------------------------------------
# Static Route Mounts & Root Endpoint
# ---------------------------------------------------------------------------
if STATIC_DIR.exists():
    app.mount("/static/data", StaticFiles(directory=str(STATIC_DIR)), name="static_data")

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="frontend_assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    async def root():
        return {
            "name": "TerraCity AI API Server",
            "status": "online",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/api/health",
            "regions": "/api/regions",
            "layers": "/api/layers",
            "sources": "/api/sources"
        }
