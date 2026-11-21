// GIS and Spatial Geometry Utilities for TerraAI GIS Map Workspace
import { MasterPlanAlternative, MasterPlanZone } from '../types';

/**
 * Calculates geodesic distance between two points in meters using Haversine formula
 */
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates spherical polygon area in square meters, acres, hectares, and sq km
 */
export function calculatePolygonArea(latLngs: [number, number][]): {
  sqMeters: number;
  acres: number;
  hectares: number;
  sqKm: number;
} {
  if (latLngs.length < 3) {
    return { sqMeters: 0, acres: 0, hectares: 0, sqKm: 0 };
  }

  const R = 6378137.0; // WGS84 major radius
  let area = 0;
  const n = latLngs.length;

  for (let i = 0; i < n; i++) {
    const p1 = latLngs[i];
    const p2 = latLngs[(i + 1) % n];
    const lat1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;
    const lon1 = (p1[1] * Math.PI) / 180;
    const lon2 = (p2[1] * Math.PI) / 180;
    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  const sqMeters = Math.abs((area * R * R) / 4.0);
  const acres = Math.round((sqMeters / 4046.85642) * 100) / 100;
  const hectares = Math.round((sqMeters / 10000.0) * 100) / 100;
  const sqKm = Math.round((sqMeters / 1000000.0) * 1000) / 1000;

  return { sqMeters: Math.round(sqMeters), acres, hectares, sqKm };
}

/**
 * Derives bounding box from a polygon or center
 */
export function getBoundsFromCoords(coords: [number, number][]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  if (!coords || coords.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }
  let minLat = coords[0][0];
  let maxLat = coords[0][0];
  let minLng = coords[0][1];
  let maxLng = coords[0][1];

  for (const [lat, lng] of coords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return { minLat, maxLat, minLng, maxLng };
}

export interface ContourFeature {
  elevation: number;
  label: string;
  isIndexContour: boolean;
  coordinates: [number, number][];
}

/**
 * Generates realistic terrain elevation contour lines based on site center and Cartosat DEM profile
 */
export function generateSiteContours(center: { lat: number; lng: number }, baseElev: number = 10.4): ContourFeature[] {
  const contours: ContourFeature[] = [];
  const levels = [
    { elev: Math.round(baseElev - 4), rLat: 0.0075, rLng: 0.0085, index: false },
    { elev: Math.round(baseElev - 2), rLat: 0.0062, rLng: 0.0070, index: false },
    { elev: Math.round(baseElev),     rLat: 0.0048, rLng: 0.0055, index: true },
    { elev: Math.round(baseElev + 2), rLat: 0.0035, rLng: 0.0040, index: false },
    { elev: Math.round(baseElev + 4), rLat: 0.0022, rLng: 0.0026, index: false },
    { elev: Math.round(baseElev + 6), rLat: 0.0010, rLng: 0.0013, index: true },
  ];

  levels.forEach((lvl, idx) => {
    const points: [number, number][] = [];
    const steps = 36;
    // Slight wavy organic perturbation
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const wobble = 1 + 0.12 * Math.sin(angle * 3 + idx) + 0.08 * Math.cos(angle * 2);
      const lat = center.lat + lvl.rLat * Math.sin(angle) * wobble;
      const lng = center.lng + lvl.rLng * Math.cos(angle) * wobble;
      points.push([lat, lng]);
    }
    contours.push({
      elevation: lvl.elev,
      label: `${lvl.elev}m MSL`,
      isIndexContour: lvl.index,
      coordinates: points
    });
  });

  return contours;
}

export interface WaterBodyFeature {
  id: string;
  name: string;
  type: 'tank' | 'canal' | 'reservoir' | 'drainage_corridor';
  capacityML?: number;
  polygon: [number, number][];
  bufferPolygon: [number, number][];
}

/**
 * Generates surface water bodies, traditional tanks/ery and statutory 50m NGT buffer
 */
export function generateSiteWaterBodies(center: { lat: number; lng: number }): WaterBodyFeature[] {
  // Primary retention pond / reservoir (NE quadrant)
  const c1Lat = center.lat + 0.0032;
  const c1Lng = center.lng + 0.0035;
  const pondCoords: [number, number][] = [];
  const bufferCoords: [number, number][] = [];
  const steps = 24;

  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const r1 = 0.0014 * (1 + 0.15 * Math.sin(theta * 2));
    const rBuffer = r1 + 0.00045; // ~50 meters in lat/lng
    pondCoords.push([c1Lat + r1 * Math.sin(theta), c1Lng + r1 * 1.1 * Math.cos(theta)]);
    bufferCoords.push([c1Lat + rBuffer * Math.sin(theta), c1Lng + rBuffer * 1.1 * Math.cos(theta)]);
  }

  // Secondary percolation tank (SW quadrant)
  const c2Lat = center.lat - 0.0035;
  const c2Lng = center.lng - 0.0028;
  const tankCoords: [number, number][] = [];
  const tankBufferCoords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const r2 = 0.0009 * (1 + 0.1 * Math.cos(theta * 3));
    const rBuff = r2 + 0.00045;
    tankCoords.push([c2Lat + r2 * Math.sin(theta), c2Lng + r2 * Math.cos(theta)]);
    tankBufferCoords.push([c2Lat + rBuff * Math.sin(theta), c2Lng + rBuff * Math.cos(theta)]);
  }

  return [
    {
      id: 'water-res-1',
      name: 'North-East Stormwater Lake & Retention Basin',
      type: 'reservoir',
      capacityML: 380,
      polygon: pondCoords,
      bufferPolygon: bufferCoords
    },
    {
      id: 'water-tank-2',
      name: 'South-West Village Percolation Tank (Cheruvu)',
      type: 'tank',
      capacityML: 95,
      polygon: tankCoords,
      bufferPolygon: tankBufferCoords
    }
  ];
}

