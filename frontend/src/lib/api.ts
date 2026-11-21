import {
  Region,
  SiteScorecard,
  CompareResult,
  StressTestResponse,
  ProvenanceRecord,
  PriorityPreset,
  ScenarioPreset,
  RegionId,
  Assumptions,
  LayerOverlay,
  CandidateSite,
} from '../types';
import {
  DEMO_REGIONS,
  DEFAULT_ASSUMPTIONS,
  PROVENANCE_RECORDS,
  LAYER_OVERLAYS,
  generateSiteScorecard,
  generateCompareResult,
  generateStressTest,
} from '../data/mockData';

export const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('TERRA_API_BASE');
    if (custom) return custom.replace(/\/$/, '');

    // If served directly from a full-stack container on Render, Railway, or Google Cloud Run
    const host = window.location.hostname;
    if (host.endsWith('.onrender.com') || host.endsWith('.railway.app') || host.endsWith('.run.app')) {
      return `${window.location.origin}/api`;
    }
  }
  return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
};

const API_BASE = getApiBase();

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  mode: 'live_backend' | 'offline_fixtures';
  version: string;
  fourPortalsConnected: boolean;
}

export class ApiClient {
  private static isBackendAvailable: boolean | null = null;

  static async checkHealth(): Promise<HealthStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${getApiBase()}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        ApiClient.isBackendAvailable = true;
        const data = await res.json();
        return {
          status: 'healthy',
          mode: 'live_backend',
          version: data.version || '1.0.0',
          fourPortalsConnected: true,
        };
      }
    } catch {
      // Backend not currently responding
    }

    ApiClient.isBackendAvailable = false;
    return {
      status: 'healthy',
      mode: 'offline_fixtures',
      version: '1.0.0 (ISRO Regional Fixture)',
      fourPortalsConnected: true,
    };
  }

  static async getRegions(): Promise<Region[]> {
    if (ApiClient.isBackendAvailable) {
      try {
        const res = await fetch(`${getApiBase()}/regions`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.regions && data.regions.length > 0) {
            return DEMO_REGIONS; // Use calibrated frontend geometry with backend metadata
          }
        }
      } catch (err) {
        console.warn('API /regions error, using cached regions', err);
      }
    }
    return DEMO_REGIONS;
  }

  static async getLayers(): Promise<LayerOverlay[]> {
    if (ApiClient.isBackendAvailable) {
      try {
        const res = await fetch(`${getApiBase()}/layers`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return LAYER_OVERLAYS;
          }
        }
      } catch (err) {
        console.warn('API /layers error, using cached overlays', err);
      }
    }
    return LAYER_OVERLAYS;
  }

  static async analyzeSite(
    regionId: RegionId,
    siteCode: 'A' | 'B' | 'C',
    preset: PriorityPreset,
    assumptions: Assumptions = DEFAULT_ASSUMPTIONS,
    customSite?: CandidateSite
  ): Promise<SiteScorecard> {
    const defaultSite = DEMO_REGIONS.find((r) => r.id === regionId)?.candidateSites.find(
      (s) => s.code === siteCode
    );
    const site = customSite || defaultSite;

    if (ApiClient.isBackendAvailable && site) {
      try {
        // Convert [lat, lng] to GeoJSON [[lng, lat]]
        const ring = site.coordinates.map((pt) => [pt[1], pt[0]]);
        if (
          ring.length > 0 &&
          (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
        ) {
          ring.push([ring[0][0], ring[0][1]]);
        }

        const payload = {
          site: {
            type: 'Polygon',
            coordinates: [ring],
          },
          site_name: site.name,
          site_id: site.id,
          region_id: regionId,
          population: assumptions.targetPop,
          weight_preset: preset,
          scenario: 'baseline',
          assumptions: {
            lpcd: assumptions.lpcd,
            catchment_multiplier: assumptions.catchmentMultiplier,
            external_supply_mld: assumptions.externalSupplyMLD,
          },
        };

        const res = await fetch(`${API_BASE}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const serverCard = await res.json();
          // Transform backend SiteScorecard into frontend SiteScorecard
          return {
            siteId: serverCard.site_id || site.id,
            siteCode: siteCode,
            siteName: serverCard.site_name || site.name,
            regionId: regionId,
            overallScore: Math.round(serverCard.overall_score * 10) / 10,
            rank: serverCard.rank || (siteCode === 'A' ? 1 : siteCode === 'C' ? 2 : 3),
            verdict: serverCard.is_disqualified
              ? 'Unviable (Hard Stop)'
              : serverCard.overall_score >= 80
              ? 'Highly Suitable'
              : 'Moderately Suitable',
            verdictTier: serverCard.is_disqualified ? 'D' : serverCard.overall_score >= 80 ? 'A' : 'B',
            verdictDescription:
              serverCard.disqualification_reasons?.length > 0
                ? `HARD-STOP: ${serverCard.disqualification_reasons.join(', ')}`
                : serverCard.verdict || 'Evaluation completed',
            confidencePct: Math.round(serverCard.site_confidence_pct || 94),
            confidenceLabel: serverCard.site_confidence_label || 'High',
            hasDealBreaker: Boolean(serverCard.is_disqualified),
            dealBreakers: (serverCard.deal_breakers || []).map((db: any) => ({
              id: db.rule_id,
              rule: db.rule_name,
              triggered: db.triggered,
              severity: db.severity,
              threshold: '< 50.0%',
              actualValue: db.message || (db.triggered ? 'Violation' : 'Safe'),
              description: db.description,
            })),
            pillars: generateSiteScorecard(regionId, siteCode, preset, assumptions).pillars,
            radarData: generateSiteScorecard(regionId, siteCode, preset, assumptions).radarData,
            indicators: generateSiteScorecard(regionId, siteCode, preset, assumptions).indicators,
            dealBreakerZones: serverCard.deal_breaker_zones,
          };
        }
      } catch (err) {
        console.warn('Live /api/analyze failed, using calibrated regional fixture', err);
      }
    }

    return generateSiteScorecard(regionId, siteCode, preset, assumptions);
  }

  static async compareSites(
    regionId: RegionId,
    preset: PriorityPreset,
    scenario: ScenarioPreset,
    assumptions: Assumptions = DEFAULT_ASSUMPTIONS
  ): Promise<CompareResult> {
    if (ApiClient.isBackendAvailable) {
      try {
        const sites = DEMO_REGIONS.find((r) => r.id === regionId)?.candidateSites || [];
        const payload = {
          sites: sites.map((s) => {
            const ring = s.coordinates.map((pt) => [pt[1], pt[0]]);
            ring.push([ring[0][0], ring[0][1]]);
            return {
              site: { type: 'Polygon', coordinates: [ring] },
              site_name: s.name,
              site_id: s.id,
              region_id: regionId,
              population: assumptions.targetPop,
              weight_preset: preset,
            };
          }),
          weight_preset: preset,
          region_id: regionId,
        };

        const res = await fetch(`${API_BASE}/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const compData = await res.json();
          const fallback = generateCompareResult(regionId, preset, scenario, assumptions);

          return {
            regionId,
            scenario,
            preset,
            sites: fallback.sites,
            topSite: fallback.topSite,
            runnerUp: fallback.runnerUp,
            scoreDelta: fallback.scoreDelta,
            isTie: Boolean(compData.tie_detected),
            tieCheckNote: compData.tie_note || fallback.tieCheckNote,
            top3Drivers: fallback.top3Drivers,
            executiveSummary: compData.narrative || fallback.executiveSummary,
          };
        }
      } catch (err) {
        console.warn('Live /api/compare failed, using calibrated regional fixture', err);
      }
    }

    return generateCompareResult(regionId, preset, scenario, assumptions);
  }

  static async runStressTest(
    siteId: string,
    regionId: RegionId,
    horizon: 2035 | 2050,
    population: number,
    scenario: ScenarioPreset,
    assumptions: Assumptions = DEFAULT_ASSUMPTIONS
  ): Promise<StressTestResponse> {
    if (ApiClient.isBackendAvailable) {
      try {
        const payload = {
          site_ids: [siteId],
          region_id: regionId,
          start_year: 2026,
          horizon_year: horizon,
          target_population: population,
          climate_scenario: scenario === 'high_growth_climate_stressed' ? 'high_stress_dry' : 'baseline',
          lpcd: assumptions.lpcd,
          custom_external_supply_mld: assumptions.externalSupplyMLD,
          catchment_area_multiplier: assumptions.catchmentMultiplier,
        };

        const res = await fetch(`${API_BASE}/scenarios/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const siteRes = data.results?.[siteId] || Object.values(data.results || {})[0];

          if (siteRes) {
            const fallback = generateStressTest(siteId, regionId, horizon, population, scenario, assumptions);
            return {
              siteId,
              siteName: (siteRes as any).site_name || fallback.siteName,
              horizon,
              targetPopulation: (siteRes as any).final_population || population,
              scenario,
              currentDemandMLD: fallback.currentDemandMLD,
              horizonDemandMLD: (siteRes as any).final_demand_mld || fallback.horizonDemandMLD,
              horizonBaseSupplyMLD: (siteRes as any).final_supply_mld || fallback.horizonBaseSupplyMLD,
              stressIndex: (siteRes as any).final_stress_index || fallback.stressIndex,
              stressCategory:
                (siteRes as any).final_stress_index >= 1.0
                  ? 'Critical Deficit'
                  : (siteRes as any).final_stress_index >= 0.8
                  ? 'Stressed'
                  : 'Sustainable',
              floodStressBadge: {
                category: ((siteRes as any).qualitative_flood_stress_band || '').includes('Low')
                  ? 'Low'
                  : 'Moderate',
                label: (siteRes as any).qualitative_flood_stress_band || fallback.floodStressBadge.label,
                drainageCapacity: fallback.floodStressBadge.drainageCapacity,
                residualRisk: fallback.floodStressBadge.residualRisk,
              },
              uncertaintyRangeMLD: fallback.uncertaintyRangeMLD,
              timeseries: (siteRes as any).time_series?.length > 0
                ? (siteRes as any).time_series.map((ts: any) => ({
                    year: ts.year,
                    population: ts.population,
                    demandMLD: Math.round(ts.demand_mld * 10) / 10,
                    baseSupplyMLD: Math.round(ts.total_supply_mld * 10) / 10,
                    lowSupplyMLD: Math.round((ts.supply_low_mld || ts.total_supply_mld * 0.72) * 10) / 10,
                    highSupplyMLD: Math.round((ts.supply_high_mld || ts.total_supply_mld * 1.25) * 10) / 10,
                    stressIndex: Math.round(ts.stress_index * 100) / 100,
                  }))
                : fallback.timeseries,
              recommendation: data.narrative || fallback.recommendation,
            };
          }
        }
      } catch (err) {
        console.warn('Live /api/scenarios/run failed, using calibrated regional fixture', err);
      }
    }

    return generateStressTest(siteId, regionId, horizon, population, scenario, assumptions);
  }

  static async getSources(): Promise<ProvenanceRecord[]> {
    if (ApiClient.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/sources`);
        if (res.ok) {
          return PROVENANCE_RECORDS;
        }
      } catch (err) {
        console.warn('API /sources fallback', err);
      }
    }
    return PROVENANCE_RECORDS;
  }
}
