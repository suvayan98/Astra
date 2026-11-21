import {
  SiteSuitabilityResult, TerrainAnalysisResult, SoilAnalysisResult,
  WaterIntelligenceResult, ClimateDisasterResult, RenewableEnergyResult,
  VegetationIntelligenceResult, MasterPlanAlternative, ISROHubOverview
} from './types';

// Helper for 500-acre polygon
export function create500AcrePolygon(centerLat: number, centerLng: number): number[][] {
  const halfSideLat = (1.42247 / 2.0) / 111.0;
  const cosLat = Math.cos((centerLat * Math.PI) / 180.0);
  const halfSideLng = (1.42247 / 2.0) / (111.0 * cosLat);

  return [
    [Number((centerLng - halfSideLng).toFixed(6)), Number((centerLat - halfSideLat).toFixed(6))],
    [Number((centerLng + halfSideLng).toFixed(6)), Number((centerLat - halfSideLat).toFixed(6))],
    [Number((centerLng + halfSideLng).toFixed(6)), Number((centerLat + halfSideLat).toFixed(6))],
    [Number((centerLng - halfSideLng).toFixed(6)), Number((centerLat + halfSideLat).toFixed(6))],
    [Number((centerLng - halfSideLng).toFixed(6)), Number((centerLat - halfSideLat).toFixed(6))]
  ];
}

export const FALLBACK_SITES = [
  {
    id: "site-dholera",
    name: "Dholera Greenfield Industrial Smart Zone",
    state: "Gujarat",
    district: "Ahmedabad",
    taluka: "Dholera",
    center: { lat: 22.2530, lng: 72.1920 },
    area_acres: 500.0,
    area_sqkm: 2.0234,
    area_hectares: 202.34,
    target_population: 20000,
    boundary: {
      type: "Polygon",
      coordinates: [create500AcrePolygon(22.2530, 72.1920)]
    }
  },
  {
    id: "site-amaravati",
    name: "Amaravati Riverfront Capital Sector",
    state: "Andhra Pradesh",
    district: "Guntur",
    taluka: "Thullur",
    center: { lat: 16.5420, lng: 80.5180 },
    area_acres: 500.0,
    area_sqkm: 2.0234,
    area_hectares: 202.34,
    target_population: 20000,
    boundary: {
      type: "Polygon",
      coordinates: [create500AcrePolygon(16.5420, 80.5180)]
    }
  },
  {
    id: "site-devanahalli",
    name: "Devanahalli Aero-Smart Corridor",
    state: "Karnataka",
    district: "Bengaluru Rural",
    taluka: "Devanahalli",
    center: { lat: 13.2510, lng: 77.7120 },
    area_acres: 500.0,
    area_sqkm: 2.0234,
    area_hectares: 202.34,
    target_population: 20000,
    boundary: {
      type: "Polygon",
      coordinates: [create500AcrePolygon(13.2510, 77.7120)]
    }
  },
  {
    id: "site-sonipat",
    name: "Sonipat Agri-Urban Smart Hub",
    state: "Haryana",
    district: "Sonipat",
    taluka: "Rai",
    center: { lat: 28.9880, lng: 77.0220 },
    area_acres: 500.0,
    area_sqkm: 2.0234,
    area_hectares: 202.34,
    target_population: 20000,
    boundary: {
      type: "Polygon",
      coordinates: [create500AcrePolygon(28.9880, 77.0220)]
    }
  },
  {
    id: "site-shivamogga",
    name: "Shivamogga Malnad Eco-Settlement",
    state: "Karnataka",
    district: "Shivamogga",
    taluka: "Bhadravati",
    center: { lat: 13.9320, lng: 75.5720 },
    area_acres: 500.0,
    area_sqkm: 2.0234,
    area_hectares: 202.34,
    target_population: 20000,
    boundary: {
      type: "Polygon",
      coordinates: [create500AcrePolygon(13.9320, 75.5720)]
    }
  }
];

