import {
  Region,
  SiteScorecard,
  CompareResult,
  StressTestResponse,
  ProvenanceRecord,
  Assumptions,
  PriorityPreset,
  ScenarioPreset,
  RegionId,
  LayerOverlay,
  WaterStressYear,
} from '../types';

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  pop0: 150000,
  targetPop: 450000,
  lpcd: 135,
  catchmentMultiplier: 3.0,
  externalSupplyMLD: 15.0,
  yieldGood: 0.20,
  yieldModerate: 0.12,
  yieldPoor: 0.06,
  roadBufferM: 5000,
  amenityBufferM: 7500,
  substationBufferM: 10000,
};

export const DEMO_REGIONS: Region[] = [
  {
    id: 'up_jewar',
    name: 'UP Jewar Greenfield Corridor',
    state: 'Uttar Pradesh (Gautam Buddha Nagar)',
    badge: 'Primary Demo Region • Full 4-Portal + Bhuvan Flood',
    center: [28.185, 77.585],
    zoom: 12,
    bbox: [77.48, 28.10, 77.70, 28.28],
    description: 'High-growth urban expansion corridor surrounding Noida International Airport (Jewar). Primary demonstration area featuring complete 4-portal ISRO coverage and real Bhuvan thematic flood inundation layers.',
    primaryPortalCoverage: 'Bhoonidhi CartoDEM 30m • Bhuvan LULC/Flood • MOSDAC IMERG Rainfall • VEDAS Sentinel-2',
    candidateSites: [
      {
        id: 'site_a',
        code: 'A',
        name: 'Jewar Greenfield Hub (Sector 28-32)',
        regionId: 'up_jewar',
        color: '#10b981', // Emerald
        coordinates: [
          [28.210, 77.560],
          [28.210, 77.610],
          [28.175, 77.610],
          [28.175, 77.560],
        ],
        areaKm2: 24.5,
        description: 'Elevated well-drained plain east of Noida International Airport. Optimal buildable slope (<2%), direct link to Yamuna Expressway, minimal flood hazard overlap.',
        tag: 'Recommended Primary Site',
      },
      {
        id: 'site_b',
        code: 'B',
        name: 'Yamuna Floodplain Fringe (Tappal Lowlands)',
        regionId: 'up_jewar',
        color: '#ef4444', // Red (Deal-breaker triggered)
        coordinates: [
          [28.165, 77.505],
          [28.165, 77.555],
          [28.130, 77.555],
          [28.130, 77.505],
        ],
        areaKm2: 22.8,
        description: 'Riparian buffer near Yamuna river. Severe flood hazard overlap (>52% Bhuvan high flood recurrence) and wetland ecology. Triggers automatic exclusion deal-breaker.',
        tag: 'Hard-Stop Deal Breaker',
      },
      {
        id: 'site_c',
        code: 'C',
        name: 'Khurja Agricultural Fringe (Eastern Spur)',
        regionId: 'up_jewar',
        color: '#8b5cf6', // Violet
        coordinates: [
          [28.225, 77.630],
          [28.225, 77.680],
          [28.190, 77.680],
          [28.190, 77.630],
        ],
        areaKm2: 25.1,
        description: 'Agricultural cropland corridor east of freight railway line. Safe from flooding and gentle terrain, but high prime agricultural land displacement penalty and longer infra distance.',
        tag: 'Viable with Offsets',
      },
    ],
  },
  {
    id: 'dholera',
    name: 'Dholera Special Investment Region (SIR)',
    state: 'Gujarat (Ahmedabad District)',
    badge: 'Secondary Demo Region • HAND Proxy Fallback',
    center: [22.245, 72.195],
    zoom: 12,
    bbox: [72.08, 22.12, 72.32, 22.36],
    description: 'Greenfield smart industrial metropolis along the Gulf of Khambhat. Demonstrates CartoDEM HAND (Height Above Nearest Drainage) flood proxy fallback where empirical thematic flood maps have gaps.',
    primaryPortalCoverage: 'Bhoonidhi CartoDEM 30m • Bhuvan LULC • MOSDAC Rainfall • VEDAS NDVI • HAND Proxy',
    candidateSites: [
      {
        id: 'site_a',
        code: 'A',
        name: 'Dholera Industrial Core (TP1/TP2)',
        regionId: 'dholera',
        color: '#10b981',
        coordinates: [
          [22.270, 22.270 > 30 ? 72.180 : 72.180],
          [22.270, 72.230],
          [22.235, 72.230],
          [22.235, 72.180],
        ],
        areaKm2: 26.2,
        description: 'Engineered Town Planning Schemes 1 & 2. Graded buildable land, proximity to Dholera Expressway & Narmada canal feeder branch.',
        tag: 'Optimal Industrial Core',
      },
      {
        id: 'site_b',
        code: 'B',
        name: 'Gulf Tidal Marsh Fringe (Southern Buffer)',
        regionId: 'dholera',
        color: '#ef4444',
        coordinates: [
          [22.215, 72.140],
          [22.215, 72.190],
          [22.180, 72.190],
          [22.180, 72.140],
        ],
        areaKm2: 23.9,
        description: 'Low-elevation coastal depression with HAND < 1.8m and saline mudflat ecology. Triggers HAND coastal flood proxy hard-stop threshold.',
        tag: 'HAND Flood Deal-Breaker',
      },
      {
        id: 'site_c',
        code: 'C',
        name: 'Bhogavo Riparian Infill (North-West)',
        regionId: 'dholera',
        color: '#8b5cf6',
        coordinates: [
          [22.290, 72.120],
          [22.290, 72.170],
          [22.255, 72.170],
          [22.255, 72.120],
        ],
        areaKm2: 24.8,
        description: 'Upper basin infill along Bhogavo river tributaries. Moderate flood elevation, higher distance to expressway corridor.',
        tag: 'Secondary Option',
      },
    ],
  },
];

// Spatial Deal-Breaker GeoJSON for visual rendering on map
export const JEWAR_DEAL_BREAKER_ZONES: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        siteId: 'site_b',
        name: 'Yamuna 1-in-25yr High Flood Inundation Zone',
        rule: 'Bhuvan Flood Inundation > 50%',
        hazardType: 'Flood Hazard Zone',
        areaPct: 53.4,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.510, 28.160],
            [77.545, 28.162],
            [77.550, 28.140],
            [77.525, 28.132],
            [77.510, 28.145],
            [77.510, 28.160],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        siteId: 'site_b',
        name: 'Yamuna Riparian Wetland & Marsh Overlap',
        rule: 'Wetland / Waterbody Overlap > 15%',
        hazardType: 'Ecological Exclusion',
        areaPct: 18.2,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.530, 28.155],
            [77.552, 28.153],
            [77.548, 28.135],
            [77.530, 28.142],
            [77.530, 28.155],
          ],
        ],
      },
    },
  ],
};

export const DHOLERA_DEAL_BREAKER_ZONES: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        siteId: 'site_b',
        name: 'CartoDEM HAND Tidal Inundation Proxy (<2.0m)',
        rule: 'HAND Flood Proxy > 45%',
        hazardType: 'Coastal Inundation Proxy',
        areaPct: 48.7,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.145, 22.210],
            [72.185, 22.212],
            [72.188, 22.185],
            [72.155, 22.182],
            [72.145, 22.195],
            [72.145, 22.210],
          ],
        ],
      },
    },
  ],
};

