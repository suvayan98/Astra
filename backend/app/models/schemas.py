from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union

# --- Geospatial GeoJSON Schemas ---

class Coordinate(BaseModel):
    lat: float
    lng: float

class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]] # [ [ [lng, lat], [lng, lat], ... ] ]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    properties: Dict[str, Any] = {}
    geometry: GeoJSONGeometry

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

# --- Module A: TerraSite AI ---

class SiteBoundaryInput(BaseModel):
    name: Optional[str] = "Custom Site Boundary"
    state: Optional[str] = "Andhra Pradesh"
    district: Optional[str] = "Guntur"
    polygon: GeoJSONGeometry
    area_acres: Optional[float] = 500.0
    proposed_population: Optional[int] = 20000

class FactorScore(BaseModel):
    name: str
    category: str
    weight: float
    score: float # 0 - 100
    description: str
    status: str # "favorable", "moderate", "restrictive", "critical"

class ExclusionZone(BaseModel):
    name: str
    type: str # wetland, water_body, steep_slope, forest_reserve, floodplain
    area_acres: float
    percentage: float
    polygon: Optional[GeoJSONGeometry] = None
    reason: str

class SiteSuitabilityResult(BaseModel):
    site_id: str
    name: str
    total_area_acres: float
    total_area_sqkm: float
    total_area_hectares: float
    overall_suitability_score: float # 0 - 100
    suitability_class: str # High, Moderate, Low, Unsuitable
    methodology_summary: str
    factors: List[FactorScore]
    exclusion_zones: List[ExclusionZone]
    net_developable_area_acres: float
    recommended_carrying_capacity: int
    density_assessment: str

# --- Module B: TerraTerrain AI ---

class ElevationStats(BaseModel):
    min_elev_m: float
    max_elev_m: float
    mean_elev_m: float
    slope_mean_deg: float
    slope_max_deg: float
    terrain_roughness: str # Low / Moderate / High
    aspect_dominant: str # South-East, etc.

class TerrainAnalysisResult(BaseModel):
    site_id: str
    elevation: ElevationStats
    drainage_patterns: List[Dict[str, Any]]
    surface_flow_direction: str
    erosion_susceptibility: str
    landslide_risk: str
    construction_suitability: str
    buildable_area_pct: float
    unbuildable_area_pct: float
    contour_interval_m: int
    geotechnical_disclaimer: str
    elevation_profile: List[Dict[str, Union[float, str]]]

# --- Module C: TerraSoil AI ---

class SoilAnalysisResult(BaseModel):
    site_id: str
    soil_type: str
    texture: str
    sand_pct: float
    silt_pct: float
    clay_pct: float
    soil_organic_carbon_g_kg: float
    soil_depth_cm: str
    soil_ph: float
    fertility_index: str
    drainage_characteristic: str
    erosion_susceptibility: str
    agricultural_suitability_pct: float
    recommended_crops: List[str]
    recommended_trees: List[str]
    soil_conservation_methods: List[str]
    field_survey_recommendation: str
    data_source_nature: str

# --- Module D: TerraWater AI ---

class GroundwaterMetrics(BaseModel):
    district: str
    state: str
    assessment_year: str
    annual_extractable_ham: float
    current_annual_extraction_ham: float
    stage_of_extraction_pct: float
    category: str # Safe, Semi-Critical, Critical, Over-Exploited
    pre_monsoon_depth_m_bgl: float
    post_monsoon_depth_m_bgl: float
    trend_10yr: str
    salinity_ec_warning: bool
    fluoride_warning: bool
    data_limitations_note: str

class WaterBalanceResult(BaseModel):
    population: int
    per_capita_lpcd: float
    domestic_demand_mld: float
    commercial_public_demand_mld: float
    total_daily_water_demand_mld: float
    annual_water_demand_mcm: float
    annual_rainfall_mm: float
    rainwater_harvesting_potential_mcm: float
    wastewater_generation_mld: float
    recycled_water_available_mld: float
    net_external_water_deficit_mld: float
    rwh_locations_recommended: List[Dict[str, Any]]
    sustainable_water_security_pct: float

class WaterAnalysisResult(BaseModel):
    site_id: str
    surface_water_bodies: List[Dict[str, Any]]
    groundwater: GroundwaterMetrics
    water_balance: WaterBalanceResult
    historical_water_table: List[Dict[str, Any]]

# --- Module E: TerraClimate AI ---