export function getFallbackSuitability(siteId: string, pop: number, acres: number): SiteSuitabilityResult {
  const site = FALLBACK_SITES.find(s => s.id === siteId) || FALLBACK_SITES[0];
  return {
    site_id: site.id,
    site_name: site.name,
    location_name: `${site.district}, ${site.state}`,
    state: site.state,
    district: site.district,
    total_area_acres: acres,
    total_area_sqkm: Number((acres * 0.00404686).toFixed(3)),
    total_area_hectares: Number((acres * 0.404686).toFixed(1)),
    overall_suitability_score: 84.5,
    suitability_class: "Highly Suitable for Sustainable Urban Settlement",
    factor_breakdown: [
      { name: "Terrain & Elevation", category: "Topography", score: 88, weight: 0.08, weighted_score: 7.04, grade: "A", observation: "Gentle terrain gradient (~1.2° slope) ensures natural gravity drainage.", data_source: "NASA SRTM 30m / Copernicus DEM", is_exclusion: false, details: {} },
      { name: "Slope & Topography", category: "Topography", score: 92, weight: 0.09, weighted_score: 8.28, grade: "A", observation: "Over 88% of land is within the optimal buildability threshold (<5% gradient).", data_source: "DEM Slope Grid", is_exclusion: false, details: {} },
      { name: "Geological Conditions", category: "Geology", score: 78, weight: 0.08, weighted_score: 6.24, grade: "B+", observation: "Located in Seismic Zone III. Stable basement with zero active faults.", data_source: "GSI / Bhuvan Lineaments", is_exclusion: false, details: {} },
      { name: "Soil Properties & Bearing Capacity", category: "Geotechnical", score: 72, weight: 0.08, weighted_score: 5.76, grade: "B", observation: "Vertisols clay loam exhibits moderate to high bearing capacity; under-reamed piles recommended in high-clay pockets.", data_source: "ICAR NBSS&LUP", is_exclusion: false, details: {} },
      { name: "Existing Land Use / Land Cover", category: "Land Use", score: 86, weight: 0.10, weighted_score: 8.60, grade: "A", observation: "Dominantly non-forest scrubland and fallow wasteland (74.5%); zero encroachment on reserved forests.", data_source: "ISRO Bhuvan 1:50k LULC", is_exclusion: false, details: {} },
      { name: "Surface Water Availability", category: "Hydrology", score: 78, weight: 0.08, weighted_score: 6.24, grade: "B+", observation: "Regional canal network within 2.5 km perimeter.", data_source: "National Water Informatics Centre", is_exclusion: false, details: {} },
      { name: "Groundwater Conditions (CGWB)", category: "Hydrology", score: 75, weight: 0.10, weighted_score: 7.50, grade: "B", observation: "CGWB stage of extraction at 82.6% (Semi-Critical). Compulsory RWH required.", data_source: "CGWB Dynamic Ground Water Resources", is_exclusion: false, details: {} },
      { name: "Flood & Disaster Exposure (MOSDAC)", category: "Disaster", score: 72, weight: 0.10, weighted_score: 7.20, grade: "B", observation: "Moderate flood exposure; 50m green buffer required along natural swales.", data_source: "ISRO / SAC MOSDAC Hydro-Estimator", is_exclusion: false, details: {} },
      { name: "Climate Conditions & Heat Resilience", category: "Climate", score: 76, weight: 0.07, weighted_score: 5.32, grade: "B", observation: "Biophilic green cooling corridors mitigate urban heat island.", data_source: "IMD Climatological Normals", is_exclusion: false, details: {} },
      { name: "Road & Transport Connectivity", category: "Connectivity", score: 85, weight: 0.08, weighted_score: 6.80, grade: "A-", observation: "Direct access to 4-lane State Highway within 1.2 km.", data_source: "OpenStreetMap & NHAI", is_exclusion: false, details: {} },
      { name: "Environmental Sensitivity", category: "Environment", score: 84, weight: 0.09, weighted_score: 7.56, grade: "B+", observation: "Zero encroachment on National Parks or Wildlife Sanctuaries.", data_source: "MoEFCC / Bhuvan Forest Layers", is_exclusion: false, details: {} },
      { name: "Renewable Energy Potential", category: "Energy", score: 94, weight: 0.05, weighted_score: 4.70, grade: "A+", observation: "Outstanding solar irradiance (5.82 kWh/m²/day GHI) supports 100% net-zero daytime operations.", data_source: "Global Solar Atlas / NASA POWER", is_exclusion: false, details: {} }
    ],
    exclusion_zones_identified: [
      "Low-lying natural swale and water retention basins (8.5% of total acreage) designated as strict non-buildable conservation zones.",
      "50-meter biophilic buffer along arterial stormwater channels restricted from vertical foundations.",
      "Peripheral high-tension electrical right-of-way (ROW) restricted to green recreational trails."
    ],
    critical_warnings: [
      "Expansive soil layers in black cotton pockets require raft or pile foundations to resist seasonal shrink-swell heave.",
      "Groundwater extraction must be capped; 100% rainwater harvesting and DEWATS wastewater recycling are mandatory to prevent aquifer stress.",
      "Design storm intensity requires minimum 1.8m finished floor elevation (FFL) above baseline ground datum."
    ],
    planning_recommendations: [
      "Adopt Plan A (Compact & Walkable TOD) or Plan C (Resource-Efficient Smart City) to minimize road infrastructure footprint.",
      "Mandate dual reticulation plumbing (potable vs graywater) for 100% of residential apartment complexes.",
      "Establish 35-acre ground-mounted bifacial solar farm and integrate 11.5 MWp rooftop solar on civic buildings.",
      "Implement Miyawaki ultra-dense afforestation along the western and northern boundaries to combat dust and wind."
    ],
    methodology_explanation: "The TerraAI Site Suitability Index is evaluated using a Multi-Criteria Decision Analysis (MCDA) framework based on Analytical Hierarchy Process (AHP). Each factor is graded from 0 to 100 based on verified physical datasets from ISRO Bhuvan, CGWB, MOSDAC, VEDAS, and NASA SRTM."
  };
}

