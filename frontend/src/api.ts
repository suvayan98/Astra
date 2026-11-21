import {
  SiteSuitabilityResult, TerrainAnalysisResult, SoilAnalysisResult,
  WaterIntelligenceResult, ClimateDisasterResult, RenewableEnergyResult,
  VegetationIntelligenceResult, MasterPlanAlternative, ScenarioSimulationResult,
  ISROHubOverview, AssistantResponse
} from './types';

const BASE_URL = '/api';

export async function fetchPresetSites(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/site/presets`);
  if (!res.ok) throw new Error('Failed to fetch preset sites');
  return res.json();
}

export async function analyzeSite(payload: any): Promise<SiteSuitabilityResult> {
  const res = await fetch(`${BASE_URL}/site/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to analyze site suitability');
  return res.json();
}

export async function analyzeTerrain(payload: any): Promise<TerrainAnalysisResult> {
  const res = await fetch(`${BASE_URL}/terrain/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to analyze terrain');
  return res.json();
}

export async function analyzeSoil(payload: any): Promise<SoilAnalysisResult> {
  const res = await fetch(`${BASE_URL}/soil/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to analyze soil');
  return res.json();
}

export async function analyzeWater(payload: any): Promise<WaterIntelligenceResult> {
  const res = await fetch(`${BASE_URL}/water/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to analyze water balance');
  return res.json();
}

export async function analyzeClimate(payload: any): Promise<ClimateDisasterResult> {
  const res = await fetch(`${BASE_URL}/climate/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to analyze climate');
  return res.json();
}

export async function analyzeEnergy(payload: any): Promise<RenewableEnergyResult> {
  const res = await fetch(`${BASE_URL}/energy/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to analyze renewable energy');
  return res.json();
}

export async function analyzeVegetation(payload: any): Promise<VegetationIntelligenceResult> {
  const res = await fetch(`${BASE_URL}/vegetation/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to analyze vegetation');
  return res.json();
}

export async function generateMasterPlans(payload: any): Promise<MasterPlanAlternative[]> {
  const res = await fetch(`${BASE_URL}/city/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate master plans');
  return res.json();
}

export async function editZone(cityId: string, payload: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/city/${cityId}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update zone');
  return res.json();
}

export async function simulateFutureCity(cityId: string, payload: any): Promise<ScenarioSimulationResult> {
  const res = await fetch(`${BASE_URL}/city/${cityId}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to simulate future city');
  return res.json();
}

export async function getISROStatus(): Promise<ISROHubOverview> {
  const res = await fetch(`${BASE_URL}/data-sources/status`);
  if (!res.ok) throw new Error('Failed to get ISRO hub status');
  return res.json();
}

export async function fetchISROSource(source: string, payload: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/data-sources/${source}/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to fetch from ${source}`);
  return res.json();
}

export async function updateISROCredentials(creds: Record<string, string>): Promise<any> {
  const res = await fetch(`${BASE_URL}/data-sources/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds)
  });
  if (!res.ok) throw new Error('Failed to update credentials');
  return res.json();
}

export async function askAdvisor(payload: any): Promise<AssistantResponse> {
  const res = await fetch(`${BASE_URL}/ai/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to query AI assistant');
  return res.json();
}

export async function generateFullReport(payload: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate full report');
  return res.json();
}