class ClimateHazardAssessment(BaseModel):
    flood_susceptibility: str
    heatwave_risk: str
    drought_risk: str
    cyclone_risk: str
    annual_rainfall_avg_mm: float
    extreme_rainfall_24h_mm: float
    summer_peak_temp_c: float
    cooling_degree_days: int
    climate_zone_india: str
    disaster_buffer_zones: List[str]
    emergency_evacuation_routes: List[str]
    climate_resilience_recommendations: List[str]
    disclaimer: str

# --- Module F: TerraEnergy AI ---

class RenewableEnergyResult(BaseModel):
    site_id: str
    solar_ghi_kwh_m2_day: float
    solar_dni_kwh_m2_day: float
    wind_speed_50m_mps: float
    wind_speed_100m_mps: float
    solar_pv_potential_mw: float
    wind_potential_mw: float
    annual_solar_generation_gwh: float
    annual_wind_generation_gwh: float
    total_renewable_generation_gwh: float
    projected_city_demand_gwh: float
    renewable_share_pct: float
    battery_bess_mwh_required: float
    microgrid_recommendations: List[str]
    monthly_generation_profile: List[Dict[str, Any]]
    assumptions_summary: List[str]

# --- Module G: TerraVegetation AI ---

class VegetationResult(BaseModel):
    site_id: str
    mean_ndvi: float
    mean_evi: float
    canopy_cover_pct: float
    degraded_land_pct: float
    recommended_native_species: List[Dict[str, str]]
    biodiversity_corridors_acres: float
    urban_forest_parks_acres: float
    green_cover_ratio_pct: float
    ndvi_time_series: List[Dict[str, Any]]

# --- Module H: TerraCity Designer (Master Plans) ---

class CityZone(BaseModel):
    id: str
    name: str
    type: str # Residential, Commercial, Industrial, Agricultural, Green_Forest, Water_Body, Renewable_Solar, Transport_Roads, Civic_STP_SWM, Emergency_Hospital, Institutional_Schools
    area_acres: float
    area_percentage: float
    color: str
    polygon: GeoJSONGeometry
    description: str
    key_features: List[str]
    density_level: Optional[str] = "Medium"

class MasterPlanAlternative(BaseModel):
    plan_id: str
    name: str # Plan A, Plan B, Plan C
    tagline: str
    philosophy: str
    total_area_acres: float
    planned_population: int
    residential_density_pph: float
    zones: List[CityZone]
    road_network_km: float
    public_transport_coverage_pct: float
    renewable_energy_share_pct: float
    green_open_space_pct: float
    water_self_sufficiency_pct: float
    carbon_offset_tpy: float
    suitability_score: float

class MasterPlanComparison(BaseModel):
    site_id: str
    plans: List[MasterPlanAlternative]
    trade_off_analysis: Dict[str, Any]
    ai_recommended_plan_id: str
    recommendation_reason: str

# --- Module I: TerraFuture AI (10, 20, 50, 100 Year Simulation) ---

class SimulationYearMilestone(BaseModel):
    year: int
    population: int
    water_demand_mld: float
    water_supply_mld: float
    groundwater_stress_index: float # 0 - 1.0
    energy_demand_gwh: float
    renewable_generation_gwh: float
    solid_waste_tpd: float
    transport_trips_daily: int
    green_cover_acres: float
    co2_emissions_net_kt: float
    resilience_score: float

class ScenarioSimulation(BaseModel):
    scenario_id: str
    scenario_name: str
    description: str
    milestones: List[SimulationYearMilestone]

class FutureSimulationResult(BaseModel):
    site_id: str
    plan_id: str
    base_population: int
    scenarios: List[ScenarioSimulation]
    sensitivity_factors: Dict[str, float]
    simulation_disclaimer: str

# --- Module J: TerraAdvisor AI ---

class AdvisorChatRequest(BaseModel):
    question: str
    site_id: Optional[str] = None
    plan_id: Optional[str] = "plan_a"
    conversation_history: Optional[List[Dict[str, str]]] = []

class AdvisorChatResponse(BaseModel):
    answer: str
    referenced_data: List[str]
    confidence_level: str
    suggested_followups: List[str]

# --- ISRO Space Data Hub ---

class ISROPortalStatus(BaseModel):
    id: str
    name: str
    agency: str # ISRO / NRSC or ISRO / SAC
    portal_url: str
    api_doc_url: str
    logo_badge: str
    datasets_used: List[str]
    acquisition_dates: str
    coverage: str
    resolution: str
    status: str # "Connected", "Pending Authentication", "Demo/Simulated"
    last_retrieval: str
    contribution_to_analysis: str
    api_endpoint: str
    auth_mode: str