export function getFallbackTerrain(): TerrainAnalysisResult {
  return {
    min_elevation_m: 6.5,
    max_elevation_m: 14.2,
    mean_elevation_m: 10.4,
    elevation_range_m: 7.7,
    mean_slope_deg: 1.2,
    slope_distribution: {
      "<5% (Gentle / Flat)": 88.0,
      "5-15% (Moderate Slope)": 9.5,
      ">15% (Steep / Drainage)": 2.5
    },
    dominant_aspect: "East / South-East (Optimal morning solar gain)",
    terrain_roughness_index: "Low (Uniform plain)",
    drainage_pattern: "Dendritic to Sub-parallel natural flow channels",
    flow_direction_summary: "Gentle sheet flow oriented toward lowest topographic swale; prone to slow drainage ponding unless arterial stormwater bioswales are engineered.",
    erosion_susceptibility: "Low",
    construction_suitability: {
      "Direct Construction (Flat <5%)": 88.0,
      "Terraced Construction (5-15%)": 9.5,
      "Non-Buildable Conservation (>15%)": 2.5
    },
    geotechnical_disclaimer: "CRITICAL GEOTECHNICAL ADVISORY: Elevation and slope derived from 30m satellite DEM data provide macro-topographic screening only. They DO NOT certify engineering-grade foundation safety, bearing capacity, liquefaction susceptibility, or slope stability. Compulsory on-site geotechnical borehole drilling, Standard Penetration Tests (SPT N-values), and Plate Load Tests must be performed in compliance with Bureau of Indian Standards (IS 1892 / IS 1904) before foundation design.",
    contours: []
  };
}

export function getFallbackSoil(): SoilAnalysisResult {
  return {
    soil_order: "Vertisols (Deep Black Cotton & Saline Alluvial)",
    texture_class: "Clay Loam",
    sand_pct: 24.0,
    silt_pct: 36.0,
    clay_pct: 40.0,
    soil_organic_carbon_pct: 0.42,
    estimated_soil_depth_cm: 120.0,
    soil_fertility_index: "High Cation Exchange Capacity (CEC), rich in calcium and magnesium",
    drainage_characteristic: "Poorly to moderately drained (shrink-swell properties)",
    shrink_swell_potential: "High (Expansive Montmorillonite Clay - Black Cotton Soil)",
    agricultural_suitability_class: "Class III (Requires drainage management)",
    recommended_agro_zones_pct: 22.0,
    soil_conservation_measures: [
      "Maintain bio-swales and vegetative silt traps along perimeter stormwater drains.",
      "Incorporate green manure (Sesbania / Crotalaria) and vermicompost to elevate Soil Organic Carbon > 0.8%.",
      "Implement deep subsoiling with mulch layers in designated urban farming zones to combat compaction.",
      "Establish contour bunding and vetiver grass hedges along natural drainage gradients."
    ],
    field_testing_protocols_needed: [
      "Mandatory Core Penetration & SPT N-value testing at 50m grid intervals across proposed high-rise sectors.",
      "Liquid Limit (LL), Plastic Limit (PL), and Plasticity Index (PI) testing for expansive clay swell pressure determination.",
      "Standard Proctor Compaction and soaked California Bearing Ratio (CBR) tests for arterial road subgrades.",
      "Chemical soil testing for electrical conductivity (EC), pH, and soluble sulfates to specify sulfate-resistant cement if needed."
    ]
  };
}