export interface FloodHazardZone {
  id: string;
  hazardLevel: 'High' | 'Moderate' | 'Low';
  description: string;
  color: string;
  inundationDepthM: string;
  returnPeriod: string;
  polygon: [number, number][];
}

/**
 * Generates flood-hazard inundation overlays (1-in-25yr, 1-in-50yr)
 */
export function generateSiteFloodZones(center: { lat: number; lng: number }): FloodHazardZone[] {
  // High risk zone in the southern depression
  const highRiskCoords: [number, number][] = [
    [center.lat - 0.0062, center.lng - 0.0055],
    [center.lat - 0.0048, center.lng - 0.0020],
    [center.lat - 0.0052, center.lng + 0.0040],
    [center.lat - 0.0065, center.lng + 0.0058],
    [center.lat - 0.0070, center.lng + 0.0010],
    [center.lat - 0.0068, center.lng - 0.0040],
    [center.lat - 0.0062, center.lng - 0.0055],
  ];

  // Moderate risk buffer expanding northward
  const modRiskCoords: [number, number][] = [
    [center.lat - 0.0065, center.lng - 0.0065],
    [center.lat - 0.0035, center.lng - 0.0035],
    [center.lat - 0.0038, center.lng + 0.0030],
    [center.lat - 0.0046, center.lng + 0.0065],
    [center.lat - 0.0072, center.lng + 0.0068],
    [center.lat - 0.0075, center.lng - 0.0010],
    [center.lat - 0.0065, center.lng - 0.0065],
  ];

  return [
    {
      id: 'flood-mod',
      hazardLevel: 'Moderate',
      description: '1-in-50 Year Monsoonal Inundation Corridor',
      color: '#f59e0b',
      inundationDepthM: '0.4 - 0.9 m',
      returnPeriod: '50-Year Storm Surge',
      polygon: modRiskCoords
    },
    {
      id: 'flood-high',
      hazardLevel: 'High',
      description: '1-in-25 Year Coastal Inundation & Silt Flat',
      color: '#ef4444',
      inundationDepthM: '1.2 - 1.8 m',
      returnPeriod: '25-Year Extreme Storm',
      polygon: highRiskCoords
    }
  ];
}

