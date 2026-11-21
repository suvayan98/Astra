import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MapWorkspace } from './components/MapWorkspace';
import { ThreeCityView } from './components/ThreeCityView';
import { AdvisorDrawer } from './components/AdvisorDrawer';

import { DashboardView } from './views/DashboardView';
import { SiteAnalysisView } from './views/SiteAnalysisView';
import { TerrainSoilView } from './views/TerrainSoilView';
import { WaterIntelligenceView } from './views/WaterIntelligenceView';
import { ClimateDisasterView } from './views/ClimateDisasterView';
import { RenewableEnergyView } from './views/RenewableEnergyView';
import { VegetationPlannerView } from './views/VegetationPlannerView';
import { MasterPlanDesignerView } from './views/MasterPlanDesignerView';
import { FutureSimulationView } from './views/FutureSimulationView';
import { ISROHubView } from './views/ISROHubView';
import { ReportsView } from './views/ReportsView';

import { 
  SampleSite, 
  SiteSuitabilityResult, 
  MasterPlanComparison, 
  FutureSimulationResult,
  CityZone
} from './types';
import { 
  fetchSampleSites, 
  analyzeSite, 
  generateMasterPlans, 
  simulateCity,
  editCityZone 
} from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sampleSites, setSampleSites] = useState<SampleSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<SampleSite | null>(null);

  const [siteAnalysis, setSiteAnalysis] = useState<SiteSuitabilityResult | null>(null);
  const [planComparison, setPlanComparison] = useState<MasterPlanComparison | null>(null);
  const [activePlanId, setActivePlanId] = useState<string>('plan_a');
  const [simulationData, setSimulationData] = useState<FutureSimulationResult | null>(null);

  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [is3DOpen, setIs3DOpen] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Initialize Data
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      try {
        const sites = await fetchSampleSites();
        setSampleSites(sites);
        if (sites.length > 0) {
          const defaultSite = sites[0];
          setSelectedSite(defaultSite);
          await loadSiteData(defaultSite);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const loadSiteData = async (site: SampleSite) => {
    try {
      // 1. Site Analysis
      const analysis = await analyzeSite({
        name: site.name,
        state: site.state,
        district: site.district,
        polygon: site.polygon,
        area_acres: site.area_acres,
        proposed_population: site.proposed_population
      });
      setSiteAnalysis(analysis);

      // 2. Master Plans
      const plans = await generateMasterPlans({
        site_id: site.site_id,
        polygon: site.polygon,
        population: site.proposed_population,
        area_acres: site.area_acres
      });
      setPlanComparison(plans);
      setActivePlanId(plans.ai_recommended_plan_id || 'plan_a');

      // 3. Multi-decadal Future Simulation
      const sim = await simulateCity(site.site_id, {
        base_population: site.proposed_population,
        plan_id: 'plan_a',
        pop_growth_rate_pct: 2.2,
        water_lpcd: 135.0,
        re_growth_rate_pct: 3.5
      });
      setSimulationData(sim);
    } catch (err) {
      console.error('Failed to load site analytics:', err);
    }
  };

  const handleSelectSite = async (site: SampleSite) => {
    setSelectedSite(site);
    await loadSiteData(site);
  };

  const handleRunSimulation = async (params: {
    pop_growth_rate_pct: number;
    water_lpcd: number;
    re_growth_rate_pct: number;
  }) => {
    if (!selectedSite) return;
    setIsSimulating(true);
    try {
      const sim = await simulateCity(selectedSite.site_id, {
        base_population: selectedSite.proposed_population,
        plan_id: activePlanId,
        pop_growth_rate_pct: params.pop_growth_rate_pct,
        water_lpcd: params.water_lpcd,
        re_growth_rate_pct: params.re_growth_rate_pct
      });
      setSimulationData(sim);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleUpdateZone = async (updatedZone: CityZone) => {
    if (!selectedSite || !planComparison) return;
    const currentPlan = planComparison.plans.find(p => p.plan_id === activePlanId);
    if (!currentPlan) return;

    try {
      await editCityZone(selectedSite.site_id, {
        site_polygon: selectedSite.polygon,
        existing_zones: currentPlan.zones,
        updated_zone: updatedZone
      });

      // Update in memory
      const updatedPlans = planComparison.plans.map(p => {
        if (p.plan_id === activePlanId) {
          return {
            ...p,
            zones: p.zones.map(z => z.id === updatedZone.id ? updatedZone : z)
          };
        }
        return p;
      });

      setPlanComparison({
        ...planComparison,
        plans: updatedPlans
      });
    } catch (err) {
      console.error('Failed to update zone:', err);
    }
  };

  const handleDeleteZone = (zoneId: string) => {
    if (!planComparison) return;
    const updatedPlans = planComparison.plans.map(p => {
      if (p.plan_id === activePlanId) {
        return {
          ...p,
          zones: p.zones.filter(z => z.id !== zoneId)
        };
      }
      return p;
    });

    setPlanComparison({
      ...planComparison,
      plans: updatedPlans
    });
  };

  const activePlan = planComparison?.plans.find(p => p.plan_id === activePlanId) || null;
  const exclusionZones = siteAnalysis?.exclusion_zones || [];
  const modules = siteAnalysis?.module_summaries || {};

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080d1a] text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedSite={selectedSite}
        sampleSites={sampleSites}
        onSelectSite={handleSelectSite}
        onOpenAdvisor={() => setIsAdvisorOpen(!isAdvisorOpen)}
        onOpen3D={() => setIs3DOpen(true)}
        isAdvisorOpen={isAdvisorOpen}
        demoMode={demoMode}
      />

      {/* Main Workspace: Sidebar + Center Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          siteScore={siteAnalysis?.overall_suitability_score}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0a0f1d]">
          {isInitializing ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Initializing TerraAI Geospatial Engine...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  siteAnalysis={siteAnalysis}
                  activePlan={activePlan}
                  selectedSite={selectedSite}
                  onNavigate={setCurrentTab}
                  onOpenAdvisor={() => setIsAdvisorOpen(true)}
                />
              )}

              {currentTab === 'map' && (
                <MapWorkspace
                  selectedSite={selectedSite}
                  activePlan={activePlan}
                  exclusionZones={exclusionZones}
                  onUpdateZone={handleUpdateZone}
                  onDeleteZone={handleDeleteZone}
                  onSelectSite={handleSelectSite}
                  sampleSites={sampleSites}
                />
              )}

              {currentTab === 'site_selection' && (
                <SiteAnalysisView
                  siteAnalysis={siteAnalysis}
                  selectedSite={selectedSite}
                  sampleSites={sampleSites}
                  onSelectSite={handleSelectSite}
                />
              )}

              {currentTab === 'terrain_soil' && (
                <TerrainSoilView
                  terrainData={modules.terrain}
                  soilData={modules.soil}
                />
              )}

              {currentTab === 'water' && (
                <WaterIntelligenceView
                  waterData={modules.water}
                  population={selectedSite?.proposed_population || 20000}
                />
              )}

              {currentTab === 'climate' && (
                <ClimateDisasterView
                  climateData={modules.climate}
                />
              )}

              {currentTab === 'energy' && (
                <RenewableEnergyView
                  energyData={modules.energy}
                  population={selectedSite?.proposed_population || 20000}
                />
              )}

              {currentTab === 'vegetation' && (
                <VegetationPlannerView
                  vegetationData={modules.vegetation}
                />
              )}

              {currentTab === 'master_plan' && (
                <MasterPlanDesignerView
                  planComparison={planComparison}
                  activePlanId={activePlanId}
                  onSelectPlan={setActivePlanId}
                  onOpenMap={() => setCurrentTab('map')}
                  onOpen3D={() => setIs3DOpen(true)}
                />
              )}

              {currentTab === 'future_sim' && (
                <FutureSimulationView
                  simulationData={simulationData}
                  onRunSimulation={handleRunSimulation}
                  isLoading={isSimulating}
                />
              )}

              {currentTab === 'isro_hub' && (
                <ISROHubView
                  demoMode={demoMode}
                  onToggleDemoMode={setDemoMode}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  siteAnalysis={siteAnalysis}
                  activePlan={activePlan}
                  selectedSite={selectedSite}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* TerraAdvisor AI Chat Slide-over Drawer */}
      <AdvisorDrawer
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        siteId={selectedSite?.site_id}
        planId={activePlanId}
      />

      {/* 3D Digital Twin Modal */}
      {is3DOpen && (
        <ThreeCityView
          activePlan={activePlan}
          onClose={() => setIs3DOpen(false)}
        />
      )}
    </div>
  );
};