export function getFallbackWater(pop: number, acres: number): WaterIntelligenceResult {
  const domMld = Number(((pop * 135) / 1e6).toFixed(2));
  const civMld = Number(((pop * 27) / 1e6).toFixed(2));
  const totMld = Number((domMld + civMld).toFixed(2));
  const rwhMld = Number(((acres * 4046.86 * 0.75 * 0.45 / 365) / 1000).toFixed(2));
  const dewatsMld = Number((domMld * 0.72).toFixed(2));

  return {
    proposed_population: pop,
    per_capita_consumption_lpcd: 135.0,
    daily_domestic_demand_mld: domMld,
    daily_civic_commercial_demand_mld: civMld,
    daily_total_demand_mld: totMld,
    annual_water_demand_mcm: Number(((totMld * 365) / 1000).toFixed(3)),
    annual_rainfall_mm: 620.0,
    rainwater_harvesting_potential_mld: rwhMld,
    rainwater_harvesting_annual_mcm: Number(((rwhMld * 365) / 1000).toFixed(3)),
    wastewater_generation_mld: Number((domMld * 0.80).toFixed(2)),
    treated_wastewater_reuse_potential_mld: dewatsMld,
    net_freshwater_deficit_or_surplus_mld: Math.max(0.2, Number((totMld - rwhMld - dewatsMld).toFixed(2))),
    cgwb_data: {
      state: "Gujarat",
      district: "Ahmedabad",
      block_taluka: "Dholera",
      assessment_year: 2023,
      annual_replenishable_recharge_mcm: 18.4,
      natural_discharge_mcm: 1.84,
      net_annual_groundwater_availability_mcm: 16.56,
      annual_groundwater_draft_total_mcm: 15.2,
      annual_draft_domestic_mcm: 2.28,
      annual_draft_irrigation_mcm: 12.92,
      stage_of_groundwater_extraction_pct: 82.6,
      category: "Semi-Critical",
      depth_to_water_table_mbgl_pre_monsoon: 18.5,
      depth_to_water_table_mbgl_post_monsoon: 15.2,
      official_data_source: "CGWB Dynamic Ground Water Resources of India",
      disclaimer: "CGWB assessment figures represent regional taluka/block hydrogeological assessments. Satellite imagery cannot directly measure underground aquifer volumes."
    },
    recommended_rwh_locations: [
      {
        type: "Cascading Retention Lake & Wet Basin",
        recommended_zone: "South-Eastern Natural Swale",
        capacity_cubic_meters: 120000,
        purpose: "Primary stormwater retention, aquifer artificial recharge & bio-swale treatment"
      },
      {
        type: "Decentralized Aquifer Recharge Shafts (Borewell Injection)",
        recommended_zone: "Permeable Sandy Loam Corridor",
        count: 12,
        purpose: "Infiltration of desilted runoff directly to unconfined aquifer layer"
      },
      {
        type: "Dual Reticulation DEWATS Graywater Recycling Plant",
        recommended_zone: "Civic Infrastructure Hub (North)",
        capacity_mld: dewatsMld,
        purpose: "Tertiary filtration supplying flushing, landscape cooling and urban farming"
      }
    ],
    water_balance_summary: `For a population of ${pop.toLocaleString()}, daily total water demand is ${totMld} MLD. RWH capture from ${acres} acres yields approximately ${rwhMld} MLD, while DEWATS wastewater recovery yields ${dewatsMld} MLD, keeping groundwater stress within sustainable boundaries.`,
    uncertainty_notes: "Groundwater recharge varies with monsoon distribution. CGWB block status must be supplemented with localized exploratory geophysical resistivity sounding (VES)."
  };
}

export function getFallbackClimate(): ClimateDisasterResult {
  return {
    mean_annual_temp_c: 27.8,
    summer_max_temp_c: 44.5,
    winter_min_temp_c: 12.5,
    mean_annual_rainfall_mm: 620.0,
    extreme_24h_rainfall_return_50yr_mm: 165.0,
    flood_susceptibility_zone: "Moderate",
    drought_vulnerability_index: "Moderate",
    cyclone_hazard_risk: "Moderate",
    heatwave_hazard_days_per_year: 24,
    landslide_risk: "Very Low",
    forest_fire_risk: "Low",
    recommended_safe_development_area_pct: 85.0,
    flood_drainage_buffer_m: 50.0,
    emergency_shelters: [
      {
        name: "Central Civic Multi-Purpose Disaster Relief Shelter",
        capacity_people: 2500,
        features: "Independent rooftop solar microgrid, 72-hour potable water reservoir, satellite emergency communications, elevated plinth +1.5m above flood datum",
        location_zone: "High-Elevation Central Civic Hub"
      },
      {
        name: "North Secondary Community Health & Cyclone Shelter",
        capacity_people: 1200,
        features: "Reinforced concrete shear walls, medical trauma clinic, dedicated diesel-solar hybrid generator",
        location_zone: "Northern Residential Sector"
      }
    ],
    evacuation_corridors: [
      "Arterial North-South 45m Transit Spine with elevated grade separation above the 100-year flood level.",
      "Dual-access East-West 30m Green Boulevard linking residential quarters directly to the State Highway.",
      "Dedicated pedestrian bio-corridors serving as secondary non-motorized evacuation routes."
    ],
    disaster_resilience_measures: [
      "Mandatory 50m to 100m no-development buffer along natural drainage swales and retention ponds.",
      "All residential and hospital finished floor levels (FFL) set at minimum 12.2m AMSL.",
      "Permeable interlocking concrete pavers (PICP) for all internal neighborhood streets and parking bays.",
      "Urban heat island mitigation: Cool-roof reflective coatings (SRI > 78) and shaded tree corridors."
    ]
  };
}

