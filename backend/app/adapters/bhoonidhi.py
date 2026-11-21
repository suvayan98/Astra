"""
Bhoonidhi Adapter (NRSC Open Data Archive)
Accesses CartoDEM Version 3 R1 (30m) digital elevation models.
Supports live API with token authentication, token caching, and try/finally logout,
with robust offline fallback to local cached GeoTIFF fixtures.
"""

import os
import json
import time
from typing import Dict, Any, Optional, Tuple
import rasterio
from rasterio.mask import mask
import numpy as np

from backend.app.adapters import make_indicator

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CACHE_DIR = os.path.join(BASE_DIR, "data", "cache", "regions")
FIXTURES_DIR = os.path.join(BASE_DIR, "data", "fixtures")
TOKEN_CACHE_FILE = os.path.join(BASE_DIR, "data", "cache", "bhoonidhi_token.json")


class BhoonidhiClient:
    """
    Client for Bhoonidhi NRSC Open Data Archive.
    Implements session lifecycle with token cache and try/finally logout.
    """
    def __init__(self, api_url: Optional[str] = None, username: Optional[str] = None, password: Optional[str] = None):
        self._load_env()
        self.api_url = api_url or os.getenv("BHOONIDHI_API_URL", "https://bhoonidhi-api.nrsc.gov.in")
        self.username = username or os.getenv("BHOONIDHI_USER") or os.getenv("BHOONIDHI_USERNAME")
        self.password = password or os.getenv("BHOONIDHI_PASSWORD")
        self.token = None
        self.refresh_token = None
        self.token_expiry = 0

    def _load_env(self):
        env_file = os.path.join(BASE_DIR, ".env")
        if os.path.exists(env_file):
            try:
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            if "#" in v:
                                v = v.split("#", 1)[0]
                            k, v = k.strip(), v.strip().strip('"').strip("'")
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

    def _load_cached_token(self) -> Optional[str]:
        if os.path.exists(TOKEN_CACHE_FILE):
            try:
                with open(TOKEN_CACHE_FILE, "r") as f:
                    data = json.load(f)
                    if data.get("expires_at", 0) > time.time() + 60:
                        self.token = data.get("token")
                        self.refresh_token = data.get("refresh_token")
                        return self.token
            except Exception:
                pass
        return None

    def _save_cached_token(self, token: str, refresh_token: Optional[str] = None, ttl_seconds: int = 1200):
        os.makedirs(os.path.dirname(TOKEN_CACHE_FILE), exist_ok=True)
        try:
            with open(TOKEN_CACHE_FILE, "w") as f:
                json.dump({
                    "token": token,
                    "refresh_token": refresh_token,
                    "expires_at": time.time() + ttl_seconds
                }, f)
        except Exception:
            pass

    def login(self) -> Optional[str]:
        """Authenticate and obtain JWT bearer token, using cache if valid."""
        cached = self._load_cached_token()
        if cached:
            self.token = cached
            return self.token

        if not self.username or not self.password:
            # Running in offline fixture mode
            return None

        try:
            import httpx
            with httpx.Client(timeout=10.0, verify=False) as client:
                resp = client.post(
                    f"{self.api_url}/auth/token",
                    json={"userId": self.username, "password": self.password, "grant_type": "password"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    self.token = data.get("access_token") or data.get("token")
                    self.refresh_token = data.get("refresh_token")
                    expires_in = data.get("expires_in", 1200)
                    self._save_cached_token(self.token, self.refresh_token, expires_in)
                    return self.token
        except Exception:
            pass
        return None

    def logout(self):
        """Invalidates active token on server and clears local cache."""
        token_to_revoke = self.refresh_token or self.token
        if not token_to_revoke:
            return
        try:
            if self.username and self.password:
                import httpx
                with httpx.Client(timeout=5.0, verify=False) as client:
                    client.post(
                        f"{self.api_url}/auth/logout",
                        headers={"Authorization": f"Bearer {token_to_revoke}"}
                    )
        except Exception:
            pass
        finally:
            self.token = None
            self.refresh_token = None
            if os.path.exists(TOKEN_CACHE_FILE):
                try:
                    os.remove(TOKEN_CACHE_FILE)
                except Exception:
                    pass


def get_dem_filepath(region_id: str) -> str:
    """Finds the DEM GeoTIFF path in cache or fixtures."""
    cache_path = os.path.join(CACHE_DIR, region_id, "dem.tif")
    if os.path.exists(cache_path):
        return cache_path
    fixture_path = os.path.join(FIXTURES_DIR, region_id, "dem.tif")
    if os.path.exists(fixture_path):
        return fixture_path
    raise FileNotFoundError(f"DEM GeoTIFF not found for region {region_id}")


def get_hand_filepath(region_id: str) -> Optional[str]:
    """Finds the HAND GeoTIFF path in cache or fixtures."""
    cache_path = os.path.join(CACHE_DIR, region_id, "hand.tif")
    if os.path.exists(cache_path):
        return cache_path
    fixture_path = os.path.join(FIXTURES_DIR, region_id, "hand.tif")
    if os.path.exists(fixture_path):
        return fixture_path
    return None


def fetch_dem_indicators(region_id: str, polygon_geojson: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Extracts elevation and relief indicators for a region or polygon.
    Returns standard IndicatorValue dicts.
    """
    dem_path = get_dem_filepath(region_id)
    
    with rasterio.open(dem_path) as src:
        if polygon_geojson:
            geom = [polygon_geojson.get("geometry", polygon_geojson)]
            out_image, _ = mask(src, geom, crop=True, nodata=-9999.0)
            data = out_image[0]
            valid_mask = data != -9999.0
            elevations = data[valid_mask]
        else:
            data = src.read(1)
            valid_mask = (data != src.nodata) if src.nodata is not None else np.isfinite(data)
            elevations = data[valid_mask]

    if len(elevations) == 0:
        return {}

    min_elev = float(np.min(elevations))
    max_elev = float(np.max(elevations))
    mean_elev = float(np.mean(elevations))
    relief = float(max_elev - min_elev)

    return {
        "elevation_mean_m": make_indicator(
            indicator="elevation_mean_m",
            value=round(mean_elev, 1),
            unit="m",
            portal="Bhoonidhi",
            dataset="CartoDEM 30m v3R1",
            resolution="30m",
            vintage="2021",
            method="stereoscopic_photogrammetry",
            confidence="high"
        ),
        "elevation_relief_m": make_indicator(
            indicator="elevation_relief_m",
            value=round(relief, 1),
            unit="m",
            portal="Bhoonidhi",
            dataset="CartoDEM 30m v3R1",
            resolution="30m",
            vintage="2021",
            method="stereoscopic_photogrammetry",
            confidence="high",
            details={"min_elevation_m": round(min_elev, 1), "max_elevation_m": round(max_elev, 1)}
        )
    }
