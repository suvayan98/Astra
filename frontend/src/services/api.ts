import { 
  SiteSuitabilityResult, 
  MasterPlanComparison, 
  FutureSimulationResult, 
  ISROPortal, 
  SampleSite,
  GeoJSONGeometry,
  CityZone
} from '../types';

const API_BASE = '/api';

export async function fetchSampleSites(): Promise<SampleSite[]> {
  try {
    const res = await fetch(`${API_BASE}/site/samples`);
    if (!res.ok) throw new Error('Failed to fetch samples');
    const data = await res.json();
    return data.sites || [];
  } catch (err) {
    console.warn('Using local fallback sample sites:', err);
    return [
      {
        site_id: 'site_amaravati',
        name: 'Amaravati River Basin Periphery, Andhra Pradesh',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        center: [80.515, 16.541],
        area_acres: 500.0,
        proposed_population: 20000,
        polygon: {
          type: 'Polygon',
          coordinates: [[[80.505, 16.533], [80.525, 16.533], [80.528, 16.549], [80.508, 16.551], [80.505, 16.533]]]
        },
        terrain_profile: { min_elev: 18.0, max_elev: 32.0, mean_elev: 24.5, mean_slope: 2.1, soil_type: 'Deep Black Alluvial (Vertisols)' }
      },
      {
        site_id: 'site_dholera',
        name: 'Dholera Special Investment Region (SIR), Gujarat',
        state: 'Gujarat',
        district: 'Ahmedabad',
        center: [72.195, 22.245],
        area_acres: 500.0,
        proposed_population: 20000,
        polygon: {
          type: 'Polygon',
          coordinates: [[[72.185, 22.235], [72.205, 22.235], [72.208, 22.253], [72.188, 22.255], [72.185, 22.235]]]
        },
        terrain_profile: { min_elev: 4.0, max_elev: 11.0, mean_elev: 7.2, mean_slope: 0.8, soil_type: 'Saline Coastal Marine & Alluvial Soil' }
      },
      {
        site_id: 'site_bengaluru',
        name: 'Devanahalli North Innovation Corridors, Karnataka',
        state: 'Karnataka',
        district: 'Bengaluru Rural',
        center: [77.712, 13.250],
        area_acres: 500.0,
        proposed_population: 20000,
        polygon: {
          type: 'Polygon',
          coordinates: [[[77.702, 13.242], [77.722, 13.242], [77.725, 13.258], [77.705, 13.260], [77.702, 13.242]]]
        },
        terrain_profile: { min_elev: 890.0, max_elev: 925.0, mean_elev: 908.0, mean_slope: 3.8, soil_type: 'Red Sandy Loam (Alfisols)' }
      }
    ];
  }
}

export async function analyzeSite(payload: {
  name: string;
  state: string;
  district: string;
  polygon: GeoJSONGeometry;
  area_acres: number;
  proposed_population: number;
}): Promise<SiteSuitabilityResult> {
  const res = await fetch(`${API_BASE}/site/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Site analysis request failed');
  return res.json();
}

export async function generateMasterPlans(payload: {
  site_id: string;
  polygon: GeoJSONGeometry;
  population: number;
  area_acres: number;
  sustainability_priorities?: string[];
}): Promise<MasterPlanComparison> {
  const res = await fetch(`${API_BASE}/city/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Master plan generation failed');
  return res.json();
}

export async function editCityZone(
  cityId: string, 
  payload: { site_polygon: GeoJSONGeometry; existing_zones: CityZone[]; updated_zone: CityZone }
) {
  const res = await fetch(`${API_BASE}/city/${cityId}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Zone edit failed');
  return res.json();
}

export async function simulateCity(cityId: string, payload: {
  base_population: number;
  plan_id: string;
  pop_growth_rate_pct: number;
  water_lpcd: number;
  re_growth_rate_pct: number;
}): Promise<FutureSimulationResult> {
  const res = await fetch(`${API_BASE}/city/${cityId}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
}

export async function askAdvisor(payload: {
  question: string;
  site_id?: string;
  plan_id?: string;
}) {
  const res = await fetch(`${API_BASE}/ai/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Advisor request failed');
  return res.json();
}

export async function fetchISROHubStatus(): Promise<{ hub_title: string; demo_mode_active: boolean; portals: ISROPortal[] }> {
  const res = await fetch(`${API_BASE}/data-sources/status`);
  if (!res.ok) throw new Error('Failed to fetch ISRO status');
  return res.json();
}

export async function searchBhoonidhiSTAC(payload: {
  bbox: number[];
  start_date?: string;
  end_date?: string;
  collection?: string;
}) {
  const res = await fetch(`${API_BASE}/isro/bhoonidhi/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Bhoonidhi search failed');
  return res.json();
}

export async function updateSourceConfig(source: string, payload: {
  api_key?: string;
  token?: string;
  user?: string;
  demo_mode?: boolean;
}) {
  const res = await fetch(`${API_BASE}/data-sources/${source}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Config update failed');
  return res.json();
}