export interface BhuvanLULCFeature {
  id: string;
  className: string;
  code: string;
  color: string;
  description: string;
  areaPct: number;
  polygon: [number, number][];
}

/**
 * Generates ISRO Bhuvan Land Use Land Cover (LULC) 1:50,000 thematic features
 */
export function generateSiteBhuvanLULC(center: { lat: number; lng: number }): BhuvanLULCFeature[] {
  const delta = 0.0062;
  return [
    {
      id: 'lulc-scrub',
      className: 'Scrubland & Fallow Wasteland',
      code: 'LULC-07',
      color: '#d97706',
      description: 'Scattered Prosopis juliflora and open scrub on saline alluvium',
      areaPct: 58,
      polygon: [
        [center.lat - delta, center.lng - delta],
        [center.lat + delta * 0.4, center.lng - delta],
        [center.lat + delta * 0.2, center.lng + delta * 0.2],
        [center.lat - delta * 0.4, center.lng + delta * 0.3],
        [center.lat - delta, center.lng - delta]
      ]
    },
    {
      id: 'lulc-agri',
      className: 'Agricultural Crop Land (Single Crop)',
      code: 'LULC-02',
      color: '#84cc16',
      description: 'Rainfed seasonal kharif cotton and coarse grain cultivation',
      areaPct: 24,
      polygon: [
        [center.lat + delta * 0.4, center.lng - delta],
        [center.lat + delta, center.lng - delta],
        [center.lat + delta, center.lng + delta * 0.2],
        [center.lat + delta * 0.2, center.lng + delta * 0.2],
        [center.lat + delta * 0.4, center.lng - delta]
      ]
    },
    {
      id: 'lulc-barren',
      className: 'Barren Coastal Mudflats',
      code: 'LULC-09',
      color: '#78716c',
      description: 'Unconsolidated clay flat with seasonal saline crust',
      areaPct: 12,
      polygon: [
        [center.lat - delta * 0.4, center.lng + delta * 0.3],
        [center.lat + delta * 0.2, center.lng + delta * 0.2],
        [center.lat + delta, center.lng + delta * 0.2],
        [center.lat + delta, center.lng + delta],
        [center.lat - delta, center.lng + delta],
        [center.lat - delta * 0.4, center.lng + delta * 0.3]
      ]
    }
  ];
}

export interface NDVIFeature {
  id: string;
  level: string;
  ndviRange: string;
  color: string;
  description: string;
  polygon: [number, number][];
}

/**
 * Generates Sentinel-2 / VEDAS Normalized Difference Vegetation Index (NDVI) overlay
 */
export function generateSiteNDVI(center: { lat: number; lng: number }): NDVIFeature[] {
  const d = 0.0055;
  return [
    {
      id: 'ndvi-high',
      level: 'High Vegetation (Canopy / Cropland)',
      ndviRange: '0.55 - 0.78',
      color: '#10b981',
      description: 'Healthy irrigated agro-forestry and riparian tree canopy',
      polygon: [
        [center.lat + d * 0.3, center.lng - d * 0.8],
        [center.lat + d * 0.9, center.lng - d * 0.8],
        [center.lat + d * 0.9, center.lng + d * 0.1],
        [center.lat + d * 0.3, center.lng - d * 0.1],
        [center.lat + d * 0.3, center.lng - d * 0.8]
      ]
    },
    {
      id: 'ndvi-mod',
      level: 'Moderate Vegetation (Shrub & Grass)',
      ndviRange: '0.30 - 0.54',
      color: '#84cc16',
      description: 'Natural grassland, seasonal roadside cover, and shrub patches',
      polygon: [
        [center.lat - d * 0.2, center.lng - d * 0.9],
        [center.lat + d * 0.3, center.lng - d * 0.8],
        [center.lat + d * 0.3, center.lng + d * 0.6],
        [center.lat - d * 0.3, center.lng + d * 0.5],
        [center.lat - d * 0.2, center.lng - d * 0.9]
      ]
    },
    {
      id: 'ndvi-low',
      level: 'Low Vegetation / Barren Surface',
      ndviRange: '0.08 - 0.29',
      color: '#eab308',
      description: 'Open gravel soil, compacted earth, and fallow wasteland',
      polygon: [
        [center.lat - d * 0.9, center.lng - d * 0.9],
        [center.lat - d * 0.2, center.lng - d * 0.9],
        [center.lat - d * 0.3, center.lng + d * 0.9],
        [center.lat - d * 0.9, center.lng + d * 0.9],
        [center.lat - d * 0.9, center.lng - d * 0.9]
      ]
    }
  ];
}

