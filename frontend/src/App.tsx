import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MapWorkspace } from './components/MapWorkspace';
import { SiteSuitabilityView } from './components/SiteSuitabilityView';
import { TerrainSoilView } from './components/TerrainSoilView';
import { WaterIntelligenceView } from './components/WaterIntelligenceView';
import { ClimateDisasterView } from './components/ClimateDisasterView';
import { RenewableEnergyView } from './components/RenewableEnergyView';
import { VegetationView } from './components/VegetationView';
import { MasterPlanDesigner } from './components/MasterPlanDesigner';
import { FutureSimulationView } from './components/FutureSimulationView';
import { ISROHubView } from './components/ISROHubView';
import { TerraAdvisorDrawer } from './components/TerraAdvisorDrawer';
import { ReportExportModal } from './components/ReportExportModal';
import { CredentialsModal } from './components/CredentialsModal';
import { EditZoneModal } from './components/EditZoneModal';

import {
  fetchPresetSites, analyzeSite, analyzeTerrain, analyzeSoil,
  analyzeWater, analyzeClimate, analyzeEnergy, analyzeVegetation,
  generateMasterPlans, editZone, getISROStatus
} from './api';

import {
  SiteSuitabilityResult, TerrainAnalysisResult, SoilAnalysisResult,
  WaterIntelligenceResult, ClimateDisasterResult, RenewableEnergyResult,
  VegetationIntelligenceResult, MasterPlanAlternative, MasterPlanZone
} from './types';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('master_plan');

  // Planning Parameters
  const [presetSites, setPresetSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-dholera');
  const [population, setPopulation] = useState<number>(20000);
  const [areaAcres, setAreaAcres] = useState<number>(500.0);
  const [customBoundary, setCustomBoundary] = useState<any | null>(null);

  // Analysis State
  const [suitability, setSuitability] = useState<SiteSuitabilityResult | null>(null);
  const [terrain, setTerrain] = useState<TerrainAnalysisResult | null>(null);
  const [soil, setSoil] = useState<SoilAnalysisResult | null>(null);
  const [water, setWater] = useState<WaterIntelligenceResult | null>(null);
  const [climate, setClimate] = useState<ClimateDisasterResult | null>(null);
  const [energy, setEnergy] = useState<RenewableEnergyResult | null>(null);
  const [vegetation, setVegetation] = useState<VegetationIntelligenceResult | null>(null);

  // Master Plans
  const [plans, setPlans] = useState<MasterPlanAlternative[]>([]);
  const [activePlan, setActivePlan] = useState<MasterPlanAlternative | null>(null);

  // Loading States
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(true);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);

  // Drawers & Modals
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<MasterPlanZone | null>(null);

  // 1. Initial Load of Preset Sites
  useEffect(() => {
    const initPresets = async () => {
      try {
        const sites = await fetchPresetSites();
        setPresetSites(sites);
        if (sites.length > 0) {
          const defaultSite = sites[0];
          setSelectedSiteId(defaultSite.id);
          setAreaAcres(defaultSite.area_acres);
          setPopulation(defaultSite.target_population);
          loadAllData(defaultSite.id, defaultSite.area_acres, defaultSite.target_population, null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    initPresets();
  }, []);

  // 2. Load all analytical pipelines
  const loadAllData = async (siteId: string, acres: number, pop: number, customBnd: any) => {
    setLoadingAnalysis(true);
    setLoadingPlans(true);

    try {
      // Find site in preset list
      const site = presetSites.find((s) => s.id === siteId) || presetSites[0];
      const boundaryToUse = customBnd || (site ? site.boundary : null);

      const [suitRes, terrRes, soilRes, waterRes, climRes, enerRes, vegRes, plansRes] = await Promise.all([
        analyzeSite({
          name: site ? site.name : "Custom Site",
          boundary: boundaryToUse || { type: "Polygon", coordinates: [] },
          area_acres: acres,
          target_population: pop,
          district: site ? site.district : "Ahmedabad",
          state: site ? site.state : "Gujarat"
        }),
        analyzeTerrain({ site_id: siteId }),
        analyzeSoil({ site_id: siteId }),
        analyzeWater({ site_id: siteId, population: pop, area_acres: acres }),
        analyzeClimate({ site_id: siteId }),
        analyzeEnergy({ site_id: siteId, population: pop, area_acres: acres }),
        analyzeVegetation({ site_id: siteId, area_acres: acres }),
        generateMasterPlans({
          site_id: siteId,
          boundary: boundaryToUse || { type: "Polygon", coordinates: [] },
          total_area_acres: acres,
          target_population: pop
        })
      ]);

      setSuitability(suitRes);
      setTerrain(terrRes);
      setSoil(soilRes);
      setWater(waterRes);
      setClimate(climRes);
      setEnergy(enerRes);
      setVegetation(vegRes);
      setPlans(plansRes);
      if (plansRes.length > 0) {
        setActivePlan(plansRes[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
      setLoadingPlans(false);
    }
  };

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    setCustomBoundary(null);
    const site = presetSites.find((s) => s.id === siteId);
    if (site) {
      setAreaAcres(site.area_acres);
      setPopulation(site.target_population);
      loadAllData(siteId, site.area_acres, site.target_population, null);
    }
  };

  const handleBoundaryDrawn = (polygonCoords: number[][][], computedAcres: number) => {
    const newBoundary = { type: 'Polygon', coordinates: polygonCoords };
    setCustomBoundary(newBoundary);
    setAreaAcres(computedAcres);
    loadAllData(selectedSiteId, computedAcres, population, newBoundary);
  };

  const handleRegeneratePlans = async (priorities: string[]) => {
    setLoadingPlans(true);
    try {
      const site = presetSites.find((s) => s.id === selectedSiteId);
      const bnd = customBoundary || (site ? site.boundary : null);
      const newPlans = await generateMasterPlans({
        site_id: selectedSiteId,
        boundary: bnd || { type: "Polygon", coordinates: [] },
        total_area_acres: areaAcres,
        target_population: population,
        sustainability_priorities: priorities
      });
      setPlans(newPlans);
      if (newPlans.length > 0) {
        setActivePlan(newPlans[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleEditZoneSave = async (updatedFields: Partial<MasterPlanZone>) => {
    if (!editingZone || !activePlan) return;
    try {
      await editZone(selectedSiteId || 'active_session', {
        plan_id: activePlan.plan_id,
        zone_id: editingZone.id,
        ...updatedFields
      });

      // Update state locally
      const updatedZones = activePlan.zones.map((z) => {
        if (z.id === editingZone.id) {
          return { ...z, ...updatedFields } as MasterPlanZone;
        }
        return z;
      });

      const updatedPlan = { ...activePlan, zones: updatedZones };
      setActivePlan(updatedPlan);
      setPlans((prev) => prev.map((p) => p.plan_id === updatedPlan.plan_id ? updatedPlan : p));
      setEditingZone(null);
    } catch (err) {
      console.error(err);
    }
  };

  const currentSite = presetSites.find((s) => s.id === selectedSiteId) || {
    name: 'India Greenfield Site',
    center: { lat: 22.2530, lng: 72.1920 },
    boundary: { type: 'Polygon', coordinates: [] }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        presetSites={presetSites}
        selectedSiteId={selectedSiteId}
        onSelectSite={handleSelectSite}
        population={population}
        setPopulation={(newPop) => {
          setPopulation(newPop);
          loadAllData(selectedSiteId, areaAcres, newPop, customBoundary);
        }}
        areaAcres={areaAcres}
        isroConnected={true}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenIsroModal={() => setIsCredentialsOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'map' && (
          <MapWorkspace
            center={currentSite.center}
            boundary={customBoundary || currentSite.boundary}
            activePlan={activePlan}
            onEditZone={(zone) => setEditingZone(zone)}
            onBoundaryDrawn={handleBoundaryDrawn}
            siteName={currentSite.name}
          />
        )}

        {activeTab === 'suitability' && (
          <SiteSuitabilityView
            suitability={suitability}
            loading={loadingAnalysis}
          />
        )}

        {activeTab === 'terrain_soil' && (
          <TerrainSoilView
            terrain={terrain}
            soil={soil}
            loading={loadingAnalysis}
          />
        )}

        {activeTab === 'water' && (
          <WaterIntelligenceView
            water={water}
            loading={loadingAnalysis}
          />
        )}

        {activeTab === 'climate' && (
          <ClimateDisasterView
            climate={climate}
            loading={loadingAnalysis}
          />
        )}

        {activeTab === 'energy' && (
          <RenewableEnergyView
            energy={energy}
            loading={loadingAnalysis}
          />
        )}

        {activeTab === 'vegetation' && (
          <VegetationView
            vegetation={vegetation}
            loading={loadingAnalysis}
          />
        )}

        {activeTab === 'master_plan' && (
          <MasterPlanDesigner
            plans={plans}
            activePlan={activePlan}
            onSelectPlan={(p) => setActivePlan(p)}
            onEditZone={(z) => setEditingZone(z)}
            onRegeneratePlans={handleRegeneratePlans}
            population={population}
            areaAcres={areaAcres}
            loading={loadingPlans}
          />
        )}

        {activeTab === 'simulation' && (
          <FutureSimulationView
            basePopulation={population}
          />
        )}

        {activeTab === 'isro_hub' && (
          <ISROHubView
            onOpenCredentialsModal={() => setIsCredentialsOpen(true)}
            siteName={currentSite.name}
          />
        )}
      </main>

      {/* Slide-Over TerraAdvisor AI Drawer */}
      <TerraAdvisorDrawer
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        siteName={currentSite.name}
        population={population}
        areaAcres={areaAcres}
        currentPlanCode={activePlan?.plan_code || 'PLAN_A'}
      />

      {/* Full Executive Feasibility Report Modal */}
      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        siteId={selectedSiteId}
        population={population}
        areaAcres={areaAcres}
        activePlan={activePlan}
      />

      {/* ISRO Portal Credentials Modal */}
      <CredentialsModal
        isOpen={isCredentialsOpen}
        onClose={() => setIsCredentialsOpen(false)}
        onUpdated={() => getISROStatus()}
      />

      {/* Edit Zone Modal */}
      <EditZoneModal
        zone={editingZone}
        onClose={() => setEditingZone(null)}
        onSave={handleEditZoneSave}
      />
    </div>
  );
};