export const PROVENANCE_RECORDS: ProvenanceRecord[] = [
  {
    id: 'bhoonidhi_cartodem',
    portal: 'Bhoonidhi',
    dataset: 'CartoDEM Version 3.1 Digital Elevation Model',
    theme: 'Terrain & Geomorphology',
    resolution: '30m postings (UTM Projector)',
    vintage: '2023-R2',
    updateFrequency: 'Annual Re-baseline',
    accessMethod: 'NRSC Bhoonidhi Open Data Token API',
    coverageStatus: 'Verified 100%',
    status: 'active',
    link: 'https://bhoonidhi.nrsc.gov.in',
    indicatorsFed: ['Slope Profile', 'Buildable Area Share', 'Terrain Roughness Index (TRI)', 'HAND Flood Proxy'],
  },
  {
    id: 'bhuvan_thematic',
    portal: 'Bhuvan',
    dataset: '1:50,000 Thematic LULC (55-Class) & Flood Hazard',
    theme: 'Land Cover & Hydro Hazards',
    resolution: '1:50,000 Scale (~15m Equivalent)',
    vintage: '2022-2023 Cycle',
    updateFrequency: 'Biennial Cycle',
    accessMethod: 'ISRO Bhuvan OGC WMS / GeoPackage Vector Tile',
    coverageStatus: 'Verified 100%',
    status: 'active',
    link: 'https://bhuvan.nrsc.gov.in',
    indicatorsFed: ['Wasteland vs Cropland Share', 'Wetland Overlap', 'Multi-Year Flood Inundation Frequency', '15km Surface Water Buffer'],
  },
  {
    id: 'mosdac_rainfall',
    portal: 'MOSDAC',
    dataset: 'INSAT-3D/3DR IMERG-Calibrated Daily Precipitation',
    theme: 'Hydro-Meteorology',
    resolution: '4km Gridded Surface',
    vintage: '2014-2024 (10-Year Climatology)',
    updateFrequency: 'Daily Observation Aggregated',
    accessMethod: 'SAC MOSDAC Open Meteorological Server',
    coverageStatus: 'Verified 100%',
    status: 'active',
    link: 'https://mosdac.gov.in',
    indicatorsFed: ['Mean Annual Rainfall (mm)', 'Rainfall Coefficient of Variation (CV)', 'Consecutive Dry-Month Drought Index'],
  },
  {
    id: 'vedas_vegetation',
    portal: 'VEDAS',
    dataset: 'Sentinel-2 MSI 16-Day NDVI Composite & Vegetation Health',
    theme: 'Environmental Sensitivity',
    resolution: '10m Multi-Spectral Grid',
    vintage: '2024 Active Monsoonal Cycle',
    updateFrequency: '16-Day Cloud-Filtered Composite',
    accessMethod: 'SAC VEDAS Geospatial Visualisation Server',
    coverageStatus: 'Verified 100%',
    status: 'active',
    link: 'https://vedas.sac.gov.in',
    indicatorsFed: ['Mean NDVI Biomass Index', '5-Year Vegetation Vigour Trend', 'Canopy Preservation Penalty'],
  },
  {
    id: 'osm_infra',
    portal: 'OpenStreetMap',
    dataset: 'Overpass Regional Infrastructure & Amenities Extract',
    theme: 'Infrastructure Connectivity',
    resolution: 'Vector Point / Polyline Topology',
    vintage: 'Q4 2024 Daily Cache',
    updateFrequency: 'Real-time Vector Sync',
    accessMethod: 'Overpass Turbo QL Extractor',
    coverageStatus: 'Verified 100%',
    status: 'active',
    link: 'https://openstreetmap.org',
    indicatorsFed: ['Expressway / Highway Distance (km)', 'High-Voltage Substation Proximity', 'Hospitals & Education Hub Buffer'],
  },
  {
    id: 'bis_seismic',
    portal: 'BIS / NDMA',
    dataset: 'IS 1893:2016 Seismic Zone Map & National Landslide Atlas',
    theme: 'Geophysical Hazards',
    resolution: 'District-Level Zonation / 1:50k Inventory',
    vintage: '2020 Statutory Baseline',
    updateFrequency: 'Periodic Statutory Revision',
    accessMethod: 'NDMA Disaster Management GIS Repository',
    coverageStatus: 'Verified 100%',
    status: 'active',
    link: 'https://ndma.gov.in',
    indicatorsFed: ['Seismic Zone Rating (Zone IV / III)', 'Landslide Susceptibility Distance'],
  },
];

export const LAYER_OVERLAYS: LayerOverlay[] = [
  {
    id: 'terrain',
    name: 'CartoDEM 30m Slope & Elevation',
    portal: 'Bhoonidhi NRSC',
    visible: true,
    opacity: 0.7,
    color: '#10b981',
    legend: [
      { label: '< 2% Slope (Ideal Flat)', color: '#10b981' },
      { label: '2% - 8% Slope (Moderate)', color: '#f59e0b' },
      { label: '> 15% Slope (Steep Constraint)', color: '#ef4444' },
    ],
  },
  {
    id: 'lulc',
    name: 'Bhuvan 1:50k Land Use Land Cover',
    portal: 'Bhuvan NRSC',
    visible: true,
    opacity: 0.65,
    color: '#3b82f6',
    legend: [
      { label: 'Wasteland / Scrub (High Priority)', color: '#a78bfa' },
      { label: 'Agricultural Cropland', color: '#fbbf24' },
      { label: 'Wetlands / Water Bodies (Protected)', color: '#06b6d4' },
      { label: 'Settlement / Built-up', color: '#94a3b8' },
    ],
  },
  {
    id: 'flood',
    name: 'Bhuvan Flood Inundation & HAND Proxy',
    portal: 'Bhuvan / Bhoonidhi',
    visible: true,
    opacity: 0.75,
    color: '#ef4444',
    legend: [
      { label: 'High Inundation (>1-in-10yr) [DEAL-BREAKER]', color: '#dc2626' },
      { label: 'Moderate Inundation (1-in-25yr)', color: '#f97316' },
      { label: 'CartoDEM HAND Proxy (<2.0m)', color: '#fb7185' },
    ],
  },
  {
    id: 'landslide',
    name: 'BIS Seismic & Landslide Hazard',
    portal: 'NDMA / BIS',
    visible: false,
    opacity: 0.6,
    color: '#f97316',
    legend: [
      { label: 'Zone IV (Severe Seismic Risk)', color: '#ea580c' },
      { label: 'Zone III (Moderate Seismic Risk)', color: '#facc15' },
    ],
  },
  {
    id: 'water',
    name: 'Bhuvan 15km Surface Water Bodies',
    portal: 'Bhuvan NRSC',
    visible: false,
    opacity: 0.7,
    color: '#0284c7',
    legend: [
      { label: 'Major Perennial Canal / River', color: '#0284c7' },
      { label: 'Minor Reservoir / Lake Buffer', color: '#38bdf8' },
    ],
  },
  {
    id: 'ndvi',
    name: 'VEDAS Sentinel-2 NDVI 10m',
    portal: 'VEDAS SAC',
    visible: false,
    opacity: 0.65,
    color: '#22c55e',
    legend: [
      { label: 'Dense Vegetation / Forest (NDVI > 0.55)', color: '#15803d' },
      { label: 'Moderate Canopy (0.35 - 0.55)', color: '#22c55e' },
      { label: 'Sparse / Barren (NDVI < 0.20)', color: '#ca8a04' },
    ],
  },
];