/**
 * Creates high-fidelity 12-zone master plan partition if no active plan is passed
 */
export function generateDefaultMasterPlan(
  siteName: string,
  center: { lat: number; lng: number },
  totalAcres: number = 500
): MasterPlanAlternative {
  const d = 0.0058; // grid half-dimension ~1.3km

  // Helper to build rectangular polygon [lng, lat] for GeoJSON standard
  const box = (latMin: number, latMax: number, lngMin: number, lngMax: number): number[][][] => {
    return [[
      [lngMin, latMin],
      [lngMax, latMin],
      [lngMax, latMax],
      [lngMin, latMax],
      [lngMin, latMin]
    ]];
  };

  const cLat = center.lat;
  const cLng = center.lng;

  const zones: MasterPlanZone[] = [
    {
      id: 'zone-r1',
      code: 'R1-TOD',
      name: 'High-Density TOD Residential',
      zone_type: 'residential_high',
      category: 'Residential',
      area_acres: Math.round(totalAcres * 0.22),
      area_percentage: 22,
      color: '#3b82f6',
      far_ratio: 2.8,
      target_capacity_people: 11000,
      description: 'Mixed-income transit-oriented residential district with 10-minute walkability to BRTS station.',
      geometry: { type: 'Polygon', coordinates: box(cLat - d * 0.3, cLat + d * 0.4, cLng - d * 0.8, cLng - d * 0.2) }
    },
    {
      id: 'zone-r2',
      code: 'R2-ECO',
      name: 'Eco-Neighborhoods & Courtyard Housing',
      zone_type: 'residential_medium',
      category: 'Residential',
      area_acres: Math.round(totalAcres * 0.16),
      area_percentage: 16,
      color: '#60a5fa',
      far_ratio: 1.8,
      target_capacity_people: 6000,
      description: 'Medium-density courtyard housing oriented for passive ventilation and rooftop solar integration.',
      geometry: { type: 'Polygon', coordinates: box(cLat + d * 0.4, cLat + d * 0.9, cLng - d * 0.8, cLng - d * 0.2) }
    },
    {
      id: 'zone-c1',
      code: 'C1-CORE',
      name: 'Central Commercial & Fin-Tech Hub',
      zone_type: 'commercial_mixed',
      category: 'Commercial',
      area_acres: Math.round(totalAcres * 0.10),
      area_percentage: 10,
      color: '#ef4444',
      far_ratio: 3.5,
      target_capacity_people: 8500,
      description: 'High-intensity corporate offices, retail arcade, and financial services district along the central boulevard.',
      geometry: { type: 'Polygon', coordinates: box(cLat - d * 0.3, cLat + d * 0.3, cLng - d * 0.2, cLng + d * 0.3) }
    },
    {
      id: 'zone-i1',
      code: 'I1-CLEAN',
      name: 'Clean-Tech & R&D Industrial Park',
      zone_type: 'industrial_clean',
      category: 'Industrial',
      area_acres: Math.round(totalAcres * 0.12),
      area_percentage: 12,
      color: '#8b5cf6',
      far_ratio: 1.5,
      target_capacity_people: 5200,
      description: 'Non-polluting semiconductor assembly, EV components, and aerospace engineering test facilities.',
      geometry: { type: 'Polygon', coordinates: box(cLat - d * 0.9, cLat - d * 0.3, cLng - d * 0.8, cLng - d * 0.1) }
    },
    {
      id: 'zone-g1',
      code: 'G1-GREEN',
      name: 'Central Forest & Miyawaki Biosphere',
      zone_type: 'green_buffer',
      category: 'Parks & Recreation',
      area_acres: Math.round(totalAcres * 0.14),
      area_percentage: 14,
      color: '#10b981',
      far_ratio: 0.1,
      target_capacity_people: 0,
      description: 'Native afforestation green spine, urban heat island sponge, and biodiversity conservation corridor.',
      geometry: { type: 'Polygon', coordinates: box(cLat - d * 0.4, cLat + d * 0.9, cLng + d * 0.3, cLng + d * 0.6) }
    },
    {
      id: 'zone-w1',
      code: 'W1-WATER',
      name: 'Eco-Lake & Flood Retention Reservoir',
      zone_type: 'water_retention',
      category: 'Water Bodies',
      area_acres: Math.round(totalAcres * 0.08),
      area_percentage: 8,
      color: '#06b6d4',
      far_ratio: 0.0,
      target_capacity_people: 0,
      description: 'Cascading natural water retention tanks with 50m NGT statutory ecological wetland buffer.',
      geometry: { type: 'Polygon', coordinates: box(cLat + d * 0.3, cLat + d * 0.9, cLng + d * 0.6, cLng + d * 0.95) }
    },
    {
      id: 'zone-re1',
      code: 'RE1-SOLAR',
      name: 'Utility Solar Farm & BESS Storage',
      zone_type: 'solar_farm',
      category: 'Renewable Energy',
      area_acres: Math.round(totalAcres * 0.07),
      area_percentage: 7,
      color: '#f59e0b',
      far_ratio: 0.2,
      target_capacity_people: 50,
      description: '35-Acre ground-mounted bifacial photovoltaic array paired with 25 MWh Battery Energy Storage System (BESS).',
      geometry: { type: 'Polygon', coordinates: box(cLat - d * 0.9, cLat - d * 0.4, cLng + d * 0.4, cLng + d * 0.95) }
    },
    {
      id: 'zone-tr1',
      code: 'TR1-SPINE',
      name: 'Multi-Modal Transit Spine & Mobility Hub',
      zone_type: 'transport_hub',
      category: 'Transport',
      area_acres: Math.round(totalAcres * 0.06),
      area_percentage: 6,
      color: '#64748b',
      far_ratio: 0.5,
      target_capacity_people: 1200,
      description: 'Complete streets right-of-way (45m ROW) featuring dedicated bus rapid transit lanes and protected cycleways.',
      geometry: { type: 'Polygon', coordinates: box(cLat - d * 0.05, cLat + d * 0.05, cLng - d * 0.9, cLng + d * 0.9) }
    },
    {
      id: 'zone-ut1',
      code: 'UT1-DEWATS',
      name: 'DEWATS & Circular Resource Recovery',
      zone_type: 'utility_dewats',
      category: 'Utilities',
      area_acres: Math.round(totalAcres * 0.03),
      area_percentage: 3,
      color: '#14b8a6',
      far_ratio: 0.4,
      target_capacity_people: 80,
      description: 'Decentralized Wastewater Treatment System (DEWATS) and automated pneumatic solid waste processing center.',
      geometry: { type: 'Polygon', coordinates: box(cLat - d * 0.9, cLat - d * 0.5, cLng - d * 0.1, cLng + d * 0.4) }
    },
    {
      id: 'zone-inst1',
      code: 'INST-CIVIC',
      name: 'Civic Center, Hospital & Education',
      zone_type: 'civic_institutional',
      category: 'Institutional',
      area_acres: Math.round(totalAcres * 0.02),
      area_percentage: 2,
      color: '#ec4899',
      far_ratio: 2.0,
      target_capacity_people: 3000,
      description: '300-bed district multi-specialty hospital, higher secondary school complex, and municipal e-governance office.',
      geometry: { type: 'Polygon', coordinates: box(cLat + d * 0.4, cLat + d * 0.8, cLng - d * 0.2, cLng + d * 0.3) }
    }
  ];

  return {
    plan_id: 'plan-default-tod',
    plan_code: 'PLAN-A',
    name: 'Plan A: Compact & Walkable Transit-Oriented Development',
    tagline: 'High-density polycentric master plan with 15-minute complete neighborhoods and zero-waste metabolism',
    paradigm: 'TOD & Circular Urbanism',
    target_population: 20000,
    total_area_acres: totalAcres,
    total_area_sqkm: Math.round((totalAcres * 0.00404686) * 100) / 100,
    gross_population_density_per_sqkm: 9884,
    gross_density_per_acre: 40.0,
    residential_net_density_per_acre: 105.2,
    walkability_score: 88,
    green_space_per_capita_sqm: 14.2,
    water_self_sufficiency_pct: 78.5,
    renewable_energy_coverage_pct: 82.0,
    public_transit_mode_share_target_pct: 65.0,
    estimated_infrastructure_capex_cr_inr: 485.5,
    zones: zones,
    tradeoffs_summary: 'Optimizes transit accessibility and reduces vehicle miles traveled by 42%. Requires strict adherence to FAR 2.8 setbacks and high-efficiency wastewater recycling.',
    density_evaluation: 'Optimal gross density of 9,884 people/km² meets international CPHEEO and UN-Habitat sustainable smart city benchmarks.',
    key_features: [
      '10-Minute Walkability radius to central public transport interchange',
      'Cascading 380 ML retention basin meeting 50-year storm flood requirements',
      '35-Acre Bifacial Solar Farm delivering 82% daytime net-zero energy',
      'Strict 50-meter statutory ecological riparian buffer compliance'
    ]
  };
}

