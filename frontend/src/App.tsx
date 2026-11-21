import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LeftPanel } from './components/LeftPanel';
import { MapView } from './components/MapView';
import { RightPanel, RightPanelTab } from './components/RightPanel';
import { AssumptionsDrawer } from './components/AssumptionsDrawer';
import {
  Region,
  RegionId,
  PriorityPreset,
  ScenarioPreset,
  CandidateSite,
  SiteScorecard,
  CompareResult,
  StressTestResponse,
  ProvenanceRecord,
  Assumptions,
  LayerOverlay,
} from './types';
import {
  DEMO_REGIONS,
  DEFAULT_ASSUMPTIONS,
  PROVENANCE_RECORDS,
  LAYER_OVERLAYS,
  generateSiteScorecard,
  generateCompareResult,
  generateStressTest,
} from './data/mockData';
import { ApiClient, HealthStatus } from './lib/api';

export function App() {
  // 1. Core State
  const [regions, setRegions] = useState<Region[]>(DEMO_REGIONS);
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>('up_jewar');
  const currentRegion = regions.find((r) => r.id === selectedRegionId) || regions[0];

  const [candidateSites, setCandidateSites] = useState<CandidateSite[]>(currentRegion.candidateSites);
  const [selectedSiteCode, setSelectedSiteCode] = useState<'A' | 'B' | 'C'>('A');

  const [targetPopulation, setTargetPopulation] = useState<number>(450000);
  const [horizon, setHorizon] = useState<2035 | 2050>(2050);
  const [priorityPreset, setPriorityPreset] = useState<PriorityPreset>('balanced');
  const [scenarioPreset, setScenarioPreset] = useState<ScenarioPreset>('baseline');
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);

  const [layerOverlays, setLayerOverlays] = useState<LayerOverlay[]>(LAYER_OVERLAYS);
  const [activeTab, setActiveTab] = useState<RightPanelTab>('scorecard');
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Health and connection state
  const [health, setHealth] = useState<HealthStatus>({
    status: 'healthy',
    mode: 'offline_fixtures',
    version: '1.0.0',
    fourPortalsConnected: true,
  });

  // Analysis results
  const [scorecards, setScorecards] = useState<Record<string, SiteScorecard>>({});
  const [compareResult, setCompareResult] = useState<CompareResult>(() =>
    generateCompareResult('up_jewar', 'balanced', 'baseline', DEFAULT_ASSUMPTIONS)
  );
  const [stressTestResult, setStressTestResult] = useState<StressTestResponse>(() =>
    generateStressTest('site_a', 'up_jewar', 2050, 450000, 'baseline', DEFAULT_ASSUMPTIONS)
  );
  const [provenanceRecords, setProvenanceRecords] = useState<ProvenanceRecord[]>(PROVENANCE_RECORDS);

  // Check API health on load
  useEffect(() => {
    ApiClient.checkHealth().then((status) => {
      setHealth(status);
    });
  }, []);

  // Recalculate analysis
  const executeAnalysis = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      // Analyze all 3 candidate sites
      const cardA = await ApiClient.analyzeSite(selectedRegionId, 'A', priorityPreset, assumptions);
      const cardB = await ApiClient.analyzeSite(selectedRegionId, 'B', priorityPreset, assumptions);
      const cardC = await ApiClient.analyzeSite(selectedRegionId, 'C', priorityPreset, assumptions);

      const newScorecards: Record<string, SiteScorecard> = {
        [candidateSites.find((s) => s.code === 'A')?.id || 'site_a']: cardA,
        [candidateSites.find((s) => s.code === 'B')?.id || 'site_b']: cardB,
        [candidateSites.find((s) => s.code === 'C')?.id || 'site_c']: cardC,
      };

      setScorecards(newScorecards);

      // Multi-site comparison
      const comp = await ApiClient.compareSites(selectedRegionId, priorityPreset, scenarioPreset, assumptions);
      setCompareResult(comp);

      // Water balance stress test for active site
      const activeSiteId = candidateSites.find((s) => s.code === selectedSiteCode)?.id || 'site_a';
      const stress = await ApiClient.runStressTest(
        activeSiteId,
        selectedRegionId,
        horizon,
        targetPopulation,
        scenarioPreset,
        assumptions
      );
      setStressTestResult(stress);
    } catch (err) {
      console.error('Analysis execution error:', err);
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 300);
    }
  }, [
    selectedRegionId,
    candidateSites,
    selectedSiteCode,
    priorityPreset,
    scenarioPreset,
    assumptions,
    targetPopulation,
    horizon,
  ]);

  // Run analysis when parameters change
  useEffect(() => {
    executeAnalysis();
  }, [selectedRegionId, priorityPreset, scenarioPreset, horizon, targetPopulation, assumptions]);

  // Handle region switch
  const handleSelectRegion = (regionId: RegionId) => {
    if (regionId === selectedRegionId) return;
    setSelectedRegionId(regionId);
    const newReg = regions.find((r) => r.id === regionId);
    if (newReg) {
      setCandidateSites(newReg.candidateSites);
      setSelectedSiteCode('A');
    }
  };

  // 1-Click Load Preset Sites
  const handleLoadPresetSites = () => {
    const reg = regions.find((r) => r.id === selectedRegionId);
    if (reg) {
      setCandidateSites(reg.candidateSites);
      setSelectedSiteCode('A');
      executeAnalysis();
    }
  };

  // Toggle Layer Overlay Visibility
  const handleToggleLayer = (layerId: LayerOverlay['id']) => {
    setLayerOverlays((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
  };

  return (
    <div className="app-container flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentRegion={currentRegion}
        priorityPreset={priorityPreset}
        scenarioPreset={scenarioPreset}
        health={health}
        onOpenAssumptions={() => setIsAssumptionsOpen(true)}
        onOpenReport={() => setActiveTab('report')}
      />

      {/* Main 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Column: Parameter & Scenario Controls */}
        <LeftPanel
          regions={regions}
          selectedRegionId={selectedRegionId}
          onSelectRegion={handleSelectRegion}
          candidateSites={candidateSites}
          onLoadCandidateSites={handleLoadPresetSites}
          targetPopulation={targetPopulation}
          onChangeTargetPopulation={setTargetPopulation}
          horizon={horizon}
          onChangeHorizon={setHorizon}
          priorityPreset={priorityPreset}
          onChangePriorityPreset={setPriorityPreset}
          scenarioPreset={scenarioPreset}
          onChangeScenarioPreset={setScenarioPreset}
          onRunAnalysis={executeAnalysis}
          isAnalyzing={isAnalyzing}
        />

        {/* Center Canvas: Leaflet Map with Geoman Drawing & Overlays */}
        <main className="map-container flex-1 h-full relative overflow-hidden">
          <MapView
            currentRegion={currentRegion}
            candidateSites={candidateSites}
            onUpdateCandidateSites={setCandidateSites}
            selectedSiteCode={selectedSiteCode}
            onSelectSiteCode={setSelectedSiteCode}
            scorecards={scorecards}
            layerOverlays={layerOverlays}
            onToggleLayer={handleToggleLayer}
          />
        </main>

        {/* Right Column: 5 Tabbed Panes (Scorecard, Compare, Stress Test, Sources, Report) */}
        <RightPanel
          currentRegion={currentRegion}
          candidateSites={candidateSites}
          selectedSiteCode={selectedSiteCode}
          onSelectSiteCode={setSelectedSiteCode}
          scorecards={scorecards}
          compareResult={compareResult}
          stressTestResult={stressTestResult}
          provenanceRecords={provenanceRecords}
          priorityPreset={priorityPreset}
          scenarioPreset={scenarioPreset}
          targetPopulation={targetPopulation}
          horizon={horizon}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      </div>

      {/* Slide-over Assumptions & Coefficients Drawer */}
      <AssumptionsDrawer
        isOpen={isAssumptionsOpen}
        onClose={() => setIsAssumptionsOpen(false)}
        assumptions={assumptions}
        onUpdateAssumptions={setAssumptions}
      />
    </div>
  );
}

export default App;
