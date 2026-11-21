"""
Terrain Analysis Module
Computes UTM slope with numpy.gradient, buildable share (<=15%), roughness (TRI std dev), and relief.
Evaluates dealbreaker rule: >30% of polygon has slope >30%.
"""

import math
from typing import Dict, Any, Tuple, Optional
import numpy as np

from backend.app.adapters import make_indicator
from backend.app.adapters.bhoonidhi import get_dem_filepath
from backend.app.analysis.zonal import extract_zonal_array, polygonize_mask_to_geojson


def analyze_terrain(
    region_id: str,
    polygon_geojson: Dict[str, Any]
) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
    """
    Performs terrain analysis over a candidate polygon using CartoDEM 30m.
    Returns:
        (indicators_dict, dealbreaker_geojson_or_None)
    """
    dem_path = get_dem_filepath(region_id)
    dem, valid_mask, transform, dt_ms = extract_zonal_array(dem_path, polygon_geojson, nodata=-9999.0)

    valid_cells = np.sum(valid_mask)
    if valid_cells == 0:
        return {}, None

    # Compute physical grid resolution in meters
    # transform[0] is pixel width (degrees lon), transform[4] is negative pixel height (degrees lat)
    deg_lon = abs(transform[0])
    deg_lat = abs(transform[4])
    
    # Estimate latitude from transform for metric projection
    center_lat = transform[5] + (dem.shape[0] / 2.0) * transform[4]
    
    dy_meters = deg_lat * 110574.0
    dx_meters = deg_lon * 111320.0 * math.cos(math.radians(center_lat))
    if dx_meters <= 0:
        dx_meters = 30.0
    if dy_meters <= 0:
        dy_meters = 30.0

    # Smooth DEM slightly to avoid single-pixel noise while preserving geomorphic breaklines
    dem_clean = dem.copy()
    dem_clean[~valid_mask] = np.nan

    # Fill nodata with local mean for smooth gradient calculation
    mean_val = float(np.nanmean(dem_clean))
    dem_filled = np.where(valid_mask, dem, mean_val)

    # UTM slope calculation using numpy.gradient in physical meters
    dz_dy, dz_dx = np.gradient(dem_filled, dy_meters, dx_meters)
    slope_rad = np.arctan(np.sqrt(dz_dx**2 + dz_dy**2))
    slope_deg = np.degrees(slope_rad)
    slope_pct = np.tan(slope_rad) * 100.0

    # Extract valid pixel values
    valid_slopes_deg = slope_deg[valid_mask]
    valid_slopes_pct = slope_pct[valid_mask]
    valid_elevations = dem[valid_mask]

    mean_slope_deg = float(np.mean(valid_slopes_deg))
    mean_slope_pct = float(np.mean(valid_slopes_pct))
    
    # Buildable share: fraction with slope <= 15% (<= ~8.53 degrees)
    buildable_count = int(np.sum(valid_slopes_pct <= 15.0))
    buildable_share_pct = round(float(buildable_count / valid_cells * 100.0), 2)

    # Steep slope (>30% slope, ~16.7 degrees): dealbreaker check
    steep_mask = valid_mask & (slope_pct > 30.0)
    steep_count = int(np.sum(steep_mask))
    steep_share_pct = round(float(steep_count / valid_cells * 100.0), 2)
    is_dealbreaker = steep_share_pct > 30.0

    # Roughness: Terrain Ruggedness Index (TRI) measured as std dev of slope
    tri_roughness = round(float(np.std(valid_slopes_deg)), 2)

    # Relief metrics
    min_elev = float(np.min(valid_elevations))
    max_elev = float(np.max(valid_elevations))
    mean_elev = float(np.mean(valid_elevations))
    relief_m = round(float(max_elev - min_elev), 1)

    indicators = {
        "mean_slope_deg": make_indicator(
            indicator="mean_slope_deg",
            value=round(mean_slope_deg, 2),
            unit="degrees",
            portal="Bhoonidhi",
            dataset="CartoDEM 30m v3R1",
            resolution="30m",
            vintage="2021",
            method="utm_gradient_metric_slope",
            confidence="high",
            details={
                "mean_slope_pct": round(mean_slope_pct, 2),
                "zonal_extraction_time_ms": round(dt_ms, 2)
            }
        ),
        "slope_buildable_share": make_indicator(
            indicator="slope_buildable_share",
            value=buildable_share_pct,
            unit="%",
            portal="Bhoonidhi",
            dataset="CartoDEM 30m v3R1",
            resolution="30m",
            vintage="2021",
            method="fraction_slope_under_15pct",
            confidence="high"
        ),
        "steep_slope_share_pct": make_indicator(
            indicator="steep_slope_share_pct",
            value=steep_share_pct,
            unit="%",
            portal="Bhoonidhi",
            dataset="CartoDEM 30m v3R1",
            resolution="30m",
            vintage="2021",
            method="fraction_slope_over_30pct",
            confidence="high",
            details={"is_dealbreaker": is_dealbreaker, "threshold_pct": 30.0}
        ),
        "terrain_roughness_tri": make_indicator(
            indicator="terrain_roughness_tri",
            value=tri_roughness,
            unit="std_deg",
            portal="Bhoonidhi",
            dataset="CartoDEM 30m v3R1",
            resolution="30m",
            vintage="2021",
            method="terrain_ruggedness_index_std",
            confidence="high"
        ),
        "elevation_relief_m": make_indicator(
            indicator="elevation_relief_m",
            value=relief_m,
            unit="m",
            portal="Bhoonidhi",
            dataset="CartoDEM 30m v3R1",
            resolution="30m",
            vintage="2021",
            method="min_max_differential",
            confidence="high",
            details={
                "min_elev_m": round(min_elev, 1),
                "max_elev_m": round(max_elev, 1),
                "mean_elev_m": round(mean_elev, 1)
            }
        )
    }

    dealbreaker_zones = None
    if is_dealbreaker:
        dealbreaker_zones = polygonize_mask_to_geojson(
            steep_mask,
            transform,
            properties={
                "dealbreaker_type": "steep_slope",
                "label": f"Excessive Steep Slope ({steep_share_pct}% > 30% slope)",
                "color": "#ef4444"
            }
        )

    return indicators, dealbreaker_zones
