export interface GeoJSONGeometry {
  type: string;
  coordinates: number[][][];
}

export interface FactorScore {
  name: string;
  category: string;
  weight: number;
  score: number;
  description: string;
  status: 'favorable' | 'moderate' | 'restrictive' | 'critical';
}

export interface ExclusionZone {
  name: string;
  type: string;
  area_acres: number;
  percentage: number;
  reason: string;
}

export interface SiteSuitabilityResult {
  site_id: string;
  name: string;
  total_area_acres: number;
  total_area_sqkm: number;
  total_area_hectares: number;
  overall_suitability_score: number;
  suitability_class: string;
  methodology_summary: string;
  factors: FactorScore[];
  exclusion_zones: ExclusionZone[];
  net_developable_area_acres: number;
  recommended_carrying_capacity: number;
  density_assessment: string;
  module_summaries?: any;
}

export interface CityZone {
  id: string;
  name: string;
  type: string;
  area_acres: number;
  area_percentage: number;
  color: string;
  polygon: GeoJSONGeometry;
  description: string;
  key_features: string[];
  density_level?: string;
}

export interface MasterPlanAlternative {
  plan_id: string;
  name: string;
  tagline: string;
  philosophy: string;
  total_area_acres: number;
  planned_population: number;
  residential_density_pph: number;
  zones: CityZone[];
  road_network_km: number;
  public_transport_coverage_pct: number;
  renewable_energy_share_pct: number;
  green_open_space_pct: number;
  water_self_sufficiency_pct: number;
  carbon_offset_tpy: number;
  suitability_score: number;
}

export interface MasterPlanComparison {
  site_id: string;
  plans: MasterPlanAlternative[];
  trade_off_analysis: any;
  ai_recommended_plan_id: string;
  recommendation_reason: string;
}

export interface SimulationMilestone {
  year: number;
  population: number;
  water_demand_mld: number;
  water_supply_mld: number;
  groundwater_stress_index: number;
  energy_demand_gwh: number;
  renewable_generation_gwh: number;
  solid_waste_tpd: number;
  transport_trips_daily: number;
  green_cover_acres: number;
  co2_emissions_net_kt: number;
  resilience_score: number;
}

export interface ScenarioSimulation {
  scenario_id: string;
  scenario_name: string;
  description: string;
  milestones: SimulationMilestone[];
}

export interface FutureSimulationResult {
  site_id: string;
  plan_id: string;
  base_population: number;
  scenarios: ScenarioSimulation[];
  sensitivity_factors: Record<string, number>;
  simulation_disclaimer: string;
}

export interface ISROPortal {
  id: string;
  name: string;
  agency: string;
  portal_url: string;
  api_doc_url: string;
  logo_badge: string;
  datasets_used: string[];
  acquisition_dates: string;
  coverage: string;
  resolution: string;
  status: string;
  last_retrieval: string;
  contribution_to_analysis: string;
  api_endpoint: string;
  auth_mode: string;
}

export interface AdvisorMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  referenced_data?: string[];
  confidence_level?: string;
  suggested_followups?: string[];
  timestamp: string;
}

export interface SampleSite {
  site_id: string;
  name: string;
  state: string;
  district: string;
  center: [number, number];
  area_acres: number;
  proposed_population: number;
  polygon: GeoJSONGeometry;
  terrain_profile: {
    min_elev: number;
    max_elev: number;
    mean_elev: number;
    mean_slope: number;
    soil_type: string;
  };
}
