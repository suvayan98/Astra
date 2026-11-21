from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float

class GeoPolygon(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]] # [ [ [lng, lat], [lng, lat], ... ] ]

class SiteBoundaryInput(BaseModel):
    name: str = "Selected Site"
    boundary: GeoPolygon
    area_acres: Optional[float] = None
    target_population: Optional[int] = 20000
    location_name: Optional[str] = "India Greenfield Site"
    state: Optional[str] = "Gujarat"
    district: Optional[str] = "Ahmedabad"

class FactorScore(BaseModel):
    name: str
    category: str
    score: float # 0 - 100
    weight: float # e.g. 0.0833
    weighted_score: float
    grade: str # A, B, C, D, F
    observation: str
    data_source: str
    is_exclusion: bool = False
    details: Dict[str, Any] = {}

class SiteSuitabilityResult(BaseModel):
    site_id: str
    site_name: str
    location_name: str
    state: str
    district: str
    total_area_acres: float
    total_area_sqkm: float
    total_area_hectares: float
    overall_suitability_score: float # 0 - 100
    suitability_class: str # Highly Suitable, Moderately Suitable, Marginally Suitable, Restricted
    factor_breakdown: List[FactorScore]
    exclusion_zones_identified: List[str]
    critical_warnings: List[str]
    planning_recommendations: List[str]
    methodology_explanation: str

# Module B: Terrain
class ContourLine(BaseModel):
    elevation_m: float
    geometry: Dict[str, Any] # GeoJSON LineString

class TerrainAnalysisResult(BaseModel):
    min_elevation_m: float
    max_elevation_m: float
    mean_elevation_m: float
    elevation_range_m: float
    mean_slope_deg: float
    slope_distribution: Dict[str, float] # '<5%': 60, '5-15%': 30, '>15%': 10
    dominant_aspect: str
    terrain_roughness_index: str # Low, Medium, High
    drainage_pattern: str # Dendritic, Trellis, Parallel
    flow_direction_summary: str
    erosion_susceptibility: str # Low, Moderate, High
    construction_suitability: Dict[str, float] # percent of land buildable without heavy terracing
    geotechnical_disclaimer: str
    contours: List[ContourLine] = []

# Module C: Soil
class NativeSpeciesRecommendation(BaseModel):
    common_name: str
    botanical_name: str
    category: str # Shade, Timber, Agro-forestry, Riparian, Windbreak
    canopy_spread_m: float
    water_requirement: str # Low, Medium, High
    soil_affinity: str
    carbon_sequestration_potential: str # High, Very High

class SoilAnalysisResult(BaseModel):
    soil_order: str # Inceptisols, Vertisols, Alfisols, Entisols
    texture_class: str # Sandy Loam, Clay Loam, Black Cotton, etc.
    sand_pct: float
    silt_pct: float
    clay_pct: float
    soil_organic_carbon_pct: float
    estimated_soil_depth_cm: float
    soil_fertility_index: str # High, Moderate, Low
    drainage_characteristic: str # Well drained, Moderate, Impermeable
    shrink_swell_potential: str # High (Expansive), Moderate, Low
    agricultural_suitability_class: str # Class I, Class II, Class III
    recommended_agro_zones_pct: float
    soil_conservation_measures: List[str]
    field_testing_protocols_needed: List[str]

# Module D: Water
class CGWBAssessmentData(BaseModel):
    state: str
    district: str
    block_taluka: str
    assessment_year: int = 2023
    annual_replenishable_recharge_mcm: float
    natural_discharge_mcm: float
    net_annual_groundwater_availability_mcm: float
    annual_groundwater_draft_total_mcm: float
    annual_draft_domestic_mcm: float
    annual_draft_irrigation_mcm: float
    stage_of_groundwater_extraction_pct: float # (Draft / Availability) * 100
    category: str # Safe, Semi-Critical, Critical, Over-Exploited
    depth_to_water_table_mbgl_pre_monsoon: float
    depth_to_water_table_mbgl_post_monsoon: float
    official_data_source: str = "CGWB Dynamic Ground Water Resources of India"
    disclaimer: str