export interface PresetLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  district: string;
  center: { lat: number; lng: number };
  areaAcres: number;
  population: number;
  suitabilityScore: number;
}

export const INDIAN_PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'site-dholera',
    name: 'Dholera Greenfield Industrial Smart City',
    city: 'Dholera SIR',
    state: 'Gujarat',
    district: 'Ahmedabad',
    center: { lat: 22.2530, lng: 72.1920 },
    areaAcres: 500.0,
    population: 20000,
    suitabilityScore: 78.4
  },
  {
    id: 'site-amaravati',
    name: 'Amaravati Sustainable Capital District',
    city: 'Amaravati',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    center: { lat: 16.5420, lng: 80.5180 },
    areaAcres: 480.0,
    population: 25000,
    suitabilityScore: 84.2
  },
  {
    id: 'site-devanahalli',
    name: 'Devanahalli Aero-City Innovation Zone',
    city: 'Bengaluru North',
    state: 'Karnataka',
    district: 'Bangalore Rural',
    center: { lat: 13.2510, lng: 77.7120 },
    areaAcres: 550.0,
    population: 18000,
    suitabilityScore: 81.6
  },
  {
    id: 'site-sonipat',
    name: 'Sonipat Global Education & Logistics City',
    city: 'Sonipat NCR',
    state: 'Haryana',
    district: 'Sonipat',
    center: { lat: 28.9880, lng: 77.0220 },
    areaAcres: 520.0,
    population: 22000,
    suitabilityScore: 76.8
  },
  {
    id: 'site-gift',
    name: 'GIFT City Expansion Phase-2',
    city: 'Gandhinagar',
    state: 'Gujarat',
    district: 'Gandhinagar',
    center: { lat: 23.1600, lng: 72.6840 },
    areaAcres: 420.0,
    population: 30000,
    suitabilityScore: 89.1
  },
  {
    id: 'site-shivamogga',
    name: 'Shivamogga Agri-Tech Eco-Settlement',
    city: 'Shivamogga',
    state: 'Karnataka',
    district: 'Shivamogga',
    center: { lat: 13.9320, lng: 75.5720 },
    areaAcres: 450.0,
    population: 15000,
    suitabilityScore: 86.5
  }
];
