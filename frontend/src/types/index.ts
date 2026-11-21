// TerraCity AI - Domain Type Definitions

export type RegionId = 'up_jewar' | 'dholera';

export type PriorityPreset = 'balanced' | 'climate_resilient' | 'infra_first';

export type ScenarioPreset = 'baseline' | 'high_growth_climate_stressed' | 'green_transition';

export interface Region {
  id: RegionId;
  name: string;
  state: string;
  badge: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  description: string;
  primaryPortalCoverage: string;
  candidateSites: CandidateSite[];
}

export interface CandidateSite {
  id: string; // 'site_a' | 'site_b' | 'site_c'
  code: 'A' | 'B' | 'C';
  name: string;
  regionId: RegionId;
  color: string;
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  areaKm2: number;
  description: string;
  tag: string;
}

export interface IndicatorSource {
  portal: 'Bhoonidhi' | 'Bhuvan' | 'MOSDAC' | 'VEDAS' | 'OpenStreetMap' | 'BIS / NDMA';
  dataset: string;
  resolution: string;
  vintage: string;
  method: string;
}

export interface IndicatorValue {
  key: string;
  name: string;
  pillar: 'terrain' | 'water' | 'hazards' | 'environment' | 'infrastructure';
  value: number | string;
  displayValue: string;
  unit: string;
  score: number; // 0 - 100
  weight: number; // Percentage contribution
  source: IndicatorSource;
  confidence: 'High' | 'Medium' | 'Low';
  benchmark: string;
}

export interface PillarScore {
  pillar: 'terrain' | 'water' | 'hazards' | 'environment' | 'infrastructure';
  name: string;
  weight: number;
  rawScore: number; // 0 - 100
  weightedScore: number;
  rank: number;
  strengths: string[];
  risks: string[];
}

export interface DealBreaker {
  id: string;
  rule: string;
  triggered: boolean;
  severity: 'HARD_STOP' | 'WARNING';
  threshold: string;
  actualValue: string;
  description: string;
  zoneGeoJson?: GeoJSON.FeatureCollection;
}

export interface SiteScorecard {
  siteId: string;
  siteCode: 'A' | 'B' | 'C';
  siteName: string;
  regionId: RegionId;
  overallScore: number; // 0 - 100
  rank: number;
  verdict: 'Highly Suitable' | 'Moderately Suitable' | 'Constrained' | 'Unviable (Hard Stop)';
  verdictTier: 'A' | 'B' | 'C' | 'D';
  verdictDescription: string;
  confidencePct: number;
  confidenceLabel: 'High' | 'Medium' | 'Low';
  dealBreakers: DealBreaker[];
  hasDealBreaker: boolean;
  pillars: Record<string, PillarScore>;
  radarData: { pillar: string; score: number; fullMark: number }[];
  indicators: IndicatorValue[];
  dealBreakerZones?: GeoJSON.FeatureCollection;
}

export interface CompareResult {
  regionId: RegionId;
  scenario: ScenarioPreset;
  preset: PriorityPreset;
  sites: SiteScorecard[];
  topSite: SiteScorecard;
  runnerUp?: SiteScorecard;
  scoreDelta: number;
  isTie: boolean;
  tieCheckNote?: string;
  top3Drivers: {
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    delta: string;
  }[];
  executiveSummary: string;
}

export interface WaterStressYear {
  year: number;
  population: number;
  demandMLD: number;
  baseSupplyMLD: number;
  lowSupplyMLD: number;
  highSupplyMLD: number;
  stressIndex: number;
}

export interface StressTestResponse {
  siteId: string;
  siteName: string;
  horizon: 2035 | 2050;
  targetPopulation: number;
  scenario: ScenarioPreset;
  currentDemandMLD: number;
  horizonDemandMLD: number;
  horizonBaseSupplyMLD: number;
  stressIndex: number;
  stressCategory: 'Sustainable' | 'Stressed' | 'Critical Deficit';
  floodStressBadge: {
    category: 'Low' | 'Moderate' | 'Severe';
    label: string;
    drainageCapacity: string;
    residualRisk: string;
  };
  uncertaintyRangeMLD: [number, number];
  timeseries: WaterStressYear[];
  recommendation: string;
}

export interface ProvenanceRecord {
  id: string;
  portal: 'Bhoonidhi' | 'Bhuvan' | 'MOSDAC' | 'VEDAS' | 'OpenStreetMap' | 'BIS / NDMA';
  dataset: string;
  theme: string;
  resolution: string;
  vintage: string;
  updateFrequency: string;
  accessMethod: string;
  coverageStatus: 'Verified 100%' | 'Regional Fallback' | 'Proxy Fallback';
  status: 'active' | 'fallback';
  link: string;
  indicatorsFed: string[];
}

export interface Assumptions {
  pop0: number; // Base population
  targetPop: number; // Horizon population
  lpcd: number; // Litres per capita per day (default: 135)
  catchmentMultiplier: number; // Catchment area multiplier (default: 3.0)
  externalSupplyMLD: number; // External piped supply (default: 15.0)
  yieldGood: number; // 0.20
  yieldModerate: number; // 0.12
  yieldPoor: number; // 0.06
  roadBufferM: number; // 5000
  amenityBufferM: number; // 7500
  substationBufferM: number; // 10000
}

export interface LayerOverlay {
  id: 'terrain' | 'lulc' | 'flood' | 'landslide' | 'water' | 'ndvi';
  name: string;
  portal: string;
  visible: boolean;
  opacity: number;
  color: string;
  legend: { label: string; color: string }[];
}


// ============================================================================
// TerraAI Smart City Planning Platform Core Types
// ============================================================================

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