// Helper to compute site scorecards dynamically based on priority weights
export function generateSiteScorecard(
  regionId: RegionId,
  siteCode: 'A' | 'B' | 'C',
  preset: PriorityPreset,
  assumptions: Assumptions = DEFAULT_ASSUMPTIONS
): SiteScorecard {
  const isJewar = regionId === 'up_jewar';

  // Pillar weight profiles
  const weightProfiles = {
    balanced: { terrain: 0.20, water: 0.25, hazards: 0.30, environment: 0.10, infrastructure: 0.15 },
    climate_resilient: { terrain: 0.10, water: 0.30, hazards: 0.40, environment: 0.10, infrastructure: 0.10 },
    infra_first: { terrain: 0.25, water: 0.15, hazards: 0.20, environment: 0.10, infrastructure: 0.30 },
  };

  const weights = weightProfiles[preset];

  if (isJewar) {
    if (siteCode === 'A') {
      const terrainScore = 92.5;
      const waterScore = 86.0;
      const hazardsScore = 95.0;
      const envScore = 84.0;
      const infraScore = 94.0;

      const overall =
        terrainScore * weights.terrain +
        waterScore * weights.water +
        hazardsScore * weights.hazards +
        envScore * weights.environment +
        infraScore * weights.infrastructure;

      return {
        siteId: 'site_a',
        siteCode: 'A',
        siteName: 'Jewar Greenfield Hub (Sector 28-32)',
        regionId: 'up_jewar',
        overallScore: Math.round(overall * 10) / 10,
        rank: 1,
        verdict: 'Highly Suitable',
        verdictTier: 'A',
        verdictDescription: 'Prime urban development candidate. Outstanding terrain gradient, negligible flood hazard, high expressway proximity.',
        confidencePct: 96,
        confidenceLabel: 'High',
        hasDealBreaker: false,
        dealBreakers: [
          {
            id: 'db_flood',
            rule: 'High Flood Inundation Share > 50%',
            triggered: false,
            severity: 'HARD_STOP',
            threshold: '< 50.0%',
            actualValue: '1.2% (Negligible)',
            description: 'Bhuvan 10-year historical flood mask shows complete elevation above Yamuna maximum flood level (HFL).',
          },
          {
            id: 'db_wetland',
            rule: 'Wetland / Waterbody Overlap > 15%',
            triggered: false,
            severity: 'HARD_STOP',
            threshold: '< 15.0%',
            actualValue: '0.4%',
            description: 'Negligible overlap with Bhuvan Ramsar/State wetland inventory.',
          },
          {
            id: 'db_slope',
            rule: 'Steep Slope (>30%) Share > 30%',
            triggered: false,
            severity: 'HARD_STOP',
            threshold: '< 30.0%',
            actualValue: '0.0%',
            description: 'CartoDEM 30m indicates planar Indo-Gangetic alluvial terrace with 0.8% average slope.',
          },
        ],
        pillars: {
          terrain: {
            pillar: 'terrain',
            name: 'Terrain & Land',
            weight: weights.terrain * 100,
            rawScore: terrainScore,
            weightedScore: Math.round(terrainScore * weights.terrain * 10) / 10,
            rank: 1,
            strengths: ['98.4% buildable slope (<2%)', 'Minimal cut/fill earthwork requirements'],
            risks: ['Minor shallow natural depression on eastern boundary (0.5 km²)'],
          },
          water: {
            pillar: 'water',
            name: 'Water Security',
            weight: weights.water * 100,
            rawScore: waterScore,
            weightedScore: Math.round(waterScore * weights.water * 10) / 10,
            rank: 1,
            strengths: ['Upper Ganga canal distributary at 6.8 km', 'MOSDAC rainfall mean 785 mm/yr (stable CV 0.22)'],
            risks: ['Groundwater stage at 78% (critical monitoring required under CGWB norms)'],
          },
          hazards: {
            pillar: 'hazards',
            name: 'Hazard Safety',
            weight: weights.hazards * 100,
            rawScore: hazardsScore,
            weightedScore: Math.round(hazardsScore * weights.hazards * 10) / 10,
            rank: 1,
            strengths: ['Elevation 196m AMSL (12m above Yamuna 100-yr HFL)', 'Zero landslide susceptibility'],
            risks: ['BIS Seismic Zone IV (standard Indian code IS 1893 ductile design mandatory)'],
          },
          environment: {
            pillar: 'environment',
            name: 'Environmental Sensitivity',
            weight: weights.environment * 100,
            rawScore: envScore,
            weightedScore: Math.round(envScore * weights.environment * 10) / 10,
            rank: 2,
            strengths: ['68% barren/scrub/low-yield uncultivated land', 'VEDAS NDVI mean 0.24 (low canopy penalty)'],
            risks: ['Green buffer requirement along state highway corridor'],
          },
          infrastructure: {
            pillar: 'infrastructure',
            name: 'Infrastructure Access',
            weight: weights.infrastructure * 100,
            rawScore: infraScore,
            weightedScore: Math.round(infraScore * weights.infrastructure * 10) / 10,
            rank: 1,
            strengths: ['2.1 km to Yamuna Expressway Interchange', '400kV Jewar Substation within 3.4 km', 'Noida Int. Airport at 5.2 km'],
            risks: ['Secondary arterial road widening required on eastern feeder'],
          },
        },
        radarData: [
          { pillar: 'Terrain', score: terrainScore, fullMark: 100 },
          { pillar: 'Water', score: waterScore, fullMark: 100 },
          { pillar: 'Hazards', score: hazardsScore, fullMark: 100 },
          { pillar: 'Environment', score: envScore, fullMark: 100 },
          { pillar: 'Infrastructure', score: infraScore, fullMark: 100 },
        ],
        indicators: [
          {
            key: 'slope_buildable',
            name: 'Buildable Land Share (Slope <= 15%)',
            pillar: 'terrain',
            value: 98.4,
            displayValue: '98.4%',
            unit: '%',
            score: 98,
            weight: 50,
            source: {
              portal: 'Bhoonidhi',
              dataset: 'CartoDEM 30m v3.1',
              resolution: '30m',
              vintage: '2023-R2',
              method: 'UTM Slope gradient rasterio dynamic zonal',
            },
            confidence: 'High',
            benchmark: 'Target > 85.0%',
          },
          {
            key: 'tri_roughness',
            name: 'Terrain Roughness Index (TRI)',
            pillar: 'terrain',
            value: 1.15,
            displayValue: '1.15 m',
            unit: 'm',
            score: 92,
            weight: 30,
            source: {
              portal: 'Bhoonidhi',
              dataset: 'CartoDEM 30m v3.1',
              resolution: '30m',
              vintage: '2023-R2',
              method: 'Focal std-dev elevation neighborhood',
            },
            confidence: 'High',
            benchmark: '< 3.0 m (Smooth Plain)',
          },
          {
            key: 'rainfall_mean',
            name: 'Mean Annual Rainfall',
            pillar: 'water',
            value: 785.4,
            displayValue: '785 mm/yr',
            unit: 'mm',
            score: 84,
            weight: 40,
            source: {
              portal: 'MOSDAC',
              dataset: 'INSAT-3D IMERG 10-Yr Climatology',
              resolution: '4km grid',
              vintage: '2014-2024',
              method: 'Zonal polygon centroid integration',
            },
            confidence: 'High',
            benchmark: '700 - 1200 mm/yr Optimal',
          },
          {
            key: 'water_buffer_dist',
            name: 'Distance to Perennial Surface Water Source',
            pillar: 'water',
            value: 6.8,
            displayValue: '6.8 km',
            unit: 'km',
            score: 88,
            weight: 35,
            source: {
              portal: 'Bhuvan',
              dataset: 'National Water Bodies GIS 1:50k',
              resolution: '1:50k scale',
              vintage: '2023',
              method: 'Euclidean geometric distance buffer',
            },
            confidence: 'High',
            benchmark: '< 15.0 km Buffer',
          },
          {
            key: 'flood_inundation_share',
            name: 'Historical Flood Hazard Inundation Share',
            pillar: 'hazards',
            value: 1.2,
            displayValue: '1.2%',
            unit: '%',
            score: 98,
            weight: 60,
            source: {
              portal: 'Bhuvan',
              dataset: 'Bhuvan Thematic Flood Hazard Layer',
              resolution: '1:50k scale',
              vintage: '2022-2023',
              method: 'Polygon overlay spatial mask intersection',
            },
            confidence: 'High',
            benchmark: '< 10.0% Low Risk',
          },
          {
            key: 'seismic_zone',
            name: 'BIS Seismic Hazard Zone',
            pillar: 'hazards',
            value: 'Zone IV',
            displayValue: 'Zone IV (High)',
            unit: 'Zone',
            score: 75,
            weight: 40,
            source: {
              portal: 'BIS / NDMA',
              dataset: 'IS 1893:2016 Seismic Zonation',
              resolution: 'District Boundary',
              vintage: '2020 Statutory',
              method: 'Administrative district spatial lookup',
            },
            confidence: 'High',
            benchmark: 'Design Factor Z=0.24',
          },
          {
            key: 'ndvi_mean',
            name: 'Mean NDVI Biomass Index',
            pillar: 'environment',
            value: 0.24,
            displayValue: '0.24 (Sparse)',
            unit: 'Index',
            score: 86,
            weight: 50,
            source: {
              portal: 'VEDAS',
              dataset: 'Sentinel-2 MSI 16-Day NDVI Composite',
              resolution: '10m',
              vintage: '2024 Monsoonal',
              method: 'Zonal raster mean extraction',
            },
            confidence: 'High',
            benchmark: '< 0.35 Low Ecological Footprint',
          },
          {
            key: 'expressway_dist',
            name: 'Distance to Primary Expressway Interchange',
            pillar: 'infrastructure',
            value: 2.1,
            displayValue: '2.1 km',
            unit: 'km',
            score: 96,
            weight: 45,
            source: {
              portal: 'OpenStreetMap',
              dataset: 'Overpass Road Network Vector',
              resolution: 'Line Vector',
              vintage: '2024-Q4',
              method: 'Nearest network node distance',
            },
            confidence: 'High',
            benchmark: '< 5.0 km',
          },
          {
            key: 'substation_dist',
            name: 'Distance to Grid Power Substation (>=132kV)',
            pillar: 'infrastructure',
            value: 3.4,
            displayValue: '3.4 km',
            unit: 'km',
            score: 92,
            weight: 35,
            source: {
              portal: 'OpenStreetMap',
              dataset: 'Overpass Power Grid Infrastructure',
              resolution: 'Point Vector',
              vintage: '2024-Q4',
              method: 'Euclidean distance to substation',
            },
            confidence: 'High',
            benchmark: '< 10.0 km',
          },
        ],
      };
    }

    if (siteCode === 'B') {
      const terrainScore = 78.0;
      const waterScore = 88.0;
      const hazardsScore = 18.0; // DISQUALIFIED BY FLOOD DEAL BREAKER
      const envScore = 32.0; // Wetland overlap
      const infraScore = 65.0;

      const overall =
        terrainScore * weights.terrain +
        waterScore * weights.water +
        hazardsScore * weights.hazards +
        envScore * weights.environment +
        infraScore * weights.infrastructure;

      return {
        siteId: 'site_b',
        siteCode: 'B',
        siteName: 'Yamuna Floodplain Fringe (Tappal Lowlands)',
        regionId: 'up_jewar',
        overallScore: Math.round(overall * 10) / 10,
        rank: 3,
        verdict: 'Unviable (Hard Stop)',
        verdictTier: 'D',
        verdictDescription: 'CRITICAL HARD-STOP TRIGGERED: 53.4% of candidate site lies inside Bhuvan 1-in-25yr High Flood Inundation zone and Ramsar wetland buffer.',
        confidencePct: 94,
        confidenceLabel: 'High',
        hasDealBreaker: true,
        dealBreakerZones: JEWAR_DEAL_BREAKER_ZONES,
        dealBreakers: [
          {
            id: 'db_flood',
            rule: 'High Flood Inundation Share > 50%',
            triggered: true,
            severity: 'HARD_STOP',
            threshold: '< 50.0%',
            actualValue: '53.4% [VIOLATION]',
            description: 'Bhuvan thematic historical flood mask indicates recurrent monsoonal inundation exceeding Yamuna high flood baseline.',
            zoneGeoJson: JEWAR_DEAL_BREAKER_ZONES,
          },
          {
            id: 'db_wetland',
            rule: 'Wetland / Waterbody Overlap > 15%',
            triggered: true,
            severity: 'HARD_STOP',
            threshold: '< 15.0%',
            actualValue: '18.2% [VIOLATION]',
            description: 'Significant overlap with Bhuvan Riparian Wetland and active riverbed ecosystem.',
          },
        ],
        pillars: {
          terrain: {
            pillar: 'terrain',
            name: 'Terrain & Land',
            weight: weights.terrain * 100,
            rawScore: terrainScore,
            weightedScore: Math.round(terrainScore * weights.terrain * 10) / 10,
            rank: 3,
            strengths: ['Flat topography (0.5% slope)'],
            risks: ['High groundwater table causing liquefaction vulnerability', 'Heavy embankment fill required'],
          },
          water: {
            pillar: 'water',
            name: 'Water Security',
            weight: weights.water * 100,
            rawScore: waterScore,
            weightedScore: Math.round(waterScore * weights.water * 10) / 10,
            rank: 2,
            strengths: ['Direct Yamuna river frontage (0.4 km)'],
            risks: ['Intense seasonal watercourse shifting', 'Riparian buffer statutory restrictions'],
          },
          hazards: {
            pillar: 'hazards',
            name: 'Hazard Safety',
            weight: weights.hazards * 100,
            rawScore: hazardsScore,
            weightedScore: Math.round(hazardsScore * weights.hazards * 10) / 10,
            rank: 3,
            strengths: [],
            risks: ['53.4% high flood hazard', 'Liquefaction potential under IS 1893 seismic shaking'],
          },
          environment: {
            pillar: 'environment',
            name: 'Environmental Sensitivity',
            weight: weights.environment * 100,
            rawScore: envScore,
            weightedScore: Math.round(envScore * weights.environment * 10) / 10,
            rank: 3,
            strengths: [],
            risks: ['18.2% protected wetland and floodplain forest destruction', 'VEDAS high canopy index (0.58)'],
          },
          infrastructure: {
            pillar: 'infrastructure',
            name: 'Infrastructure Access',
            weight: weights.infrastructure * 100,
            rawScore: infraScore,
            weightedScore: Math.round(infraScore * weights.infrastructure * 10) / 10,
            rank: 3,
            strengths: ['Direct access to State Highway 22A'],
            risks: ['7.8 km to nearest major high-voltage substation', 'Road wash-out risk during monsoons'],
          },
        },
        radarData: [
          { pillar: 'Terrain', score: terrainScore, fullMark: 100 },
          { pillar: 'Water', score: waterScore, fullMark: 100 },
          { pillar: 'Hazards', score: hazardsScore, fullMark: 100 },
          { pillar: 'Environment', score: envScore, fullMark: 100 },
          { pillar: 'Infrastructure', score: infraScore, fullMark: 100 },
        ],
        indicators: [
          {
            key: 'flood_inundation_share',
            name: 'Historical Flood Hazard Inundation Share',
            pillar: 'hazards',
            value: 53.4,
            displayValue: '53.4% [HARD STOP]',
            unit: '%',
            score: 8,
            weight: 60,
            source: {
              portal: 'Bhuvan',
              dataset: 'Bhuvan Thematic Flood Hazard Layer',
              resolution: '1:50k scale',
              vintage: '2022-2023',
              method: 'Polygon overlay spatial mask intersection',
            },
            confidence: 'High',
            benchmark: 'Threshold < 50.0%',
          },
          {
            key: 'wetland_overlap',
            name: 'Wetland / Riparian Flora Overlap',
            pillar: 'environment',
            value: 18.2,
            displayValue: '18.2% [HARD STOP]',
            unit: '%',
            score: 15,
            weight: 50,
            source: {
              portal: 'Bhuvan',
              dataset: '1:50,000 Thematic LULC (55-Class)',
              resolution: '1:50k',
              vintage: '2022-2023',
              method: 'Wetland class raster clipping',
            },
            confidence: 'High',
            benchmark: 'Threshold < 15.0%',
          },
          {
            key: 'expressway_dist',
            name: 'Distance to Primary Expressway Interchange',
            pillar: 'infrastructure',
            value: 9.4,
            displayValue: '9.4 km',
            unit: 'km',
            score: 58,
            weight: 45,
            source: {
              portal: 'OpenStreetMap',
              dataset: 'Overpass Road Network Vector',
              resolution: 'Line Vector',
              vintage: '2024-Q4',
              method: 'Nearest network node distance',
            },
            confidence: 'High',
            benchmark: '< 5.0 km',
          },
        ],
      };
    }

    // Site C - Khurja Agricultural Fringe
    const terrainScore = 89.0;
    const waterScore = 81.0;
    const hazardsScore = 92.0;
    const envScore = 58.0; // High agricultural land displacement penalty
    const infraScore = 76.0;

    const overall =
      terrainScore * weights.terrain +
      waterScore * weights.water +
      hazardsScore * weights.hazards +
      envScore * weights.environment +
      infraScore * weights.infrastructure;

    return {
      siteId: 'site_c',
      siteCode: 'C',
      siteName: 'Khurja Agricultural Fringe (Eastern Spur)',
      regionId: 'up_jewar',
      overallScore: Math.round(overall * 10) / 10,
      rank: 2,
      verdict: 'Moderately Suitable',
      verdictTier: 'B',
      verdictDescription: 'Technically viable with zero flood exposure, but carries substantial agricultural land conversion costs and longer infrastructure lead lines.',
      confidencePct: 92,
      confidenceLabel: 'High',
      hasDealBreaker: false,
      dealBreakers: [
        {
          id: 'db_flood',
          rule: 'High Flood Inundation Share > 50%',
          triggered: false,
          severity: 'HARD_STOP',
          threshold: '< 50.0%',
          actualValue: '0.0%',
          description: 'Completely outside active and historical floodplains.',
        },
      ],
      pillars: {
        terrain: {
          pillar: 'terrain',
          name: 'Terrain & Land',
          weight: weights.terrain * 100,
          rawScore: terrainScore,
          weightedScore: Math.round(terrainScore * weights.terrain * 10) / 10,
          rank: 2,
          strengths: ['Uniform slope gradient (1.2%)'],
          risks: ['Deep alluvial soil require solid foundation compaction'],
        },
        water: {
          pillar: 'water',
          name: 'Water Security',
          weight: weights.water * 100,
          rawScore: waterScore,
          weightedScore: Math.round(waterScore * weights.water * 10) / 10,
          rank: 3,
          strengths: ['Stable monsoonal recharge pattern'],
          risks: ['Irrigation tubewell drawdown in agricultural vicinity'],
        },
        hazards: {
          pillar: 'hazards',
          name: 'Hazard Safety',
          weight: weights.hazards * 100,
          rawScore: hazardsScore,
          weightedScore: Math.round(hazardsScore * weights.hazards * 10) / 10,
          rank: 2,
          strengths: ['100% immune from Yamuna flood risk'],
          risks: ['Seismic Zone IV'],
        },
        environment: {
          pillar: 'environment',
          name: 'Environmental Sensitivity',
          weight: weights.environment * 100,
          rawScore: envScore,
          weightedScore: Math.round(envScore * weights.environment * 10) / 10,
          rank: 3,
          strengths: ['No forest clearance required'],
          risks: ['74% double-cropped fertile land displacement', 'High compensation & social impact mitigation'],
        },
        infrastructure: {
          pillar: 'infrastructure',
          name: 'Infrastructure Access',
          weight: weights.infrastructure * 100,
          rawScore: infraScore,
          weightedScore: Math.round(infraScore * weights.infrastructure * 10) / 10,
          rank: 2,
          strengths: ['Eastern Dedicated Freight Corridor (EDFC) rail siding at 4.2 km'],
          risks: ['8.1 km to Yamuna Expressway', '6.5 km to 220kV substation'],
        },
      },
      radarData: [
        { pillar: 'Terrain', score: terrainScore, fullMark: 100 },
        { pillar: 'Water', score: waterScore, fullMark: 100 },
        { pillar: 'Hazards', score: hazardsScore, fullMark: 100 },
        { pillar: 'Environment', score: envScore, fullMark: 100 },
        { pillar: 'Infrastructure', score: infraScore, fullMark: 100 },
      ],
      indicators: [
        {
          key: 'cropland_conversion_share',
          name: 'Prime Double-Cropped Agricultural Land Share',
          pillar: 'environment',
          value: 74.2,
          displayValue: '74.2%',
          unit: '%',
          score: 42,
          weight: 45,
          source: {
            portal: 'Bhuvan',
            dataset: '1:50,000 Thematic LULC (55-Class)',
            resolution: '1:50k',
            vintage: '2022-2023',
            method: 'Bhuvan agricultural class cross-tabulation',
          },
          confidence: 'High',
          benchmark: '< 30.0% Preferred',
        },
        {
          key: 'expressway_dist',
          name: 'Distance to Primary Expressway Interchange',
          pillar: 'infrastructure',
          value: 8.1,
          displayValue: '8.1 km',
          unit: 'km',
          score: 68,
          weight: 45,
          source: {
            portal: 'OpenStreetMap',
            dataset: 'Overpass Road Network Vector',
            resolution: 'Line Vector',
            vintage: '2024-Q4',
            method: 'Nearest network node distance',
          },
          confidence: 'High',
          benchmark: '< 5.0 km',
        },
      ],
    };
  } else {
    // Dholera Region
    if (siteCode === 'A') {
      const terrainScore = 91.0;
      const waterScore = 79.0;
      const hazardsScore = 88.0;
      const envScore = 89.0;
      const infraScore = 90.0;

      const overall =
        terrainScore * weights.terrain +
        waterScore * weights.water +
        hazardsScore * weights.hazards +
        envScore * weights.environment +
        infraScore * weights.infrastructure;

      return {
        siteId: 'site_a',
        siteCode: 'A',
        siteName: 'Dholera Industrial Core (TP1/TP2)',
        regionId: 'dholera',
        overallScore: Math.round(overall * 10) / 10,
        rank: 1,
        verdict: 'Highly Suitable',
        verdictTier: 'A',
        verdictDescription: 'Pre-planned smart industrial core. Solid elevation above tidal flood datum, planned drainage spines, expressway connectivity.',
        confidencePct: 91,
        confidenceLabel: 'High',
        hasDealBreaker: false,
        dealBreakers: [
          {
            id: 'db_hand_flood',
            rule: 'CartoDEM HAND Tidal Flood Proxy > 45%',
            triggered: false,
            severity: 'HARD_STOP',
            threshold: '< 45.0%',
            actualValue: '3.1% (Safe elevation)',
            description: 'Height Above Nearest Drainage exceeds 3.5m throughout designated industrial sectors.',
          },
        ],
        pillars: {
          terrain: {
            pillar: 'terrain',
            name: 'Terrain & Land',
            weight: weights.terrain * 100,
            rawScore: terrainScore,
            weightedScore: Math.round(terrainScore * weights.terrain * 10) / 10,
            rank: 1,
            strengths: ['Engineered Town Planning grading', '97% buildable area'],
            risks: ['Expansive black cotton clay soil requires lime stabilization'],
          },
          water: {
            pillar: 'water',
            name: 'Water Security',
            weight: weights.water * 100,
            rawScore: waterScore,
            weightedScore: Math.round(waterScore * weights.water * 10) / 10,
            rank: 1,
            strengths: ['Narmada Canal branch terminal at 4.5 km', 'Planned 100 MLD desalination plant pipeline corridor'],
            risks: ['Arid climate rainfall (MOSDAC 620 mm/yr) with high CV (0.34)'],
          },
          hazards: {
            pillar: 'hazards',
            name: 'Hazard Safety',
            weight: weights.hazards * 100,
            rawScore: hazardsScore,
            weightedScore: Math.round(hazardsScore * weights.hazards * 10) / 10,
            rank: 1,
            strengths: ['Protected by regional bund engineering', 'Seismic Zone III'],
            risks: ['Cyclonic storm surge buffer maintenance required'],
          },
          environment: {
            pillar: 'environment',
            name: 'Environmental Sensitivity',
            weight: weights.environment * 100,
            rawScore: envScore,
            weightedScore: Math.round(envScore * weights.environment * 10) / 10,
            rank: 1,
            strengths: ['92% non-agricultural wasteland / scrub', 'VEDAS NDVI mean 0.16 (barren profile)'],
            risks: ['Salinity ingress prevention'],
          },
          infrastructure: {
            pillar: 'infrastructure',
            name: 'Infrastructure Access',
            weight: weights.infrastructure * 100,
            rawScore: infraScore,
            weightedScore: Math.round(infraScore * weights.infrastructure * 10) / 10,
            rank: 1,
            strengths: ['Direct access to Ahmedabad-Dholera Expressway', '220kV Dholera Substation active'],
            risks: ['Freight rail corridor under construction'],
          },
        },
        radarData: [
          { pillar: 'Terrain', score: terrainScore, fullMark: 100 },
          { pillar: 'Water', score: waterScore, fullMark: 100 },
          { pillar: 'Hazards', score: hazardsScore, fullMark: 100 },
          { pillar: 'Environment', score: envScore, fullMark: 100 },
          { pillar: 'Infrastructure', score: infraScore, fullMark: 100 },
        ],
        indicators: [
          {
            key: 'hand_proxy_score',
            name: 'CartoDEM HAND Tidal Flood Proxy (<2.0m)',
            pillar: 'hazards',
            value: 3.1,
            displayValue: '3.1% (Safe)',
            unit: '%',
            score: 94,
            weight: 55,
            source: {
              portal: 'Bhoonidhi',
              dataset: 'CartoDEM 30m v3.1 HAND Derived Proxy',
              resolution: '30m',
              vintage: '2023-R2',
              method: 'pysheds stream network & drainage relative height',
            },
            confidence: 'Medium',
            benchmark: 'Threshold < 45.0%',
          },
        ],
      };
    }

    if (siteCode === 'B') {
      const terrainScore = 65.0;
      const waterScore = 68.0;
      const hazardsScore = 24.0; // DISQUALIFIED BY HAND COASTAL FLOOD PROXY
      const envScore = 40.0;
      const infraScore = 62.0;

      const overall =
        terrainScore * weights.terrain +
        waterScore * weights.water +
        hazardsScore * weights.hazards +
        envScore * weights.environment +
        infraScore * weights.infrastructure;

      return {
        siteId: 'site_b',
        siteCode: 'B',
        siteName: 'Gulf Tidal Marsh Fringe (Southern Buffer)',
        regionId: 'dholera',
        overallScore: Math.round(overall * 10) / 10,
        rank: 3,
        verdict: 'Unviable (Hard Stop)',
        verdictTier: 'D',
        verdictDescription: 'CRITICAL HARD-STOP TRIGGERED: 48.7% of site falls below 2.0m HAND coastal surge datum in proximity to Gulf of Khambhat mudflats.',
        confidencePct: 88,
        confidenceLabel: 'Medium',
        hasDealBreaker: true,
        dealBreakerZones: DHOLERA_DEAL_BREAKER_ZONES,
        dealBreakers: [
          {
            id: 'db_hand_flood',
            rule: 'CartoDEM HAND Tidal Flood Proxy > 45%',
            triggered: true,
            severity: 'HARD_STOP',
            threshold: '< 45.0%',
            actualValue: '48.7% [VIOLATION]',
            description: 'Height Above Nearest Drainage indicates severe tidal surge vulnerability during cyclonic depressions.',
            zoneGeoJson: DHOLERA_DEAL_BREAKER_ZONES,
          },
        ],
        pillars: {
          terrain: {
            pillar: 'terrain',
            name: 'Terrain & Land',
            weight: weights.terrain * 100,
            rawScore: terrainScore,
            weightedScore: Math.round(terrainScore * weights.terrain * 10) / 10,
            rank: 3,
            strengths: ['Flat terrain'],
            risks: ['Saline tidal flats with uncompactable silt'],
          },
          water: {
            pillar: 'water',
            name: 'Water Security',
            weight: weights.water * 100,
            rawScore: waterScore,
            weightedScore: Math.round(waterScore * weights.water * 10) / 10,
            rank: 3,
            strengths: [],
            risks: ['Saline groundwater; zero potable local aquifer recharge'],
          },
          hazards: {
            pillar: 'hazards',
            name: 'Hazard Safety',
            weight: weights.hazards * 100,
            rawScore: hazardsScore,
            weightedScore: Math.round(hazardsScore * weights.hazards * 10) / 10,
            rank: 3,
            strengths: [],
            risks: ['48.7% low-elevation tidal inundation risk'],
          },
          environment: {
            pillar: 'environment',
            name: 'Environmental Sensitivity',
            weight: weights.environment * 100,
            rawScore: envScore,
            weightedScore: Math.round(envScore * weights.environment * 10) / 10,
            rank: 3,
            strengths: [],
            risks: ['Coastal Regulation Zone (CRZ-I) intertidal mangrove buffer overlap'],
          },
          infrastructure: {
            pillar: 'infrastructure',
            name: 'Infrastructure Access',
            weight: weights.infrastructure * 100,
            rawScore: infraScore,
            weightedScore: Math.round(infraScore * weights.infrastructure * 10) / 10,
            rank: 3,
            strengths: [],
            risks: ['11.2 km from primary expressway arterial'],
          },
        },
        radarData: [
          { pillar: 'Terrain', score: terrainScore, fullMark: 100 },
          { pillar: 'Water', score: waterScore, fullMark: 100 },
          { pillar: 'Hazards', score: hazardsScore, fullMark: 100 },
          { pillar: 'Environment', score: envScore, fullMark: 100 },
          { pillar: 'Infrastructure', score: infraScore, fullMark: 100 },
        ],
        indicators: [
          {
            key: 'hand_proxy_score',
            name: 'CartoDEM HAND Tidal Flood Proxy (<2.0m)',
            pillar: 'hazards',
            value: 48.7,
            displayValue: '48.7% [HARD STOP]',
            unit: '%',
            score: 12,
            weight: 55,
            source: {
              portal: 'Bhoonidhi',
              dataset: 'CartoDEM 30m v3.1 HAND Derived Proxy',
              resolution: '30m',
              vintage: '2023-R2',
              method: 'pysheds stream network & drainage relative height',
            },
            confidence: 'Medium',
            benchmark: 'Threshold < 45.0%',
          },
        ],
      };
    }

    // Site C - Bhogavo Riparian Infill
    const terrainScore = 87.0;
    const waterScore = 75.0;
    const hazardsScore = 84.0;
    const envScore = 82.0;
    const infraScore = 78.0;

    const overall =
      terrainScore * weights.terrain +
      waterScore * weights.water +
      hazardsScore * weights.hazards +
      envScore * weights.environment +
      infraScore * weights.infrastructure;

    return {
      siteId: 'site_c',
      siteCode: 'C',
      siteName: 'Bhogavo Riparian Infill (North-West)',
      regionId: 'dholera',
      overallScore: Math.round(overall * 10) / 10,
      rank: 2,
      verdict: 'Moderately Suitable',
      verdictTier: 'B',
      verdictDescription: 'Viable secondary corridor with moderate water conveyance, but requires higher road connection investment.',
      confidencePct: 89,
      confidenceLabel: 'Medium',
      hasDealBreaker: false,
      dealBreakers: [
        {
          id: 'db_hand_flood',
          rule: 'CartoDEM HAND Tidal Flood Proxy > 45%',
          triggered: false,
          severity: 'HARD_STOP',
          threshold: '< 45.0%',
          actualValue: '8.4%',
          description: 'Sufficiently elevated above Bhogavo monsoon spates.',
        },
      ],
      pillars: {
        terrain: {
          pillar: 'terrain',
          name: 'Terrain & Land',
          weight: weights.terrain * 100,
          rawScore: terrainScore,
          weightedScore: Math.round(terrainScore * weights.terrain * 10) / 10,
          rank: 2,
          strengths: ['Stable upper terrace'],
          risks: ['Local drainage gullying'],
        },
        water: {
          pillar: 'water',
          name: 'Water Security',
          weight: weights.water * 100,
          rawScore: waterScore,
          weightedScore: Math.round(waterScore * weights.water * 10) / 10,
          rank: 2,
          strengths: ['Bhogavo river seasonal catchment'],
          risks: ['High inter-annual variability'],
        },
        hazards: {
          pillar: 'hazards',
          name: 'Hazard Safety',
          weight: weights.hazards * 100,
          rawScore: hazardsScore,
          weightedScore: Math.round(hazardsScore * weights.hazards * 10) / 10,
          rank: 2,
          strengths: ['Outside tidal surge reach'],
          risks: ['Monsoon riparian scour'],
        },
        environment: {
          pillar: 'environment',
          name: 'Environmental Sensitivity',
          weight: weights.environment * 100,
          rawScore: envScore,
          weightedScore: Math.round(envScore * weights.environment * 10) / 10,
          rank: 2,
          strengths: ['Low ecological density'],
          risks: ['Riparian buffer setbacks'],
        },
        infrastructure: {
          pillar: 'infrastructure',
          name: 'Infrastructure Access',
          weight: weights.infrastructure * 100,
          rawScore: infraScore,
          weightedScore: Math.round(infraScore * weights.infrastructure * 10) / 10,
          rank: 2,
          strengths: ['Proximity to Dholera-Bhavnagar State Highway'],
          risks: ['8.8 km to Dholera Central spine'],
        },
      },
      radarData: [
        { pillar: 'Terrain', score: terrainScore, fullMark: 100 },
        { pillar: 'Water', score: waterScore, fullMark: 100 },
        { pillar: 'Hazards', score: hazardsScore, fullMark: 100 },
        { pillar: 'Environment', score: envScore, fullMark: 100 },
        { pillar: 'Infrastructure', score: infraScore, fullMark: 100 },
      ],
      indicators: [
        {
          key: 'hand_proxy_score',
          name: 'CartoDEM HAND Tidal Flood Proxy (<2.0m)',
          pillar: 'hazards',
          value: 8.4,
          displayValue: '8.4%',
          unit: '%',
          score: 86,
          weight: 55,
          source: {
            portal: 'Bhoonidhi',
            dataset: 'CartoDEM 30m v3.1 HAND Derived Proxy',
            resolution: '30m',
            vintage: '2023-R2',
            method: 'pysheds stream network & drainage relative height',
          },
          confidence: 'Medium',
          benchmark: 'Threshold < 45.0%',
        },
      ],
    };
  }
}