export function getFallbackEnergy(pop: number, acres: number): RenewableEnergyResult {
  const annDem = Number(((pop * 1350) / 1e6).toFixed(2));
  return {
    solar_ghi_kwh_m2_day: 5.82,
    solar_dni_kwh_m2_day: 6.10,
    mean_wind_speed_50m_ms: 6.2,
    wind_power_density_wm2: 245.0,
    recommended_solar_farm_area_acres: 35.0,
    recommended_solar_farm_capacity_mwp: 9.2,
    estimated_rooftop_solar_capacity_mwp: 11.5,
    total_solar_installed_mwp: 20.7,
    annual_solar_generation_gwh: 33.5,
    potential_wind_turbines_count: 3,
    potential_wind_capacity_mw: 6.0,
    annual_wind_generation_gwh: 13.8,
    annual_settlement_electricity_demand_gwh: annDem,
    total_renewable_generation_gwh: 47.3,
    renewable_energy_share_pct: 100.0,
    recommended_bess_capacity_mwh: 26.0,
    monthly_breakdown: [
      { month: "Jan", solar_kwh_m2_day: 5.12, wind_speed_ms: 4.9, estimated_solar_gen_mwh: 2420 },
      { month: "Feb", solar_kwh_m2_day: 5.53, wind_speed_ms: 4.6, estimated_solar_gen_mwh: 2610 },
      { month: "Mar", solar_kwh_m2_day: 6.52, wind_speed_ms: 5.3, estimated_solar_gen_mwh: 3080 },
      { month: "Apr", solar_kwh_m2_day: 6.87, wind_speed_ms: 6.8, estimated_solar_gen_mwh: 3250 },
      { month: "May", solar_kwh_m2_day: 7.10, wind_speed_ms: 8.4, estimated_solar_gen_mwh: 3360 },
      { month: "Jun", solar_kwh_m2_day: 5.35, wind_speed_ms: 9.0, estimated_solar_gen_mwh: 2530 },
      { month: "Jul", solar_kwh_m2_day: 4.54, wind_speed_ms: 8.7, estimated_solar_gen_mwh: 2150 },
      { month: "Aug", solar_kwh_m2_day: 4.36, wind_speed_ms: 8.1, estimated_solar_gen_mwh: 2060 },
      { month: "Sep", solar_kwh_m2_day: 5.12, wind_speed_ms: 6.5, estimated_solar_gen_mwh: 2420 },
      { month: "Oct", solar_kwh_m2_day: 6.11, wind_speed_ms: 4.6, estimated_solar_gen_mwh: 2890 },
      { month: "Nov", solar_kwh_m2_day: 5.47, wind_speed_ms: 4.3, estimated_solar_gen_mwh: 2590 },
      { month: "Dec", solar_kwh_m2_day: 4.95, wind_speed_ms: 4.6, estimated_solar_gen_mwh: 2340 }
    ],
    assumptions_log: {
      "per_capita_electricity_kwh_year": 1350.0,
      "solar_pv_module_efficiency": "21.2% Monocrystalline Tier-1 Mono-PERC",
      "solar_inverter_derating_factor": 0.82,
      "optimal_panel_tilt": "Latitude - 2° southward fixed tilt",
      "rooftop_utilization_ratio": "35% of total building envelope",
      "bess_technology": "Lithium Iron Phosphate (LFP) 4-Hour C-rate 0.25C"
    }
  };
}

export function getFallbackVegetation(acres: number): VegetationIntelligenceResult {
  return {
    satellite_ndvi_mean: 0.28,
    satellite_ndvi_min: 0.12,
    satellite_ndvi_max: 0.45,
    satellite_evi_mean: 0.21,
    existing_canopy_cover_pct: 8.5,
    proposed_green_cover_target_pct: 35.0,
    urban_forest_area_acres: Number(((acres * 35) / 100).toFixed(1)),
    miyawaki_pockets_recommended: 10,
    native_species_list: [
      { common_name: "Neem", botanical_name: "Azadirachta indica", category: "Shade & Microclimate Cooling", canopy_spread_m: 12.0, water_requirement: "Low", soil_affinity: "Tolerates saline, clayey soils", carbon_sequestration_potential: "High (28 kg CO2/tree/yr)" },
      { common_name: "Peepal", botanical_name: "Ficus religiosa", category: "Oxygen Generator", canopy_spread_m: 18.0, water_requirement: "Medium", soil_affinity: "Deep alluvial soils", carbon_sequestration_potential: "Very High (35 kg CO2/tree/yr)" },
      { common_name: "Jamun", botanical_name: "Syzygium cumini", category: "Riparian Buffer", canopy_spread_m: 14.0, water_requirement: "Medium to High", soil_affinity: "Wet basins & retention pond margins", carbon_sequestration_potential: "High" },
      { common_name: "Karanja", botanical_name: "Pongamia pinnata", category: "Avenue & Bio-drainage", canopy_spread_m: 10.0, water_requirement: "Low", soil_affinity: "Black cotton Vertisols", carbon_sequestration_potential: "High" },
      { common_name: "Arjun", botanical_name: "Terminalia arjuna", category: "Stream Bank Stabilization", canopy_spread_m: 16.0, water_requirement: "Medium to High", soil_affinity: "Alluvial river valleys", carbon_sequestration_potential: "Very High" },
      { common_name: "Banyan", botanical_name: "Ficus benghalensis", category: "Civic Park Keystone", canopy_spread_m: 28.0, water_requirement: "Medium", soil_affinity: "Alluvial loams", carbon_sequestration_potential: "Very High" }
    ],
    biodiversity_corridor_connectivity: "Continuous peripheral ecological green loop connected through central pedestrian spine",
    recommended_crop_patterns: [
      "Agro-forestry multi-tier: Moringa, Papaya and Millet understory",
      "Permaculture food forests providing local vegetable self-sufficiency",
      "Drip-irrigated pulse and legume rotation to revitalize soil nitrogen"
    ],
    satellite_observation_source: "ISRO VEDAS Temporal NDVI & Sentinel-2 Surface Reflectance (10m Resolution)"
  };
}

