import math
from typing import Dict, Any, List

# 500 acres is approximately 2.02343 sq km.
# A square of 500 acres has a side of sqrt(2.02343) km = ~1.42247 km.
# At ~15° to 25° latitude, 1 km is roughly 0.009° latitude, and 0.009 / cos(lat) longitude.

def create_500_acre_polygon(center_lat: float, center_lng: float) -> List[List[float]]:
    # side ~1.422 km
    half_side_lat = (1.42247 / 2.0) / 111.0 # degrees lat (~0.0064°)
    cos_lat = math.cos(math.radians(center_lat))
    half_side_lng = (1.42247 / 2.0) / (111.0 * cos_lat) # degrees lng
    
    # Return closed polygon coordinates [lng, lat]
    min_lat = center_lat - half_side_lat
    max_lat = center_lat + half_side_lat
    min_lng = center_lng - half_side_lng
    max_lng = center_lng + half_side_lng
    
    return [
        [round(min_lng, 6), round(min_lat, 6)],
        [round(max_lng, 6), round(min_lat, 6)],
        [round(max_lng, 6), round(max_lat, 6)],
        [round(min_lng, 6), round(max_lat, 6)],
        [round(min_lng, 6), round(min_lat, 6)],
    ]

SAMPLE_SITES: Dict[str, Dict[str, Any]] = {
    "site-dholera": {
        "id": "site-dholera",
        "name": "Dholera Greenfield Industrial Smart Zone",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "taluka": "Dholera",
        "center": {"lat": 22.2530, "lng": 72.1920},
        "area_acres": 500.0,
        "area_sqkm": 2.0234,
        "area_hectares": 202.34,
        "target_population": 20000,
        "boundary": {
            "type": "Polygon",
            "coordinates": [create_500_acre_polygon(22.2530, 72.1920)]
        },
        "elevation_m": {"min": 6.5, "max": 14.2, "mean": 10.4},
        "slope_deg": 1.2,
        "geology": {
            "formation": "Alluvial deposits and coastal mudflats (Quaternary)",
            "seismic_zone": "Zone III (Moderate)",
            "bearing_capacity_kn_m2": 130
        },
        "soil": {
            "order": "Vertisols (Deep Black Cotton & Saline Alluvial)",
            "texture": "Clay Loam",
            "sand_pct": 24.0,
            "silt_pct": 36.0,
            "clay_pct": 40.0,
            "soc_pct": 0.42,
            "depth_cm": 120.0,
            "drainage": "Poorly to moderately drained (shrink-swell properties)",
            "agri_class": "Class III (Requires drainage management)"
        },
        "cgwb": {
            "block": "Dholera",
            "district": "Ahmedabad",
            "recharge_mcm": 18.4,
            "draft_mcm": 15.2,
            "stage_pct": 82.6,
            "category": "Semi-Critical",
            "water_table_mbgl_pre": 18.5,
            "water_table_mbgl_post": 15.2
        },
        "climate": {
            "annual_rainfall_mm": 620.0,
            "mean_temp_c": 27.8,
            "max_summer_temp_c": 44.5,
            "extreme_24h_rainfall_mm": 165.0,
            "flood_susceptibility": "Moderate (Gulf of Khambhat tidal influence & low gradient)",
            "cyclone_risk": "Moderate (Coastal Arabian Sea depression corridor)",
            "heatwave_days": 24
        },
        "energy": {
            "solar_ghi_kwh_m2_day": 5.82,
            "solar_dni_kwh_m2_day": 6.10,
            "wind_speed_50m_ms": 6.2,
            "wind_power_density_wm2": 245.0
        },
        "vegetation": {
            "ndvi_mean": 0.28,
            "ndvi_min": 0.12,
            "ndvi_max": 0.45,
            "evi_mean": 0.21,
            "canopy_pct": 8.5
        },
        "isro_metadata": {
            "bhuvan_lulc": "Scrubland and fallow wasteland (82%), open barren (14%), scattered seasonal ponds (4%)",
            "bhoonidhi_scene_id": "RE2_L4_20240315_098_054_NC",
            "mosdac_rainfall_station": "Dholera Automatic Weather Station (AWS-SAC)",
            "vedas_ndvi_composite": "VEDAS AWiFS 15-Day Composite March 2024"
        }
    },
    "site-amaravati": {
        "id": "site-amaravati",
        "name": "Amaravati Riverfront Capital Sector",
        "state": "Andhra Pradesh",
        "district": "Guntur",
        "taluka": "Thullur",
        "center": {"lat": 16.5420, "lng": 80.5180},
        "area_acres": 500.0,
        "area_sqkm": 2.0234,
        "area_hectares": 202.34,
        "target_population": 20000,
        "boundary": {
            "type": "Polygon",
            "coordinates": [create_500_acre_polygon(16.5420, 80.5180)]
        },
        "elevation_m": {"min": 19.0, "max": 28.5, "mean": 23.2},
        "slope_deg": 1.8,
        "geology": {
            "formation": "Krishna Delta Alluvium / Charnockite basement",
            "seismic_zone": "Zone III (Moderate)",
            "bearing_capacity_kn_m2": 150
        },
        "soil": {
            "order": "Entisols & Vertic Inceptisols (Rich Delta Alluvium)",
            "texture": "Silty Clay Loam",
            "sand_pct": 18.0,
            "silt_pct": 46.0,
            "clay_pct": 36.0,
            "soc_pct": 0.78,
            "depth_cm": 150.0,
            "drainage": "Moderately well drained",
            "agri_class": "Class I (High fertile multi-crop agricultural land)"
        },
        "cgwb": {
            "block": "Thullur",
            "district": "Guntur",
            "recharge_mcm": 42.6,
            "draft_mcm": 24.1,
            "stage_pct": 56.5,
            "category": "Safe",
            "water_table_mbgl_pre": 8.2,
            "water_table_mbgl_post": 4.5
        },
        "climate": {
            "annual_rainfall_mm": 980.0,
            "mean_temp_c": 28.5,
            "max_summer_temp_c": 45.2,
            "extreme_24h_rainfall_mm": 210.0,
            "flood_susceptibility": "High (Adjacent to Krishna flood basin, requires 500m green dike buffer)",
            "cyclone_risk": "High (Bay of Bengal cyclone corridor)",
            "heatwave_days": 32
        },
        "energy": {
            "solar_ghi_kwh_m2_day": 5.45,
            "solar_dni_kwh_m2_day": 5.30,
            "wind_speed_50m_ms": 4.8,
            "wind_power_density_wm2": 130.0
        },
        "vegetation": {
            "ndvi_mean": 0.54,
            "ndvi_min": 0.22,
            "ndvi_max": 0.78,
            "evi_mean": 0.44,
            "canopy_pct": 26.0
        },
        "isro_metadata": {
            "bhuvan_lulc": "Intensive agricultural crop land (65%), plantation (18%), water canals (7%), fallow (10%)",
            "bhoonidhi_scene_id": "CARTOSAT-3_PAN_MX_20240210_024",
            "mosdac_rainfall_station": "Vijayawada Doppler Weather Radar (DWR-SAC)",
            "vedas_ndvi_composite": "VEDAS Resourcesat-2A NDVI Multi-temporal"
        }
    },
    "site-devanahalli": {
        "id": "site-devanahalli",
        "name": "Devanahalli Aero-Smart Corridor",
        "state": "Karnataka",
        "district": "Bengaluru Rural",
        "taluka": "Devanahalli",
        "center": {"lat": 13.2510, "lng": 77.7120},
        "area_acres": 500.0,
        "area_sqkm": 2.0234,
        "area_hectares": 202.34,
        "target_population": 20000,
        "boundary": {
            "type": "Polygon",
            "coordinates": [create_500_acre_polygon(13.2510, 77.7120)]
        },
        "elevation_m": {"min": 878.0, "max": 915.0, "mean": 894.0},
        "slope_deg": 3.8,
        "geology": {
            "formation": "Peninsular Gneissic Complex (Archaean crystalline granites)",
            "seismic_zone": "Zone II (Low)",
            "bearing_capacity_kn_m2": 260
        },
        "soil": {
            "order": "Alfisols (Red Gravelly Sandy Loam)",
            "texture": "Sandy Clay Loam",
            "sand_pct": 52.0,
            "silt_pct": 22.0,
            "clay_pct": 26.0,
            "soc_pct": 0.52,
            "depth_cm": 90.0,
            "drainage": "Well drained, rapid infiltration",
            "agri_class": "Class II (Dryland agriculture, ragi, horticulture)"
        },
        "cgwb": {
            "block": "Devanahalli",
            "district": "Bengaluru Rural",
            "recharge_mcm": 14.8,
            "draft_mcm": 21.6,
            "stage_pct": 145.9,
            "category": "Over-Exploited",
            "water_table_mbgl_pre": 42.0,
            "water_table_mbgl_post": 36.5
        },
        "climate": {
            "annual_rainfall_mm": 840.0,
            "mean_temp_c": 23.8,
            "max_summer_temp_c": 37.8,
            "extreme_24h_rainfall_mm": 135.0,
            "flood_susceptibility": "Low (Upland plateau ridge, localized low swales near tank cascade)",
            "cyclone_risk": "Very Low (Inland plateau)",
            "heatwave_days": 6
        },
        "energy": {
            "solar_ghi_kwh_m2_day": 5.58,
            "solar_dni_kwh_m2_day": 5.65,
            "wind_speed_50m_ms": 5.4,
            "wind_power_density_wm2": 175.0
        },
        "vegetation": {
            "ndvi_mean": 0.41,
            "ndvi_min": 0.18,
            "ndvi_max": 0.68,
            "evi_mean": 0.32,
            "canopy_pct": 18.2
        },
        "isro_metadata": {
            "bhuvan_lulc": "Dry cropland (48%), agro-forestry plantation (22%), scrubland (18%), water tank kere (12%)",
            "bhoonidhi_scene_id": "RS2A_LISS4_20240122_099_064",
            "mosdac_rainfall_station": "Bengaluru IMD/SAC Automatic Weather Radar",
            "vedas_ndvi_composite": "VEDAS Urban Growth & Vegetation Monitoring"
        }
    },
    "site-sonipat": {
        "id": "site-sonipat",
        "name": "Sonipat Agri-Urban Smart Hub",
        "state": "Haryana",
        "district": "Sonipat",
        "taluka": "Rai",
        "center": {"lat": 28.9880, "lng": 77.0220},
        "area_acres": 500.0,
        "area_sqkm": 2.0234,
        "area_hectares": 202.34,
        "target_population": 20000,
        "boundary": {
            "type": "Polygon",
            "coordinates": [create_500_acre_polygon(28.9880, 77.0220)]
        },
        "elevation_m": {"min": 218.0, "max": 226.0, "mean": 222.0},
        "slope_deg": 0.9,
        "geology": {
            "formation": "Yamuna Older & Newer Alluvium (Pleistocene to Recent)",
            "seismic_zone": "Zone IV (High)",
            "bearing_capacity_kn_m2": 140
        },
        "soil": {
            "order": "Inceptisols (Typic Ustochrepts Alluvial)",
            "texture": "Loam",
            "sand_pct": 42.0,
            "silt_pct": 38.0,
            "clay_pct": 20.0,
            "soc_pct": 0.65,
            "depth_cm": 160.0,
            "drainage": "Well drained",
            "agri_class": "Class I (Prime wheat-paddy agricultural soil)"
        },
        "cgwb": {
            "block": "Rai",
            "district": "Sonipat",
            "recharge_mcm": 28.2,
            "draft_mcm": 27.9,
            "stage_pct": 98.9,
            "category": "Critical",
            "water_table_mbgl_pre": 24.5,
            "water_table_mbgl_post": 22.0
        },
        "climate": {
            "annual_rainfall_mm": 580.0,
            "mean_temp_c": 25.1,
            "max_summer_temp_c": 46.5,
            "extreme_24h_rainfall_mm": 150.0,
            "flood_susceptibility": "Low-Moderate (Yamuna backwater drains during severe monsoon)",
            "cyclone_risk": "Very Low",
            "heatwave_days": 28
        },
        "energy": {
            "solar_ghi_kwh_m2_day": 5.25,
            "solar_dni_kwh_m2_day": 5.10,
            "wind_speed_50m_ms": 4.1,
            "wind_power_density_wm2": 95.0
        },
        "vegetation": {
            "ndvi_mean": 0.48,
            "ndvi_min": 0.16,
            "ndvi_max": 0.72,
            "evi_mean": 0.39,
            "canopy_pct": 14.0
        },
        "isro_metadata": {
            "bhuvan_lulc": "Intensive agricultural crop land (72%), village settlement (12%), canal corridors (6%), fallow (10%)",
            "bhoonidhi_scene_id": "RESOURCESAT-2A_AWIFS_20240401",
            "mosdac_rainfall_station": "Delhi-NCR IMD/MOSDAC Weather Monitoring Network",
            "vedas_ndvi_composite": "VEDAS Agro-Ecosystems Health Assessment"
        }
    },
    "site-shivamogga": {
        "id": "site-shivamogga",
        "name": "Shivamogga Malnad Eco-Settlement",
        "state": "Karnataka",
        "district": "Shivamogga",
        "taluka": "Bhadravati / Shivamogga",
        "center": {"lat": 13.9320, "lng": 75.5720},
        "area_acres": 500.0,
        "area_sqkm": 2.0234,
        "area_hectares": 202.34,
        "target_population": 20000,
        "boundary": {
            "type": "Polygon",
            "coordinates": [create_500_acre_polygon(13.9320, 75.5720)]
        },
        "elevation_m": {"min": 570.0, "max": 645.0, "mean": 605.0},
        "slope_deg": 6.8,
        "geology": {
            "formation": "Dharwar Supergroup (Metasediments & Greenschists)",
            "seismic_zone": "Zone II (Low)",
            "bearing_capacity_kn_m2": 280
        },
        "soil": {
            "order": "Ultisols / Lateritic Alfisols",
            "texture": "Clayey Gravelly Loam",
            "sand_pct": 32.0,
            "silt_pct": 28.0,
            "clay_pct": 40.0,
            "soc_pct": 1.25,
            "depth_cm": 110.0,
            "drainage": "Well to excessively drained",
            "agri_class": "Class II (Plantations, Arecanut, Spices, Forestry)"
        },
        "cgwb": {
            "block": "Shivamogga",
            "district": "Shivamogga",
            "recharge_mcm": 68.4,
            "draft_mcm": 25.2,
            "stage_pct": 36.8,
            "category": "Safe",
            "water_table_mbgl_pre": 7.4,
            "water_table_mbgl_post": 3.1
        },
        "climate": {
            "annual_rainfall_mm": 1750.0,
            "mean_temp_c": 24.2,
            "max_summer_temp_c": 36.5,
            "extreme_24h_rainfall_mm": 240.0,
            "flood_susceptibility": "Moderate in Tunga-Bhadra valley depressions; High slope runoff",
            "cyclone_risk": "Low (Western Ghats lee-side)",
            "heatwave_days": 2
        },
        "energy": {
            "solar_ghi_kwh_m2_day": 4.95,
            "solar_dni_kwh_m2_day": 4.60,
            "wind_speed_50m_ms": 5.1,
            "wind_power_density_wm2": 160.0
        },
        "vegetation": {
            "ndvi_mean": 0.68,
            "ndvi_min": 0.35,
            "ndvi_max": 0.88,
            "evi_mean": 0.58,
            "canopy_pct": 52.0
        },
        "isro_metadata": {
            "bhuvan_lulc": "Semi-evergreen mixed forest (38%), agro-horticulture (35%), water streams (12%), fallow (15%)",
            "bhoonidhi_scene_id": "RISAT-1A_EOS04_FRS_20240310",
            "mosdac_rainfall_station": "Shimoga SAC Ground Hydro Observation Unit",
            "vedas_ndvi_composite": "VEDAS Western Ghats Forest Canopy Monitor"
        }
    }
}