// Generate comparison result with deterministic tie-check note and gap drivers
export function generateCompareResult(
  regionId: RegionId,
  preset: PriorityPreset,
  scenario: ScenarioPreset,
  assumptions: Assumptions = DEFAULT_ASSUMPTIONS
): CompareResult {
  const siteA = generateSiteScorecard(regionId, 'A', preset, assumptions);
  const siteB = generateSiteScorecard(regionId, 'B', preset, assumptions);
  const siteC = generateSiteScorecard(regionId, 'C', preset, assumptions);

  const sites = [siteA, siteC, siteB]; // Sorted by viability / rank
  const topSite = siteA;
  const runnerUp = siteC;
  const scoreDelta = Math.round((topSite.overallScore - runnerUp.overallScore) * 10) / 10;
  const isTie = scoreDelta < 5.0;

  const top3Drivers = [
    {
      title: 'Flood Hazard Inundation Resilience',
      description: `${topSite.siteName} maintains 95+ safety index vs ${siteB.siteName} which triggered catastrophic deal-breaker (53.4% flood zone).`,
      impact: 'positive' as const,
      delta: '+77.0 pts Hazard Margin',
    },
    {
      title: 'Direct Arterial Expressway Accessibility',
      description: `${topSite.siteName} is located within 2.1 km of the main interchange compared to 8.1 km for ${siteC.siteName}, significantly reducing arterial connector capital expenditure.`,
      impact: 'positive' as const,
      delta: '+18.0 pts Infrastructure Margin',
    },
    {
      title: 'Agricultural Land Preservation Footprint',
      description: `${topSite.siteName} occupies scrub/barren land (68%), whereas ${siteC.siteName} displaces 74.2% double-cropped prime agricultural soil.`,
      impact: 'positive' as const,
      delta: '+26.0 pts Environment Margin',
    },
  ];

  const tieCheckNote = isTie
    ? `TIE-CHECK SENSITIVITY NOTE: Top two sites (${topSite.siteName} at ${topSite.overallScore} and ${runnerUp.siteName} at ${runnerUp.overallScore}) are separated by only ${scoreDelta} points (<5.0 pt threshold). A shift toward Infra-First weights favors Site A, while strict environmental land preservation widens the margin.`
    : undefined;

  const executiveSummary = `Multi-Criteria Analysis of ${sites.length} candidate sites in ${regionId === 'up_jewar' ? 'UP Jewar Corridor' : 'Dholera SIR'} firmly establishes ${topSite.siteName} as the primary recommended site (Score: ${topSite.overallScore}/100, Tier ${topSite.verdictTier}). Site B is disqualified due to exceeding hard-stop deal-breaker thresholds. Site C serves as a secondary fallback with agricultural displacement offsets.`;

  return {
    regionId,
    scenario,
    preset,
    sites,
    topSite,
    runnerUp,
    scoreDelta,
    isTie,
    tieCheckNote,
    top3Drivers,
    executiveSummary,
  };
}