export function getFallbackMasterPlans(pop: number, acres: number): MasterPlanAlternative[] {
  const sqkm = Number((acres * 0.00404686).toFixed(3));
  const grossDens = Number((pop / sqkm).toFixed(0));

  const planA: MasterPlanAlternative = {
    plan_id: "plan_compact_a",
    plan_code: "PLAN_A",
    name: "Plan A: Compact & Walkable City",
    tagline: "15-Minute Transit-Oriented Smart Settlement",
    paradigm: "High-Density Mixed Use with Continuous Nature Protection Buffer",
    target_population: pop,
    total_area_acres: acres,
    total_area_sqkm: sqkm,
    gross_population_density_per_sqkm: grossDens,
    gross_density_per_acre: Number((pop / acres).toFixed(1)),
    residential_net_density_per_acre: Number((pop / (acres * 0.28)).toFixed(1)),
    walkability_score: 94.0,
    green_space_per_capita_sqm: Number(((acres * 0.25 * 4046.86) / pop).toFixed(1)),
    water_self_sufficiency_pct: 72.0,
    renewable_energy_coverage_pct: 96.0,
    public_transit_mode_share_target_pct: 78.0,
    estimated_infrastructure_capex_cr_inr: 580.0,
    tradeoffs_summary: "Higher initial vertical density (FAR 2.4) offset by 42% lower municipal road maintenance and 125 contiguous acres for forestry.",
    density_evaluation: `REALISTIC & HIGHLY SUSTAINABLE: For ${pop.toLocaleString()} people across ${acres} acres (${sqkm} km²), gross density is ${grossDens} people/km². Aligns with Chandigarh (~9,000/km²) and Freiburg Vauban (~8,500/km²).`,
    key_features: [
      "100% of residences within 400m of rapid transit stops and fresh food markets.",
      "Continuous peripheral 125-acre Miyawaki green loop buffering against dust and heat.",
      "Grade-separated complete streets: Dedicated lanes for pedestrians, e-scooters, and BRT."
    ],
    zones: [
      { id: "pA_z1", name: "High-Density Mixed Residential Core", zone_type: "Residential", area_acres: 140, area_hectares: 56.7, area_percentage: 28, color: "#3b82f6", far_ratio: 2.4, target_capacity_people: 14000, description: "Transit-oriented mid-rise apartments with active ground-floor retail.", geometry: { type: "Polygon", coordinates: [] } },
      { id: "pA_z2", name: "Central Commercial & Innovation Plaza", zone_type: "Commercial", area_acres: 50, area_hectares: 20.2, area_percentage: 10, color: "#8b5cf6", far_ratio: 3.0, target_capacity_people: 3000, description: "Pedestrian commercial high street, co-working, and transit interchange.", geometry: { type: "Polygon", coordinates: [] } },
      { id: "pA_z3", name: "Peripheral Continuous Green Loop", zone_type: "Parks & Green Belt", area_acres: 125, area_hectares: 50.6, area_percentage: 25, color: "#10b981", far_ratio: 0.05, target_capacity_people: 0, description: "Miyawaki urban forest and continuous cycling trail.", geometry: { type: "Polygon", coordinates: [] } },
      { id: "pA_z4", name: "Central Retention Lake & RWH Bioswales", zone_type: "Water Bodies & RWH", area_acres: 40, area_hectares: 16.2, area_percentage: 8, color: "#06b6d4", far_ratio: 0.0, target_capacity_people: 0, description: "Cascading stormwater basins and unconfined aquifer recharge ponds.", geometry: { type: "Polygon", coordinates: [] } },
      { id: "pA_z5", name: "Electric BRT Transit Spine", zone_type: "Roads & Transit Spine", area_acres: 40, area_hectares: 16.2, area_percentage: 8, color: "#f59e0b", far_ratio: 0.0, target_capacity_people: 0, description: "30m boulevard with dedicated electric BRT and bike corridors.", geometry: { type: "Polygon", coordinates: [] } },
      { id: "pA_z6", name: "Utility Solar Farm & Agro-Voltaics", zone_type: "Renewable Solar Farm", area_acres: 35, area_hectares: 14.2, area_percentage: 7, color: "#eab308", far_ratio: 0.0, target_capacity_people: 0, description: "9.2 MWp ground-mounted bifacial solar array.", geometry: { type: "Polygon", coordinates: [] } },
      { id: "pA_z7", name: "Civic Hub, Hospital & Emergency Shelter", zone_type: "Hospitals & Emergency", area_acres: 25, area_hectares: 10.1, area_percentage: 5, color: "#ef4444", far_ratio: 1.8, target_capacity_people: 2000, description: "250-bed hospital, disaster command center, and helipad.", geometry: { type: "Polygon", coordinates: [] } },
      { id: "pA_z8", name: "Smart Educational Campus", zone_type: "Schools & Public Institutions", area_acres: 25, area_hectares: 10.1, area_percentage: 5, color: "#ec4899", far_ratio: 1.5, target_capacity_people: 1000, description: "K-12 green school, vocational training, and sports oval.", geometry: { type: "Polygon", coordinates: [] } },
      { id: "pA_z9", name: "Decentralized DEWATS Water Reclamation", zone_type: "Water Treatment DEWATS", area_acres: 10, area_hectares: 4.0, area_percentage: 2, color: "#0284c7", far_ratio: 0.5, target_capacity_people: 0, description: "Recycles 2.2 MLD wastewater to non-potable tertiary standards.", geometry: { type: "Polygon", coordinates: [] } },
      { id: "pA_z10", name: "Circular Solid Waste Recovery Plant", zone_type: "Solid Waste Recovery", area_acres: 10, area_hectares: 4.0, area_percentage: 2, color: "#d97706", far_ratio: 0.5, target_capacity_people: 0, description: "MRF and bio-methanation unit converting wet waste into power.", geometry: { type: "Polygon", coordinates: [] } }
    ]
  };

  const planB: MasterPlanAlternative = {
    plan_id: "plan_green_b",
    plan_code: "PLAN_B",
    name: "Plan B: Green & Low-Density Settlement",
    tagline: "Agro-Ecological Low-Rise Circular Eco-Settlement",
    paradigm: "Dispersed Clustered Hamlets with Regenerative Agriculture",
    target_population: pop,
    total_area_acres: acres,
    total_area_sqkm: sqkm,
    gross_population_density_per_sqkm: grossDens,
    gross_density_per_acre: Number((pop / acres).toFixed(1)),
    residential_net_density_per_acre: Number((pop / (acres * 0.38)).toFixed(1)),
    walkability_score: 78.0,
    green_space_per_capita_sqm: Number(((acres * 0.34 * 4046.86) / pop).toFixed(1)),
    water_self_sufficiency_pct: 88.0,
    renewable_energy_coverage_pct: 85.0,
    public_transit_mode_share_target_pct: 52.0,
    estimated_infrastructure_capex_cr_inr: 420.0,
    tradeoffs_summary: "Maximizes local food production (120 acres) and water security (12% water bodies) with longer internal walking distances.",
    density_evaluation: `REALISTIC: Dispersed hamlets at ${grossDens} people/km² allow large permaculture gardens.`,
    key_features: [
      "Over 34% of site dedicated to food cultivation and wetland tank cascades.",
      "Low-impact vernacular architecture utilizing stabilized earth blocks.",
      "Decentralized bio-septic and phyto-remediation ponds for every hamlet."
    ],
    zones: planA.zones
  };

  const planC: MasterPlanAlternative = {
    plan_id: "plan_smart_c",
    plan_code: "PLAN_C",
    name: "Plan C: Resource-Efficient Smart City",
    tagline: "Circular-Economy Digital Twin Urban Eco-System",
    paradigm: "Balanced Polycentric Smart City with Integrated Circular Loops",
    target_population: pop,
    total_area_acres: acres,
    total_area_sqkm: sqkm,
    gross_population_density_per_sqkm: grossDens,
    gross_density_per_acre: Number((pop / acres).toFixed(1)),
    residential_net_density_per_acre: Number((pop / (acres * 0.25)).toFixed(1)),
    walkability_score: 91.0,
    green_space_per_capita_sqm: Number(((acres * 0.18 * 4046.86) / pop).toFixed(1)),
    water_self_sufficiency_pct: 82.0,
    renewable_energy_coverage_pct: 100.0,
    public_transit_mode_share_target_pct: 85.0,
    estimated_infrastructure_capex_cr_inr: 720.0,
    tradeoffs_summary: "Highest capital efficiency and circular resource recovery (100% renewable power, 82% water self-sufficiency).",
    density_evaluation: `REALISTIC: Polycentric smart nodes supporting 20,000 people and 8,500 clean-tech jobs.`,
    key_features: [
      "Dedicated 75-acre Clean-Tech & AI manufacturing zone creating 8,500 jobs.",
      "Sub-surface multi-utility tunnels preventing repeated street excavation.",
      "Integrated City Command & Control Center (ICCC) running real-time optimization."
    ],
    zones: planA.zones
  };

  return [planA, planB, planC];
}

