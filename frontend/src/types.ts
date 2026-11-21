export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoPolygon {
  type: string;
  coordinates: number[][][];
}

export interface FactorScore {
  name: string;
  category: string;
  score: number;
  weight: number;
  weighted_score: number;
  grade: string;
  observation: string;
  data_source: string;
  is_exclusion: boolean;
  details: Record<string, any>;
}

export interface SiteSuitabilityResult {
  site_id: string;
  site_name: string;
  location_name: string;
  state: string;
  district: string;
  total_area_acres: number;
  total_area_sqkm: number;
  total_area_hectares: number;
  overall_suitability_score: number;
  suitability_class: string;
  factor_breakdown: FactorScore[];
  exclusion_zones_identified: string[];
  critical_warnings: string[];
  planning_recommendations: string[];
  methodology_explanation: string;
}

export interface ContourLine {
  elevation_m: number;
  geometry: {
    type: string;
    coordinates: number[][];
  };
}

export interface TerrainAnalysisResult {
  min_elevation_m: number;
  max_elevation_m: number;
  mean_elevation_m: number;
  elevation_range_m: number;
  mean_slope_deg: number;
  slope_distribution: Record<string, number>;
  dominant_aspect: string;
  terrain_roughness_index: string;
  drainage_pattern: string;
  flow_direction_summary: string;
  erosion_susceptibility: string;
  construction_suitability: Record<string, number>;
  geotechnical_disclaimer: string;
  contours: ContourLine[];
}

export interface SoilAnalysisResult {
  soil_order: string;
  texture_class: string;
  sand_pct: number;
  silt_pct: number;
  clay_pct: number;
  soil_organic_carbon_pct: number;
  estimated_soil_depth_cm: number;
  soil_fertility_index: string;
  drainage_characteristic: string;
  shrink_swell_potential: string;
  agricultural_suitability_class: string;
  recommended_agro_zones_pct: number;
  soil_conservation_measures: string[];
  field_testing_protocols_needed: string[];
}

export interface CGWBAssessmentData {
  state: string;
  district: string;
  block_taluka: string;
  assessment_year: number;
  annual_replenishable_recharge_mcm: number;
  natural_discharge_mcm: number;
  net_annual_groundwater_availability_mcm: number;
  annual_groundwater_draft_total_mcm: number;
  annual_draft_domestic_mcm: number;
  annual_draft_irrigation_mcm: number;
  stage_of_groundwater_extraction_pct: number;
  category: string;
  depth_to_water_table_mbgl_pre_monsoon: number;
  depth_to_water_table_mbgl_post_monsoon: number;
  official_data_source: string;
  disclaimer: string;
}

export interface WaterIntelligenceResult {
  proposed_population: number;
  per_capita_consumption_lpcd: number;
  daily_domestic_demand_mld: number;
  daily_civic_commercial_demand_mld: number;
  daily_total_demand_mld: number;
  annual_water_demand_mcm: number;
  annual_rainfall_mm: number;
  rainwater_harvesting_potential_mld: number;
  rainwater_harvesting_annual_mcm: number;
  wastewater_generation_mld: number;
  treated_wastewater_reuse_potential_mld: number;
  net_freshwater_deficit_or_surplus_mld: number;
  cgwb_data: CGWBAssessmentData;
  recommended_rwh_locations: Array<Record<string, any>>;
  water_balance_summary: string;
  uncertainty_notes: string;
}

export interface ClimateDisasterResult {
  mean_annual_temp_c: number;
  summer_max_temp_c: number;
  winter_min_temp_c: number;
  mean_annual_rainfall_mm: number;
  extreme_24h_rainfall_return_50yr_mm: number;
  flood_susceptibility_zone: string;
  drought_vulnerability_index: string;
  cyclone_hazard_risk: string;
  heatwave_hazard_days_per_year: number;
  landslide_risk: string;
  forest_fire_risk: string;
  recommended_safe_development_area_pct: number;
  flood_drainage_buffer_m: number;
  emergency_shelters: Array<Record<string, any>>;
  evacuation_corridors: string[];
  disaster_resilience_measures: string[];
}

export interface MonthlyEnergyData {
  month: string;
  solar_kwh_m2_day: number;
  wind_speed_ms: number;
  estimated_solar_gen_mwh: number;
}

