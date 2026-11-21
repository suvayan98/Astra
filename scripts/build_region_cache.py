"""
build_region_cache.py
Generates realistic synthetic GeoTIFF and GeoJSON regional datasets for TerraCity AI.
Generates:
- UP Jewar (up_jewar): full 4-portal (CartoDEM 30m, Bhuvan LULC & Flood, MOSDAC Rainfall, VEDAS NDVI, OSM)
- Dholera (dholera): HAND proxy fallback (CartoDEM 30m, Bhuvan LULC, MOSDAC Rainfall, VEDAS NDVI, HAND grid, OSM)
"""

import os
import json
import numpy as np
import rasterio
from rasterio.transform import from_bounds
from rasterio.enums import Resampling

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(BASE_DIR, "data", "cache", "regions")
FIXTURES_DIR = os.path.join(BASE_DIR, "data", "fixtures")


def ensure_dirs():
    os.makedirs(os.path.join(CACHE_DIR, "up_jewar"), exist_ok=True)
    os.makedirs(os.path.join(CACHE_DIR, "dholera"), exist_ok=True)
    os.makedirs(os.path.join(FIXTURES_DIR, "up_jewar"), exist_ok=True)
    os.makedirs(os.path.join(FIXTURES_DIR, "dholera"), exist_ok=True)


def write_geotiff(filepath, data, bbox, nodata=None, dtype=None):
    """
    Writes a 2D numpy array as a GeoTIFF.
    bbox: [min_lon, min_lat, max_lon, max_lat]
    """
    min_lon, min_lat, max_lon, max_lat = bbox
    height, width = data.shape
    transform = from_bounds(min_lon, min_lat, max_lon, max_lat, width, height)
    
    if dtype is None:
        dtype = data.dtype

    profile = {
        'driver': 'GTiff',
        'height': height,
        'width': width,
        'count': 1,
        'dtype': dtype,
        'crs': 'EPSG:4326',
        'transform': transform,
        'compress': 'lzw'
    }
    if nodata is not None:
        profile['nodata'] = nodata

    with rasterio.open(filepath, 'w', **profile) as dst:
        dst.write(data.astype(dtype), 1)
    print(f"Wrote {filepath} ({width}x{height}, dtype={dtype})")


