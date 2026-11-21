import React from 'react';
import {
  MapPin,
  FolderOpen,
  Users,
  Calendar,
  SlidersHorizontal,
  Compass,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
  Droplets,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  Region,
  RegionId,
  PriorityPreset,
  ScenarioPreset,
  CandidateSite,
} from '../types';

interface LeftPanelProps {
  regions: Region[];
  selectedRegionId: RegionId;
  onSelectRegion: (id: RegionId) => void;
  candidateSites: CandidateSite[];
  onLoadCandidateSites: () => void;
  targetPopulation: number;
  onChangeTargetPopulation: (pop: number) => void;
  horizon: 2035 | 2050;
  onChangeHorizon: (h: 2035 | 2050) => void;
  priorityPreset: PriorityPreset;
  onChangePriorityPreset: (p: PriorityPreset) => void;
  scenarioPreset: ScenarioPreset;
  onChangeScenarioPreset: (s: ScenarioPreset) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  candidateSites,
  onLoadCandidateSites,
  targetPopulation,
  onChangeTargetPopulation,
  horizon,
  onChangeHorizon,
  priorityPreset,
  onChangePriorityPreset,
  scenarioPreset,
  onChangeScenarioPreset,
  onRunAnalysis,
  isAnalyzing,
}) => {
  const currentRegion = regions.find((r) => r.id === selectedRegionId) || regions[0];
  const waterDemandMLD = ((targetPopulation * 135) / 1000000).toFixed(1);

  return (
    <aside className="left-panel no-print w-80 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto z-20 shadow-xs">
      <div className="p-5 space-y-4">
        {/* 1. Target Region Selector */}
        <div>
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Region</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold">2 DEMO REGIONS</span>
          </label>
          <div className="space-y-2">
            {regions.map((region) => {
              const isSelected = region.id === selectedRegionId;
              return (
                <button
                  key={region.id}
                  onClick={() => onSelectRegion(region.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-2 border-blue-600 shadow-xs'
                      : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-900 font-extrabold' : 'text-slate-800'}`}>
                      {region.name}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{region.badge}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Candidate Parcels Card */}
        <div className="bg-slate-50/80 p-3.5 rounded-3xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Candidate Parcels</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-white text-slate-700 rounded-full font-bold border border-slate-200">
              {candidateSites.length}/3 Sites
            </span>
          </div>

          <button
            onClick={onLoadCandidateSites}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Reset Demo Sites (A, B, C)</span>
          </button>

          {/* Quick list of sites */}
          <div className="space-y-1.5 pt-1">
            {candidateSites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between text-xs px-3 py-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs gap-2"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-2xs shrink-0"
                    style={{ backgroundColor: site.color }}
                  ></span>
                  <span className="font-extrabold text-slate-800 shrink-0">Site {site.code}</span>
                  <span className="text-[11px] text-slate-500 truncate" title={site.name}>
                    {site.name.split('(')[0].trim()}
                  </span>
                </div>
                <span className="text-[11px] text-slate-700 font-bold shrink-0">{site.areaKm2} km²</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Target Population & Water Demand Card */}
        <div className="bg-sky-50/80 p-4 rounded-3xl border border-sky-100 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Population</span>
            </label>
            <span className="text-xs font-extrabold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
              {targetPopulation.toLocaleString()} cap
            </span>
          </div>

          <input
            type="range"
            min={100000}
            max={1000000}
            step={25000}
            value={targetPopulation}
            onChange={(e) => onChangeTargetPopulation(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-sky-200/50 font-medium">
            <span className="flex items-center gap-1 text-blue-700 font-bold">
              <Droplets className="w-3 h-3 text-blue-600" />
              <span>{waterDemandMLD} MLD</span>
            </span>
            <span className="text-[10px] text-slate-400">135 lpcd standard</span>
          </div>
        </div>

        {/* 4. Planning Horizon Selector Pills */}
        <div>
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Planning Horizon</span>
          </label>
          <div className="bg-slate-100 p-1 rounded-full border border-slate-200 grid grid-cols-2 gap-1">
            {[2035, 2050].map((yr) => {
              const isSelected = horizon === yr;
              return (
                <button
                  key={yr}
                  onClick={() => onChangeHorizon(yr as 2035 | 2050)}
                  className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  Horizon {yr}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Priority Weight Presets */}
        <div>
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pillar Weight Preset</span>
          </label>
          <div className="space-y-1.5">
            {[
              {
                id: 'balanced' as PriorityPreset,
                name: 'Balanced Masterplan',
                weights: 'Terrain 20 • Water 25 • Hazard 30 • Env 10 • Infra 15',
              },
              {
                id: 'climate_resilient' as PriorityPreset,
                name: 'Climate-Resilient',
                weights: 'Terrain 10 • Water 30 • Hazard 40 • Env 10 • Infra 10',
              },
              {
                id: 'infra_first' as PriorityPreset,
                name: 'Infra-First Growth',
                weights: 'Terrain 25 • Water 15 • Hazard 20 • Env 10 • Infra 30',
              },
            ].map((preset) => {
              const isSelected = priorityPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onChangePriorityPreset(preset.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-2 border-blue-600 text-blue-950 font-bold shadow-2xs'
                      : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{preset.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium font-mono mt-0.5">{preset.weights}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Scenario Preset Selector */}
        <div>
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-700">
            <Compass className="w-3.5 h-3.5 text-purple-600" />
            <span>Climate / Growth Scenario</span>
          </label>
          <div className="space-y-1.5">
            {[
              {
                id: 'baseline' as ScenarioPreset,
                name: 'SSP2-4.5 (Baseline)',
                badge: 'Normal monsoons • Target CAGR',
              },
              {
                id: 'high_growth_climate_stressed' as ScenarioPreset,
                name: 'SSP5-8.5 (Stressed)',
                badge: '+12% demand • 2-yr dry spell drought',
              },
              {
                id: 'green_transition' as ScenarioPreset,
                name: 'Green Transition',
                badge: '18% circular water reuse mandate',
              },
            ].map((scen) => {
              const isSelected = scenarioPreset === scen.id;
              return (
                <button
                  key={scen.id}
                  onClick={() => onChangeScenarioPreset(scen.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50 border-2 border-purple-600 text-purple-950 font-extrabold shadow-2xs'
                      : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{scen.name}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600"></span>}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">{scen.badge}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Primary Analyse Action Button (Bold Pill Button) */}
        <div className="pt-2">
          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Extracting Satellite Grids...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Spatial Screening</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