class WaterIntelligenceResult(BaseModel):
    proposed_population: int
    per_capita_consumption_lpcd: float = 135.0
    daily_domestic_demand_mld: float
    daily_civic_commercial_demand_mld: float
    daily_total_demand_mld: float
    annual_water_demand_mcm: float
    annual_rainfall_mm: float
    rainwater_harvesting_potential_mld: float
    rainwater_harvesting_annual_mcm: float
    wastewater_generation_mld: float
    treated_wastewater_reuse_potential_mld: float
    net_freshwater_deficit_or_surplus_mld: float
    cgwb_data: CGWBAssessmentData
    recommended_rwh_locations: List[Dict[str, Any]]
    water_balance_summary: str
    uncertainty_notes: str

# Module E: Climate & Disaster
class ClimateDisasterResult(BaseModel):
    mean_annual_temp_c: float
    summer_max_temp_c: float
    winter_min_temp_c: float
    mean_annual_rainfall_mm: float
    extreme_24h_rainfall_return_50yr_mm: float
    flood_susceptibility_zone: str # Low, Moderate, High Floodplain
    drought_vulnerability_index: str # Low, Medium, High
    cyclone_hazard_risk: str # Very Low, Low, Moderate, High
    heatwave_hazard_days_per_year: int
    landslide_risk: str
    forest_fire_risk: str
    recommended_safe_development_area_pct: float
    flood_drainage_buffer_m: float
    emergency_shelters: List[Dict[str, Any]]
    evacuation_corridors: List[str]
    disaster_resilience_measures: List[str]

# Module F: Renewable Energy
class MonthlyEnergyData(BaseModel):
    month: str
    solar_kwh_m2_day: float
    wind_speed_ms: float
    estimated_solar_gen_mwh: float

class RenewableEnergyResult(BaseModel):
    solar_ghi_kwh_m2_day: float
    solar_dni_kwh_m2_day: float
    mean_wind_speed_50m_ms: float
    wind_power_density_wm2: float
    recommended_solar_farm_area_acres: float
    recommended_solar_farm_capacity_mwp: float
    estimated_rooftop_solar_capacity_mwp: float
    total_solar_installed_mwp: float
    annual_solar_generation_gwh: float
    potential_wind_turbines_count: int
    potential_wind_capacity_mw: float
    annual_wind_generation_gwh: float
    annual_settlement_electricity_demand_gwh: float
    total_renewable_generation_gwh: float
    renewable_energy_share_pct: float
    recommended_bess_capacity_mwh: float
    monthly_breakdown: List[MonthlyEnergyData]
    assumptions_log: Dict[str, Any]

# Module G: Vegetation
class VegetationIntelligenceResult(BaseModel):
    satellite_ndvi_mean: float
    satellite_ndvi_min: float
    satellite_ndvi_max: float
    satellite_evi_mean: float
    existing_canopy_cover_pct: float
    proposed_green_cover_target_pct: float
    urban_forest_area_acres: float
    miyawaki_pockets_recommended: int
    native_species_list: List[NativeSpeciesRecommendation]
    biodiversity_corridor_connectivity: str
    recommended_crop_patterns: List[str]
    satellite_observation_source: str = "ISRO VEDAS / Sentinel-2 NDVI 10m"

# Module H: City Master Plan
class MasterPlanZone(BaseModel):
    id: str
    name: str
    zone_type: str # Residential, Commercial, Industrial, Agricultural, Parks, Water, Transport, Solar, DEWATS, SolidWaste, Civic, Education
    area_acres: float
    area_hectares: float
    area_percentage: float
    color: str
    far_ratio: float
    target_capacity_people: int
    description: str
    geometry: Dict[str, Any] # GeoJSON Polygon