// Generate water balance physical stress test projection 2026-2050
export function generateStressTest(
  siteId: string,
  regionId: RegionId,
  horizon: 2035 | 2050,
  population: number,
  scenario: ScenarioPreset,
  assumptions: Assumptions = DEFAULT_ASSUMPTIONS
): StressTestResponse {
  const isJewar = regionId === 'up_jewar';
  const siteName = siteId === 'site_a' ? (isJewar ? 'Jewar Greenfield Hub' : 'Dholera Industrial Core') : 'Candidate Site';

  // Base parameters
  const pop0 = assumptions.pop0; // 150,000 in 2026
  const targetPop = population; // e.g. 450,000 in 2050
  const lpcd = assumptions.lpcd; // 135 L/capita/day

  // Growth rate calculation between 2026 and horizon
  const yearsSpan = horizon - 2026;
  const cagr = Math.pow(targetPop / pop0, 1 / (yearsSpan || 1)) - 1;

  // Catchment & Rainfall base supply calculation
  // Area approx 24 km² * 3.0 catchment multiplier = 72 km²
  const siteAreaKm2 = 24.5;
  const effectiveCatchmentKm2 = siteAreaKm2 * assumptions.catchmentMultiplier;
  const annualRainfallMm = isJewar ? 785 : 620; // MOSDAC 10-yr mean
  const runoffCoeff = assumptions.yieldGood; // 0.20

  // Total annual local harvestable yield in Million Cubic Meters (MCM)
  // MCM = Area (km²) * Rainfall (mm) / 1000 * runoffCoeff
  const annualYieldMCM = effectiveCatchmentKm2 * (annualRainfallMm / 1000) * runoffCoeff;
  const localDailyYieldMLD = (annualYieldMCM * 1000) / 365; // Convert MCM to MLD (1 MCM = 1,000 ML)
  const baseExternalSupplyMLD = assumptions.externalSupplyMLD; // 15 MLD canal piped supply

  const timeseries: WaterStressYear[] = [];

  for (let year = 2026; year <= 2050; year++) {
    const elapsed = year - 2026;
    const yearPop = Math.round(pop0 * Math.pow(1 + cagr, elapsed));

    // Daily demand MLD = (Population * lpcd) / 1,000,000
    // e.g. 150,000 * 135 / 1e6 = 20.25 MLD in 2026
    // 500,000 * 135 / 1e6 = 67.5 MLD
    let yearDemandMLD = (yearPop * lpcd) / 1000000;

    // Scenario modifiers
    let supplyMultiplier = 1.0;
    let droughtFactor = 0.72; // -28% rainfall during consecutive dry monsoons
    let wetFactor = 1.25;

    if (scenario === 'high_growth_climate_stressed') {
      yearDemandMLD *= 1.12; // High urban commercial & losses
      supplyMultiplier = 0.88;
      droughtFactor = 0.65; // Severe drought spell
    } else if (scenario === 'green_transition') {
      yearDemandMLD *= 0.82; // 18% conservation & treated wastewater circular reuse
      supplyMultiplier = 1.08;
    }

    const baseSupply = (localDailyYieldMLD * supplyMultiplier) + baseExternalSupplyMLD;
    const lowSupply = (localDailyYieldMLD * supplyMultiplier * droughtFactor) + (baseExternalSupplyMLD * 0.85);
    const highSupply = (localDailyYieldMLD * supplyMultiplier * wetFactor) + baseExternalSupplyMLD;

    const stressIndex = Math.round((yearDemandMLD / baseSupply) * 100) / 100;

    timeseries.push({
      year,
      population: yearPop,
      demandMLD: Math.round(yearDemandMLD * 10) / 10,
      baseSupplyMLD: Math.round(baseSupply * 10) / 10,
      lowSupplyMLD: Math.round(lowSupply * 10) / 10,
      highSupplyMLD: Math.round(highSupply * 10) / 10,
      stressIndex,
    });
  }

  const currentYearData = timeseries[0];
  const horizonYearData = timeseries.find((t) => t.year === horizon) || timeseries[timeseries.length - 1];

  const stressIndex = horizonYearData.stressIndex;
  let stressCategory: 'Sustainable' | 'Stressed' | 'Critical Deficit' = 'Sustainable';
  if (stressIndex >= 1.0) {
    stressCategory = 'Critical Deficit';
  } else if (stressIndex >= 0.80) {
    stressCategory = 'Stressed';
  }

  return {
    siteId,
    siteName,
    horizon,
    targetPopulation: horizonYearData.population,
    scenario,
    currentDemandMLD: currentYearData.demandMLD,
    horizonDemandMLD: horizonYearData.demandMLD,
    horizonBaseSupplyMLD: horizonYearData.baseSupplyMLD,
    stressIndex,
    stressCategory,
    floodStressBadge: {
      category: isJewar ? 'Low' : 'Moderate',
      label: isJewar ? '1-in-50-Year Flood Risk: Minimal (Elevation >196m AMSL)' : '1-in-50-Year Tidal Flood: Controlled by Bund Spine',
      drainageCapacity: 'Adequate (>45 mm/hr Storm Runoff Infiltration)',
      residualRisk: 'Low Residual Hazard outside 500m arterial drainage channels',
    },
    uncertaintyRangeMLD: [horizonYearData.lowSupplyMLD, horizonYearData.highSupplyMLD],
    timeseries,
    recommendation:
      stressIndex >= 1.0
        ? `Water stress index crosses 1.0 by year ${horizon}. Commissioning an additional 25 MLD tertiary recycling plant and Upper Ganga canal feeder capacity upgrade is mandatory before population surpasses 350,000.`
        : `Water demand remains within sustainable catchment & piped allocation limits through ${horizon} (Stress Index: ${stressIndex}). Recommended to mandate rooftop rainwater harvesting for all industrial/residential plots > 500 sq.m.`,
  };
}