export interface RenewableEnergyResult {
  solar_ghi_kwh_m2_day: number;
  solar_dni_kwh_m2_day: number;
  mean_wind_speed_50m_ms: number;
  wind_power_density_wm2: number;
  recommended_solar_farm_area_acres: number;
  recommended_solar_farm_capacity_mwp: number;
  estimated_rooftop_solar_capacity_mwp: number;
  total_solar_installed_mwp: number;
  annual_solar_generation_gwh: number;
  potential_wind_turbines_count: number;
  potential_wind_capacity_mw: number;
  annual_wind_generation_gwh: number;
  annual_settlement_electricity_demand_gwh: number;
  total_renewable_generation_gwh: number;
  renewable_energy_share_pct: number;
  recommended_bess_capacity_mwh: number;
  monthly_breakdown: MonthlyEnergyData[];
  assumptions_log: Record<string, any>;
}

export interface NativeSpeciesRecommendation {
  common_name: string;
  botanical_name: string;
  category: string;
  canopy_spread_m: number;
  water_requirement: string;
  soil_affinity: string;
  carbon_sequestration_potential: string;
}

export interface VegetationIntelligenceResult {
  satellite_ndvi_mean: number;
  satellite_ndvi_min: number;
  satellite_ndvi_max: number;
  satellite_evi_mean: number;
  existing_canopy_cover_pct: number;
  proposed_green_cover_target_pct: number;
  urban_forest_area_acres: number;
  miyawaki_pockets_recommended: number;
  native_species_list: NativeSpeciesRecommendation[];
  biodiversity_corridor_connectivity: string;
  recommended_crop_patterns: string[];
  satellite_observation_source: string;
}

export interface MasterPlanZone {
  id: string;
  name: string;
  zone_type: string;
  area_acres: number;
  area_hectares: number;
  area_percentage: number;
  color: string;
  far_ratio: number;
  target_capacity_people: number;
  description: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

export interface MasterPlanAlternative {
  plan_id: string;
  plan_code: string;
  name: string;
  tagline: string;
  paradigm: string;
  target_population: number;
  total_area_acres: number;
  total_area_sqkm: number;
  gross_population_density_per_sqkm: number;
  gross_density_per_acre: number;
  residential_net_density_per_acre: number;
  walkability_score: number;
  green_space_per_capita_sqm: number;
  water_self_sufficiency_pct: number;
  renewable_energy_coverage_pct: number;
  public_transit_mode_share_target_pct: number;
  estimated_infrastructure_capex_cr_inr: number;
  zones: MasterPlanZone[];
  tradeoffs_summary: string;
  density_evaluation: string;
  key_features: string[];
}

export interface FutureYearProjection {
  year_offset: number;
  calendar_year: number;
  projected_population: number;
  daily_water_demand_mld: number;
  annual_water_deficit_or_surplus_mcm: number;
  groundwater_extraction_stage_pct: number;
  daily_energy_demand_mwh: number;
  renewable_generation_mwh: number;
  solid_waste_generated_tpd: number;
  cumulative_co2_offset_kt: number;
  green_canopy_cover_pct: number;
  infrastructure_stress_index: number;
}

export interface ScenarioSimulationResult {
  scenario_id: string;
  scenario_name: string;
  description: string;
  population_growth_rate_pct: number;
  projections: FutureYearProjection[];
  critical_milestone_notes: string[];
}

export interface SimulationRequest {
  base_population: number;
  annual_population_growth_rate: number;
  per_capita_water_consumption_lpcd: number;
  rainfall_variation_pct: number;
  renewable_capacity_mw: number;
  scenario_type: string;
}

export interface ISROPortalStatus {
  portal_id: string;
  name: string;
  agency: string;
  official_url: string;
  api_endpoint: string;
  connection_status: string;
  is_live: boolean;
  last_retrieval_timestamp: string;
  auth_type: string;
  token_status: string;
  dataset_used: string;
  acquisition_dates: string;
  spatial_resolution: string;
  contribution_to_analysis: string;
  sample_products: Array<Record<string, any>>;
}

export interface ISROHubOverview {
  total_portals: number;
  active_integrations: number;
  demo_mode_active: boolean;
  portals: ISROPortalStatus[];
  system_satellite_coverage_notes: string;
}

export interface AssistantResponse {
  answer: string;
  grounded_metrics_used: Record<string, any>;
  formula_references: string[];
  official_data_sources: string[];
  recommended_action: string;
}