def generate_jewar_datasets():
    print("Generating UP Jewar datasets...")
    region_dir = os.path.join(CACHE_DIR, "up_jewar")
    fixtures_region_dir = os.path.join(FIXTURES_DIR, "up_jewar")
    bbox = [77.48, 28.10, 77.68, 28.28] # [min_lon, min_lat, max_lon, max_lat]
    width, height = 400, 360 # approx 50m resolution
    
    # Coordinate grids
    lons = np.linspace(bbox[0], bbox[2], width)
    lats = np.linspace(bbox[3], bbox[1], height) # top to bottom
    lon_grid, lat_grid = np.meshgrid(lons, lats)
    
    # 1. DEM (CartoDEM 30m equivalent)
    # Indo-Gangetic plain gently slopes from North-West to South-East (205m down to 192m)
    # Yamuna river incision on Western boundary (lon ~77.49 - 77.51) elevation ~188m
    base_elev = 205.0 - (lat_grid - 28.10) * 10.0 - (lon_grid - 77.48) * 20.0
    # Add gentle micro-topography and dunes/embankments
    micro_topo = (
        np.sin(lon_grid * 250) * 1.5 +
        np.cos(lat_grid * 220) * 1.8 +
        np.sin(lon_grid * 60 + lat_grid * 50) * 2.2
    )
    # River trench near western side
    dist_to_river = np.abs(lon_grid - (77.495 + 0.01 * np.sin((lat_grid - 28.10) * 30)))
    river_depression = np.exp(- (dist_to_river / 0.015) ** 2) * 8.0
    
    dem = (base_elev + micro_topo - river_depression).astype(np.float32)
    
    # 2. HAND (Height Above Nearest Drainage)
    # Yamuna river channel is at HAND ~ 0. Lowland margin 0-2m. Upland 4-15m.
    hand = (dist_to_river / 0.06 * 10.0 + (dem - 188.0) * 0.4).clip(0.1, 18.0).astype(np.float32)
    
    # 3. LULC (Bhuvan 50k classes):
    # 1: Built-up, 2: Cropland, 3: Forest/Plantation, 4: Wasteland/Scrubland, 5: Water, 6: Wetland
    lulc = np.full((height, width), 2, dtype=np.uint8) # Default: Cropland
    
    # Water body along Yamuna
    water_mask = dist_to_river < 0.006
    lulc[water_mask] = 5 # Water
    
    # Wetland along floodplain
    wetland_mask = (dist_to_river >= 0.006) & (dist_to_river < 0.016) & (hand < 2.0)
    lulc[wetland_mask] = 6 # Wetland
    
    # Built-up zones (Jewar town, industrial corridors along Yamuna Expressway lon ~77.55-77.58)
    expressway_mask = np.abs(lon_grid - 77.56) < 0.008
    town_mask = ((lon_grid - 77.55)**2 + (lat_grid - 28.13)**2) < 0.015**2
    lulc[town_mask | (expressway_mask & (lat_grid < 28.20))] = 1 # Built-up
    
    # Wasteland / Scrubland (open parcels suitable for development)
    wasteland_mask = (lon_grid > 77.52) & (lon_grid < 77.57) & (lat_grid > 28.21) & (lat_grid < 28.25) & (~water_mask)
    lulc[wasteland_mask] = 4 # Wasteland
    
    # Forest / Plantation patches
    forest_mask = ((lon_grid - 77.63)**2 + (lat_grid - 28.24)**2) < 0.012**2
    lulc[forest_mask] = 3 # Forest
    
    # 4. Flood Inundation Hazard (Bhuvan Disaster Management Support Group)
    # 0: None, 1: Low, 2: Moderate, 3: High
    flood = np.zeros((height, width), dtype=np.uint8)
    flood[dist_to_river < 0.012] = 3 # High hazard in river trench
    flood[(dist_to_river >= 0.012) & (dist_to_river < 0.022) & (hand < 2.5)] = 2 # Moderate
    flood[(dist_to_river >= 0.022) & (dist_to_river < 0.035) & (hand < 3.5)] = 1 # Low
    
    # 5. NDVI Grid (VEDAS Sentinel-2 10m resampled to ~50m)
    # Water: -0.15 to 0.05
    # Built-up: 0.10 to 0.18
    # Wasteland: 0.14 to 0.24
    # Cropland: 0.45 to 0.68
    # Forest: 0.65 to 0.82
    ndvi = np.full((height, width), 0.52, dtype=np.float32)
    ndvi[lulc == 5] = -0.12 # Water
    ndvi[lulc == 6] = 0.35  # Wetland
    ndvi[lulc == 1] = 0.14  # Built-up
    ndvi[lulc == 4] = 0.19  # Wasteland
    ndvi[lulc == 3] = 0.74  # Forest
    # Add natural spatial variation
    ndvi += np.random.normal(0, 0.03, (height, width)).astype(np.float32)
    ndvi = np.clip(ndvi, -0.25, 0.88)
    
    # Write GeoTIFFs to cache and fixtures
    for target_dir in [region_dir, fixtures_region_dir]:
        write_geotiff(os.path.join(target_dir, "dem.tif"), dem, bbox, nodata=-9999.0)
        write_geotiff(os.path.join(target_dir, "hand.tif"), hand, bbox, nodata=-9999.0)
        write_geotiff(os.path.join(target_dir, "lulc.tif"), lulc, bbox, nodata=0, dtype=np.uint8)
        write_geotiff(os.path.join(target_dir, "flood.tif"), flood, bbox, nodata=255, dtype=np.uint8)
        write_geotiff(os.path.join(target_dir, "ndvi_grid.tif"), ndvi, bbox, nodata=-9999.0)

    # 6. MOSDAC Rainfall JSON
    rainfall_data = {
        "region_id": "up_jewar",
        "station": "Jewar / Greater Noida Agro-Met Cell",
        "source": "MOSDAC INSAT-3D / 3DR Hydro-Estimator Climatology",
        "portal": "MOSDAC",
        "dataset": "INSAT-3D Rainfall",
        "vintage": "2014-2024 (10-yr mean)",
        "resolution": "4km regionalized",
        "confidence": "high",
        "annual_rainfall_mean_mm": 742.6,
        "annual_rainfall_std_mm": 185.4,
        "rainfall_cv_pct": 24.96,
        "dry_months_count": 5,
        "drought_exposure_index": "moderate",
        "monthly_climatology_mm": {
            "Jan": 14.2,
            "Feb": 18.5,
            "Mar": 11.4,
            "Apr": 8.6,
            "May": 22.1,
            "Jun": 68.4,
            "Jul": 228.0,
            "Aug": 235.6,
            "Sep": 112.8,
            "Oct": 15.2,
            "Nov": 4.1,
            "Dec": 3.7
        },
        "annual_series_2014_2023": [
            {"year": 2014, "rainfall_mm": 680.2},
            {"year": 2015, "rainfall_mm": 612.4},
            {"year": 2016, "rainfall_mm": 724.8},
            {"year": 2017, "rainfall_mm": 810.1},
            {"year": 2018, "rainfall_mm": 795.0},
            {"year": 2019, "rainfall_mm": 690.4},
            {"year": 2020, "rainfall_mm": 845.2},
            {"year": 2021, "rainfall_mm": 910.8},
            {"year": 2022, "rainfall_mm": 678.5},
            {"year": 2023, "rainfall_mm": 738.6}
        ],
        "groundwater_prospect": "Good to Moderate (Alluvial Deep Aquifer, Trans-Yamuna recharge belt)"
    }
    
    for target_dir in [region_dir, fixtures_region_dir]:
        with open(os.path.join(target_dir, "rainfall.json"), "w", encoding="utf-8") as f:
            json.dump(rainfall_data, f, indent=2)

    # 7. OSM Infrastructure GeoJSON
    osm_infra = {
        "type": "FeatureCollection",
        "name": "OSM_Infrastructure_UP_Jewar",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Yamuna Expressway (6-lane access controlled)",
                    "type": "highway",
                    "highway_class": "motorway",
                    "speed_limit_kmh": 120
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [77.562, 28.100],
                        [77.560, 28.150],
                        [77.558, 28.200],
                        [77.555, 28.250],
                        [77.552, 28.280]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Jewar Airport Link Road / SH-22A",
                    "type": "highway",
                    "highway_class": "primary"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [77.500, 28.180],
                        [77.540, 28.190],
                        [77.580, 28.195],
                        [77.640, 28.210],
                        [77.670, 28.220]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Jewar 400/220kV Grid Substation",
                    "type": "substation",
                    "voltage_kv": 400,
                    "operator": "UPPTCL"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [77.558, 28.205]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Noida International Airport Primary Substation (220kV)",
                    "type": "substation",
                    "voltage_kv": 220,
                    "operator": "YAPTL"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [77.595, 28.165]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Kailash Multi-Specialty Hospital Jewar Extension",
                    "type": "hospital",
                    "beds": 250,
                    "amenity": "hospital"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [77.550, 28.140]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Government Polytechnic Institute Jewar",
                    "type": "school",
                    "amenity": "college"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [77.545, 28.135]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Sector 28 Knowledge & Education Hub",
                    "type": "school",
                    "amenity": "university"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [77.540, 28.225]
                }
            }
        ]
    }
    
    for target_dir in [region_dir, fixtures_region_dir]:
        with open(os.path.join(target_dir, "osm_infra.geojson"), "w", encoding="utf-8") as f:
            json.dump(osm_infra, f, indent=2)

    print("UP Jewar datasets generated successfully.")


