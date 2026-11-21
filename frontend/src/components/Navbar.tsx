import React, { useState } from 'react';
import {
  Satellite,
  Sliders,
  Printer,
  ShieldCheck,
  MapPin,
  Sparkles,
  Layers,
  Server,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Region, PriorityPreset, ScenarioPreset } from '../types';
import { HealthStatus, getApiBase } from '../lib/api';

interface NavbarProps {
  currentRegion: Region;
  priorityPreset: PriorityPreset;
  scenarioPreset: ScenarioPreset;
  health: HealthStatus;
  onOpenAssumptions: () => void;
  onOpenReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRegion,
  priorityPreset,
  scenarioPreset,
  health,
  onOpenAssumptions,
  onOpenReport,
}) => {
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => {
    return localStorage.getItem('TERRA_API_BASE') || '';
  });

  const getPresetLabel = (preset: PriorityPreset) => {
    switch (preset) {
      case 'balanced':
        return 'Balanced';
      case 'climate_resilient':
        return 'Climate-Resilient';
      case 'infra_first':
        return 'Infra-First';
    }
  };

  const getScenarioLabel = (scenario: ScenarioPreset) => {
    switch (scenario) {
      case 'baseline':
        return 'SSP2-4.5 (Baseline)';
      case 'high_growth_climate_stressed':
        return 'SSP5-8.5 (Stressed)';
      case 'green_transition':
        return 'Green Transition';
    }
  };

  const handleSaveApiUrl = () => {
    if (customApiUrl.trim()) {
      localStorage.setItem('TERRA_API_BASE', customApiUrl.trim());
    } else {
      localStorage.removeItem('TERRA_API_BASE');
    }
    window.location.reload();
  };

  return (
    <>
      <header className="no-print h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 flex items-center justify-between z-30 shrink-0 sticky top-0 shadow-sm">
        {/* Brand & Mission Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Satellite className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                <span>TerraCity</span>
                <span className="text-blue-600">AI</span>
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200 shadow-xs">
                ISRO 4-PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-none mt-0.5">
              Greenfield Urban Site Screening & Resilience Engine
            </p>
          </div>
        </div>

        {/* Center Floating Pill Group (Context Indicators) */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80 text-xs shadow-xs">
          {/* Active Region Pill */}
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-white rounded-full text-slate-800 font-semibold shadow-xs border border-slate-200/50">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{currentRegion.name.split(' ')[0]}</span>
            <span className="text-slate-400 font-normal text-[11px]">({currentRegion.state.split(' ')[0]})</span>
          </div>

          {/* Priority Preset */}
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-slate-600 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-slate-400">Weight:</span>
            <span className="font-semibold text-slate-800">{getPresetLabel(priorityPreset)}</span>
          </div>

          {/* Scenario */}
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-slate-600 font-medium">
            <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-slate-400">Climate:</span>
            <span className="font-semibold text-slate-800">{getScenarioLabel(scenarioPreset)}</span>
          </div>

          {/* Backend Connection Status Pill */}
          <button
            onClick={() => setShowBackendModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-medium shadow-xs transition-all cursor-pointer"
            title="Click to view or connect live cloud backend"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health.mode === 'live_backend' ? 'bg-emerald-500' : 'bg-amber-500'
              } animate-pulse`}
            ></span>
            <span>{health.mode === 'live_backend' ? 'Live Cloud' : 'Calibrated Cache'}</span>
            <Server className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Assumptions Drawer Trigger */}
          <button
            onClick={onOpenAssumptions}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Inspect and edit simulation assumptions"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Assumptions</span>
          </button>

          {/* Report / Print Button (Inspired by the Data Management pill in screenshot) */}
          <button
            onClick={onOpenReport}
            className="flex items-center space-x-2 px-5 py-2 text-xs font-bold bg-lime-100 hover:bg-lime-200 text-lime-900 border border-lime-300 rounded-full transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Open printable executive report & GeoJSON export"
          >
            <FileSpreadsheet className="w-4 h-4 text-lime-800" />
            <span>Executive Dossier</span>
          </button>
        </div>
      </header>

      {/* Backend Connection Modal */}
      {showBackendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Backend Configuration</h3>
              </div>
              <button
                onClick={() => setShowBackendModal(false)}
                className="text-slate-400 hover:text-slate-700 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 space-y-1">
                <div className="text-slate-500 font-semibold">Active Backend Mode:</div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      health.mode === 'live_backend' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  ></span>
                  <span className="font-bold text-slate-900 capitalize text-sm">
                    {health.mode === 'live_backend'
                      ? 'Live Cloud / Local Backend'
                      : 'Offline Calibrated Spatial Fixtures'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Active Endpoint: <code className="text-blue-700 font-semibold">{getApiBase()}</code>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Custom Live Backend URL (Render / Railway / Localhost):
                </label>
                <input
                  type="text"
                  placeholder="https://your-service.onrender.com/api"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Leave blank to auto-detect (<code className="text-slate-700">localhost:8000/api</code> or container origin).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowBackendModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiUrl}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md shadow-blue-500/20"
              >
                Apply & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