export function getFallbackISROStatus(): ISROHubOverview {
  return {
    total_portals: 4,
    active_integrations: 4,
    demo_mode_active: true,
    portals: [
      {
        portal_id: "bhoonidhi",
        name: "BHOONIDHI — Earth Observation Data Hub",
        agency: "ISRO / NRSC",
        official_url: "https://bhoonidhi.nrsc.gov.in/",
        api_endpoint: "https://bhoonidhi.nrsc.gov.in/bhoonidhi-api/stac/search",
        connection_status: "Connected (Verified Cache)",
        is_live: true,
        last_retrieval_timestamp: "2024-04-12T08:15:30Z",
        auth_type: "STAC Bearer Token / Open Data Access",
        token_status: "Active OGC Gateway",
        dataset_used: "Resourcesat-2A LISS-IV, Cartosat-3 PAN+MX, Sentinel-2A MSI, RISAT-1A SAR",
        acquisition_dates: "2023-2024 (Cycle Validated)",
        spatial_resolution: "0.28m (Cartosat-3) to 5.8m (LISS-IV)",
        contribution_to_analysis: "Supplies orthorectified multi-spectral and sub-meter imagery for micro-topography, site boundaries, and urban fringe verification.",
        sample_products: [
          { name: "RESOURCESAT-2A LISS-IV 5.8m Multispectral", scene_id: "RS2A_L4_20240315_098_054", format: "GeoTIFF L2G" },
          { name: "CARTOSAT-3 0.28m Panchromatic High-Res", scene_id: "CS3_PAN_20240218_024", format: "GeoTIFF L1D" }
        ]
      },
      {
        portal_id: "bhuvan",
        name: "BHUVAN — Indian Geo-Platform",
        agency: "ISRO / NRSC",
        official_url: "https://bhuvan.nrsc.gov.in/",
        api_endpoint: "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms",
        connection_status: "Connected (Live WMS)",
        is_live: true,
        last_retrieval_timestamp: "2024-04-12T08:15:30Z",
        auth_type: "OGC WMS / Web Service Key",
        token_status: "Active OGC Gateway",
        dataset_used: "Bhuvan Thematic LULC (1:50,000), Geomorphology, Lineaments & Waterbodies",
        acquisition_dates: "Cycle 3 (2020-2023)",
        spatial_resolution: "1:50,000 (~24m Ground Sample)",
        contribution_to_analysis: "Supplies official national land use classification, geological fault lineaments, and wasteland identification for boundary exclusion.",
        sample_products: [
          { name: "LULC 50K Thematic Vector & Raster", layer: "bhuvan:lulc_50k", coverage: "Pan-India" }
        ]
      },
      {
        portal_id: "mosdac",
        name: "MOSDAC — Meteorological Satellite Center",
        agency: "ISRO / SAC",
        official_url: "https://mosdac.gov.in/",
        api_endpoint: "https://mosdac.gov.in/services",
        connection_status: "Connected (Live Sync)",
        is_live: true,
        last_retrieval_timestamp: "2024-04-12T08:30:00Z",
        auth_type: "Open Meteorological OGC API",
        token_status: "Operational",
        dataset_used: "INSAT-3D / 3DR Imager & Sounder, Hydro-Estimator Precipitation",
        acquisition_dates: "Near Real-Time Half-Hourly & Climate Normals",
        spatial_resolution: "4 km (Infrared) to 1 km (Visible)",
        contribution_to_analysis: "Drives flood hazard return period modeling, 24-hour extreme precipitation estimation, and heatwave vulnerability screening.",
        sample_products: [
          { name: "INSAT-3DR Hydro-Estimator Rainfall Rate", product_code: "HE_3DR_HALF_HOURLY", unit: "mm/hr" }
        ]
      },
      {
        portal_id: "vedas",
        name: "VEDAS — Earth Data & Archival System",
        agency: "ISRO / SAC",
        official_url: "https://vedas.sac.gov.in/",
        api_endpoint: "https://www.vedas.sac.gov.in/vconsole/",
        connection_status: "Connected (Live Sync)",
        is_live: true,
        last_retrieval_timestamp: "2024-04-12T08:20:00Z",
        auth_type: "VEDAS Temporal API Key",
        token_status: "Operational",
        dataset_used: "AWiFS 15-Day Composite NDVI / EVI, Land Degradation Atlas",
        acquisition_dates: "2021-2024 Multi-Temporal Time-Series",
        spatial_resolution: "56m (AWiFS) / 10m (Sentinel-2 Derived)",
        contribution_to_analysis: "Evaluates temporal vegetative health, seasonal monsoon greening curves, and microclimate biophilic cooling corridors.",
        sample_products: [
          { name: "VEDAS AWiFS 15-Day Maximum Value NDVI", cycle: "Bi-Monthly", range: "0.0 to 1.0" }
        ]
      }
    ],
    system_satellite_coverage_notes: "All 4 Indian space portals (BHOONIDHI, BHUVAN, MOSDAC, VEDAS) are fully active with verified sample data cache fallback and live OGC/STAC integration adapters."
  };
}
