"""Regional spatial cache loader and SQLite analysis store for TerraCity AI.

Handles:
- Loading pre-cached regional rasters and vectors (CartoDEM, HAND, LULC, flood, NDVI, rainfall, OSM).
- Fallback lookup to fixtures when live cache is incomplete or during offline testing.
- SQLite persistent storage for candidate site evaluations, MCA comparisons, and stress test scenarios.
"""

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

# Base paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", PROJECT_ROOT / "data")).resolve()
CONFIG_DIR = PROJECT_ROOT / "config"
CACHE_DIR = DATA_DIR / "cache" / "regions"
FIXTURES_DIR = DATA_DIR / "fixtures"
STATIC_DIR = DATA_DIR / "static"
DB_PATH = DATA_DIR / "analysis_store.db"


# ---------------------------------------------------------------------------
# Regional Spatial Cache Loader
# ---------------------------------------------------------------------------

class RegionalCache:
    """Manages access to regional spatial data files with automatic fixture fallback."""

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or DATA_DIR
        self.cache_dir = self.data_dir / "cache" / "regions"
        self.fixtures_dir = self.data_dir / "fixtures"
        self.static_dir = self.data_dir / "static"

    def get_loaded_regions(self) -> List[str]:
        """Return list of region IDs that have cache or fixture folders."""
        regions = set()
        if self.cache_dir.exists():
            for p in self.cache_dir.iterdir():
                if p.is_dir():
                    regions.add(p.name)
        if self.fixtures_dir.exists():
            for p in self.fixtures_dir.iterdir():
                if p.is_dir():
                    regions.add(p.name)
        # Always ensure primary demo regions are listed
        if not regions:
            regions = {"up_jewar", "dholera"}
        return sorted(list(regions))

    def get_raster_path(self, region_id: str, layer_name: str) -> Optional[Path]:
        """Find a raster file for a given region (e.g. dem.tif, hand.tif, lulc.tif, flood.tif, ndvi_grid.tif).
        
        Checks data/cache/regions/<region_id>/<layer_name> first, then data/fixtures/<region_id>/,
        then data/fixtures/<layer_name>.
        """
        if not layer_name.endswith(".tif"):
            filename = f"{layer_name}.tif"
        else:
            filename = layer_name

        # 1. Primary cache
        path = self.cache_dir / region_id / filename
        if path.exists():
            return path

        # 2. Region fixtures
        path = self.fixtures_dir / region_id / filename
        if path.exists():
            return path

        # 3. Global fixture fallback
        path = self.fixtures_dir / filename
        if path.exists():
            return path

        return None

    def get_rainfall_data(self, region_id: str) -> Optional[Dict[str, Any]]:
        """Load regional rainfall climatology JSON."""
        # Check cache
        path = self.cache_dir / region_id / "rainfall.json"
        if not path.exists():
            path = self.fixtures_dir / region_id / "rainfall.json"
        if not path.exists():
            path = self.fixtures_dir / "rainfall.json"

        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return None

    def get_osm_data(self, region_id: str) -> Optional[Dict[str, Any]]:
        """Load regional OSM infrastructure GeoJSON."""
        path = self.cache_dir / region_id / "osm_infra.geojson"
        if not path.exists():
            path = self.fixtures_dir / region_id / "osm_infra.geojson"
        if not path.exists():
            path = self.fixtures_dir / "osm_infra.geojson"

        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return None

    def get_static_geojson(self, filename: str) -> Optional[Dict[str, Any]]:
        """Load a static GeoJSON layer (e.g. seismic_zones.geojson, landslide_inventory.geojson)."""
        if not filename.endswith(".geojson"):
            filename = f"{filename}.geojson"

        path = self.static_dir / filename
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return None


# Global regional cache instance
regional_cache = RegionalCache()


# ---------------------------------------------------------------------------
# SQLite Analysis Store
# ---------------------------------------------------------------------------