class MasterPlanAlternative(BaseModel):
    plan_id: str
    plan_code: str # PLAN_A, PLAN_B, PLAN_C
    name: str
    tagline: str
    paradigm: str
    target_population: int
    total_area_acres: float
    total_area_sqkm: float
    gross_population_density_per_sqkm: float
    gross_density_per_acre: float
    residential_net_density_per_acre: float
    walkability_score: float # 0 - 100
    green_space_per_capita_sqm: float
    water_self_sufficiency_pct: float
    renewable_energy_coverage_pct: float
    public_transit_mode_share_target_pct: float
    estimated_infrastructure_capex_cr_inr: float
    zones: List[MasterPlanZone]
    tradeoffs_summary: str
    density_evaluation: str
    key_features: List[str]

class CityGenerationRequest(BaseModel):
    site_id: Optional[str] = None
    site_name: str = "Custom Site"
    boundary: GeoPolygon
    total_area_acres: float = 500.0
    target_population: int = 20000
    sustainability_priorities: List[str] = ["water_security", "renewable_energy", "walkability", "disaster_resilience"]

class ZoneUpdateRequest(BaseModel):
    plan_id: str
    zone_id: str
    zone_type: Optional[str] = None
    area_acres: Optional[float] = None
    far_ratio: Optional[float] = None
    geometry: Optional[Dict[str, Any]] = None

# Module I: Future Simulation
class FutureYearProjection(BaseModel):
    year_offset: int # 10, 20, 50, 100
    calendar_year: int
    projected_population: int
    daily_water_demand_mld: float
    annual_water_deficit_or_surplus_mcm: float
    groundwater_extraction_stage_pct: float
    daily_energy_demand_mwh: float
    renewable_generation_mwh: float
    solid_waste_generated_tpd: float # tonnes per day
    cumulative_co2_offset_kt: float
    green_canopy_cover_pct: float
    infrastructure_stress_index: float # 0 - 100

class ScenarioSimulationResult(BaseModel):
    scenario_id: str
    scenario_name: str
    description: str
    population_growth_rate_pct: float
    projections: List[FutureYearProjection]
    critical_milestone_notes: List[str]

class SimulationRequest(BaseModel):
    base_population: int = 20000
    annual_population_growth_rate: float = 2.2
    per_capita_water_consumption_lpcd: float = 135.0
    rainfall_variation_pct: float = 0.0
    renewable_capacity_mw: float = 25.0
    scenario_type: str = "Sustainable Development" # BAU, Sustainable Development, High Growth, Water Stressed, Resilient

# Module J: AI Assistant
class AssistantMessage(BaseModel):
    role: str # user, assistant, system
    content: str

class AssistantRequest(BaseModel):
    question: str
    site_id: Optional[str] = None
    site_name: Optional[str] = None
    current_plan_code: Optional[str] = "PLAN_A"
    population: Optional[int] = 20000
    area_acres: Optional[float] = 500.0
    history: List[AssistantMessage] = []

class AssistantResponse(BaseModel):
    answer: str
    grounded_metrics_used: Dict[str, Any]
    formula_references: List[str]
    official_data_sources: List[str]
    recommended_action: str

# Module 4: ISRO Space Data Hub
class ISROPortalStatus(BaseModel):
    portal_id: str
    name: str
    agency: str # ISRO / NRSC or ISRO / SAC
    official_url: str
    api_endpoint: str
    connection_status: str # Connected (Live), Connected (Demo Cache), Pending Credentials, Error
    is_live: bool
    last_retrieval_timestamp: str
    auth_type: str
    token_status: str
    dataset_used: str
    acquisition_dates: str
    spatial_resolution: str
    contribution_to_analysis: str
    sample_products: List[Dict[str, Any]] = []

class ISROHubOverview(BaseModel):
    total_portals: int = 4
    active_integrations: int
    demo_mode_active: bool
    portals: List[ISROPortalStatus]
    system_satellite_coverage_notes: str