def generate_dholera_datasets():
    print("Generating Dholera datasets...")
    region_dir = os.path.join(CACHE_DIR, "dholera")
    fixtures_region_dir = os.path.join(FIXTURES_DIR, "dholera")
    bbox = [72.10, 22.15, 72.35, 22.35] # [min_lon, min_lat, max_lon, max_lat]
    width, height = 500, 400 # approx 50m resolution
    
    lons = np.linspace(bbox[0], bbox[2], width)
    lats = np.linspace(bbox[3], bbox[1], height)
    lon_grid, lat_grid = np.meshgrid(lons, lats)
    
    # 1. DEM (CartoDEM 30m equivalent)
    # Gulf of Khambhat mudflats on South-East (elevation ~3-5m), gently rising North-West to ~18-24m
    base_elev = 6.0 + (lat_grid - 22.15) * 45.0 - (lon_grid - 72.10) * 20.0
    # Gentle salt flat depressions and tidal creek incisions
    creek_x = 72.28 + 0.02 * np.sin((lat_grid - 22.15) * 25)
    dist_to_creek = np.abs(lon_grid - creek_x)
    creek_depression = np.exp(- (dist_to_creek / 0.02) ** 2) * 4.0
    
    micro_relief = (
        np.sin(lon_grid * 200) * 0.8 +
        np.cos(lat_grid * 180) * 0.9
    )
    
    dem = (base_elev + micro_relief - creek_depression).clip(1.5, 30.0).astype(np.float32)
    
    # 2. HAND (Height Above Nearest Drainage)
    # Critical for Dholera: Bhuvan flood is partial/missing, HAND proxy is used!
    # Lowland tidal creeks have HAND < 2m (triggers flood proxy)
    # Inland TP1 area has HAND 3-8m (safe)
    hand = ((dem - 2.5) * 0.7 + dist_to_creek * 50.0).clip(0.1, 14.0).astype(np.float32)
    # Force low HAND (<2m) near coastal margin (Site B area: lon 72.26-72.31, lat 22.16-22.20)
    coastal_margin = (lon_grid >= 72.25) & (lat_grid <= 22.21)
    hand[coastal_margin] = np.clip(hand[coastal_margin] * 0.25, 0.2, 1.8)
    
    # 3. LULC (Bhuvan 50k classes):
    # 1: Built-up, 2: Cropland, 3: Forest, 4: Wasteland/Saline flat, 5: Water, 6: Wetland
    lulc = np.full((height, width), 4, dtype=np.uint8) # High wasteland/scrub in semi-arid Bhal
    
    # Saline mudflats / wetland near Gulf
    tidal_mask = (lon_grid > 72.27) & (lat_grid < 22.21)
    lulc[tidal_mask] = 6 # Wetland / Mudflat
    
    # Creeks / water
    lulc[dist_to_creek < 0.005] = 5
    
    # Inland agriculture / cropland patches
    cropland_mask = (lon_grid < 72.18) & (lat_grid > 22.24)
    lulc[cropland_mask] = 2
    
    # TP1 Activation area built-up / developed
    tp1_mask = (lon_grid >= 72.19) & (lon_grid <= 72.22) & (lat_grid >= 22.23) & (lat_grid <= 22.25)
    lulc[tp1_mask] = 1 # Built-up
    
    # 4. Flood Inundation Hazard (Bhuvan - simulated as sparse/unavailable in Dholera)
    # In Dholera, Bhuvan flood data has no coverage or zero recorded, triggering HAND proxy fallback
    flood = np.zeros((height, width), dtype=np.uint8)
    
    # 5. NDVI Grid (VEDAS Sentinel-2)
    # Semi-arid coastal saline plain: lower mean NDVI (~0.18-0.30)
    ndvi = np.full((height, width), 0.22, dtype=np.float32)
    ndvi[lulc == 5] = -0.15 # Water
    ndvi[lulc == 6] = 0.12  # Salt flat / wetland
    ndvi[lulc == 1] = 0.11  # Built-up
    ndvi[lulc == 4] = 0.20  # Wasteland / scrub
    ndvi[lulc == 2] = 0.48  # Cropland
    ndvi += np.random.normal(0, 0.025, (height, width)).astype(np.float32)
    ndvi = np.clip(ndvi, -0.20, 0.75)
    
    for target_dir in [region_dir, fixtures_region_dir]:
        write_geotiff(os.path.join(target_dir, "dem.tif"), dem, bbox, nodata=-9999.0)
        write_geotiff(os.path.join(target_dir, "hand.tif"), hand, bbox, nodata=-9999.0)
        write_geotiff(os.path.join(target_dir, "lulc.tif"), lulc, bbox, nodata=0, dtype=np.uint8)
        write_geotiff(os.path.join(target_dir, "flood.tif"), flood, bbox, nodata=255, dtype=np.uint8)
        write_geotiff(os.path.join(target_dir, "ndvi_grid.tif"), ndvi, bbox, nodata=-9999.0)

    # 6. MOSDAC Rainfall JSON
    rainfall_data = {
        "region_id": "dholera",
        "station": "Dholera SIR Agro-Met Observation Tower",
        "source": "MOSDAC INSAT-3D / 3DR Hydro-Estimator Climatology",
        "portal": "MOSDAC",
        "dataset": "INSAT-3D Rainfall",
        "vintage": "2014-2024 (10-yr mean)",
        "resolution": "4km regionalized",
        "confidence": "high",
        "annual_rainfall_mean_mm": 586.2,
        "annual_rainfall_std_mm": 218.4,
        "rainfall_cv_pct": 37.26,
        "dry_months_count": 8,
        "drought_exposure_index": "high",
        "monthly_climatology_mm": {
            "Jan": 1.2,
            "Feb": 1.8,
            "Mar": 2.1,
            "Apr": 1.5,
            "May": 6.8,
            "Jun": 54.2,
            "Jul": 218.5,
            "Aug": 192.4,
            "Sep": 92.1,
            "Oct": 11.4,
            "Nov": 3.0,
            "Dec": 0.9
        },
        "annual_series_2014_2023": [
            {"year": 2014, "rainfall_mm": 520.1},
            {"year": 2015, "rainfall_mm": 395.4},
            {"year": 2016, "rainfall_mm": 610.2},
            {"year": 2017, "rainfall_mm": 680.5},
            {"year": 2018, "rainfall_mm": 380.1},
            {"year": 2019, "rainfall_mm": 740.3},
            {"year": 2020, "rainfall_mm": 810.0},
            {"year": 2021, "rainfall_mm": 510.4},
            {"year": 2022, "rainfall_mm": 625.0},
            {"year": 2023, "rainfall_mm": 590.2}
        ],
        "groundwater_prospect": "Poor to Saline (Coastal Bhal Tract, Brackish shallow aquifer, Narmada canal reliant)"
    }
    
    for target_dir in [region_dir, fixtures_region_dir]:
        with open(os.path.join(target_dir, "rainfall.json"), "w", encoding="utf-8") as f:
            json.dump(rainfall_data, f, indent=2)

    # 7. OSM Infrastructure GeoJSON
    osm_infra = {
        "type": "FeatureCollection",
        "name": "OSM_Infrastructure_Dholera",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Ahmedabad-Dholera Expressway (NH-751)",
                    "type": "highway",
                    "highway_class": "motorway",
                    "speed_limit_kmh": 120
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [72.150, 22.350],
                        [72.180, 22.280],
                        [72.200, 22.230],
                        [72.220, 22.180],
                        [72.230, 22.150]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Dholera Central Spine Road",
                    "type": "highway",
                    "highway_class": "primary"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [72.140, 22.230],
                        [72.190, 22.235],
                        [72.240, 22.240],
                        [72.300, 22.245]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "GETCO 400kV Dholera SIR Substation",
                    "type": "substation",
                    "voltage_kv": 400,
                    "operator": "GETCO"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [72.205, 22.245]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Dholera Solar Park 220kV Pooling Substation",
                    "type": "substation",
                    "voltage_kv": 220,
                    "operator": "GPCL"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [72.160, 22.300]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Dholera SIR Community Health Centre",
                    "type": "hospital",
                    "beds": 60,
                    "amenity": "hospital"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [72.195, 22.240]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "name": "Dholera Skill Development Institute & Polytechnic",
                    "type": "school",
                    "amenity": "college"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [72.198, 22.242]
                }
            }
        ]
    }
    
    for target_dir in [region_dir, fixtures_region_dir]:
        with open(os.path.join(target_dir, "osm_infra.geojson"), "w", encoding="utf-8") as f:
            json.dump(osm_infra, f, indent=2)

    print("Dholera datasets generated successfully.")


if __name__ == "__main__":
    ensure_dirs()
    generate_jewar_datasets()
    generate_dholera_datasets()
    print("All regional cache and fixture datasets created successfully.")