class AnalysisStore:
    """Thread-safe SQLite persistent store for site scorecards, comparisons, and scenarios."""

    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or DB_PATH
        self._ensure_db_dir()
        self.init_db()

    def _ensure_db_dir(self):
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Create tables if they do not exist."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS analyses (
                    id TEXT PRIMARY KEY,
                    site_id TEXT,
                    site_name TEXT,
                    region_id TEXT,
                    area_km2 REAL,
                    overall_score REAL,
                    verdict TEXT,
                    preset_used TEXT,
                    is_disqualified INTEGER,
                    scorecard_json TEXT,
                    created_at TEXT
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scenarios (
                    id TEXT PRIMARY KEY,
                    region_id TEXT,
                    scenario_name TEXT,
                    horizon_year INTEGER,
                    request_json TEXT,
                    response_json TEXT,
                    created_at TEXT
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS comparisons (
                    id TEXT PRIMARY KEY,
                    region_id TEXT,
                    preset_used TEXT,
                    site_count INTEGER,
                    response_json TEXT,
                    created_at TEXT
                );
            """)
            conn.commit()

    def save_analysis(self, scorecard_data: Union[Dict[str, Any], Any]) -> str:
        """Store an analysis scorecard. Returns generated analysis_id."""
        analysis_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        if hasattr(scorecard_data, "model_dump"):
            data = scorecard_data.model_dump()
        elif hasattr(scorecard_data, "dict"):
            data = scorecard_data.dict()
        else:
            data = dict(scorecard_data)

        site_id = data.get("site_id", "")
        site_name = data.get("site_name", "")
        region_id = data.get("region_id", "")
        area_km2 = float(data.get("area_km2", 0.0))
        overall_score = float(data.get("overall_score", 0.0))
        verdict = str(data.get("verdict", ""))
        preset_used = str(data.get("preset_used", "balanced"))
        is_disqualified = 1 if data.get("is_disqualified", False) else 0
        scorecard_json = json.dumps(data)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO analyses (
                    id, site_id, site_name, region_id, area_km2,
                    overall_score, verdict, preset_used, is_disqualified,
                    scorecard_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                analysis_id, site_id, site_name, region_id, area_km2,
                overall_score, verdict, preset_used, is_disqualified,
                scorecard_json, created_at
            ))
            conn.commit()

        return analysis_id

    def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a saved analysis scorecard by ID."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT scorecard_json FROM analyses WHERE id = ?", (analysis_id,))
            row = cursor.fetchone()
            if row:
                return json.loads(row["scorecard_json"])
        return None

    def list_analyses(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List recent analyses metadata."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, site_id, site_name, region_id, area_km2,
                       overall_score, verdict, preset_used, is_disqualified, created_at
                FROM analyses
                ORDER BY created_at DESC
                LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def save_scenario(
        self,
        request_data: Union[Dict[str, Any], Any],
        response_data: Union[Dict[str, Any], Any]
    ) -> str:
        """Store a scenario run result. Returns generated scenario_id."""
        scenario_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        req = request_data.model_dump() if hasattr(request_data, "model_dump") else dict(request_data)
        resp = response_data.model_dump() if hasattr(response_data, "model_dump") else dict(response_data)

        region_id = req.get("region_id", "up_jewar")
        scenario_name = resp.get("scenario_name", "baseline")
        horizon_year = int(resp.get("horizon_year", 2050))

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO scenarios (
                    id, region_id, scenario_name, horizon_year,
                    request_json, response_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                scenario_id, region_id, scenario_name, horizon_year,
                json.dumps(req), json.dumps(resp), created_at
            ))
            conn.commit()

        return scenario_id

    def get_scenario(self, scenario_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a saved scenario run response by ID."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT response_json FROM scenarios WHERE id = ?", (scenario_id,))
            row = cursor.fetchone()
            if row:
                return json.loads(row["response_json"])
        return None

    def save_comparison(self, comparison_data: Union[Dict[str, Any], Any]) -> str:
        """Store a comparison run result. Returns comparison_id."""
        comp_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        data = comparison_data.model_dump() if hasattr(comparison_data, "model_dump") else dict(comparison_data)
        region_id = data.get("region_id", "up_jewar")
        preset_used = data.get("preset_used", "balanced")
        site_count = len(data.get("rankings", []))

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO comparisons (
                    id, region_id, preset_used, site_count, response_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                comp_id, region_id, preset_used, site_count, json.dumps(data), created_at
            ))
            conn.commit()

        return comp_id

    def get_comparison(self, comp_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a saved comparison result by ID."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT response_json FROM comparisons WHERE id = ?", (comp_id,))
            row = cursor.fetchone()
            if row:
                return json.loads(row["response_json"])
        return None


# Global analysis store instance
analysis_store = AnalysisStore()
