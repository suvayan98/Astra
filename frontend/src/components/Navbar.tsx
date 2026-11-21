import React from 'react';
import { 
  Globe2, 
  Satellite, 
  Bot, 
  FileText, 
  Layers, 
  MapPin, 
  Sliders, 
  Boxes,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { SampleSite } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedSite: SampleSite | null;
  sampleSites: SampleSite[];
  onSelectSite: (site: SampleSite) => void;
  onOpenAdvisor: () => void;
  onOpen3D: () => void;
  isAdvisorOpen: boolean;
  demoMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedSite,
  sampleSites,
  onSelectSite,
  onOpenAdvisor,
  onOpen3D,
  isAdvisorOpen,
  demoMode
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#0b1329] rounded-[10px] flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              TerraAI
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-semibold uppercase tracking-wider">
              ISRO Hub v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            AI-Powered Sustainable Smart City Planning & Geospatial Intelligence
          </p>
        </div>
      </div>

      {/* Candidate Site Selector */}
      <div className="hidden lg:flex items-center bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
        <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
        <span className="text-slate-400 mr-2 font-medium">AOI Site:</span>
        <select 
          className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[280px] truncate"
          value={selectedSite?.site_id || ''}
          onChange={(e) => {
            const found = sampleSites.find(s => s.site_id === e.target.value);
            if (found) onSelectSite(found);
          }}
        >
          {sampleSites.map(s => (
            <option key={s.site_id} value={s.site_id} className="bg-slate-900 text-slate-100">
              {s.name} ({s.area_acres} ac)
            </option>
          ))}
        </select>
      </div>

      {/* Target Telemetry */}
      <div className="hidden xl:flex items-center space-x-4 text-xs font-mono">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800/80 text-slate-300">
          <span className="text-slate-500">Area:</span>
          <span className="text-cyan-400 font-semibold">{selectedSite?.area_acres || 500} Acres</span>
          <span className="text-slate-500">/ 2.02 km²</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800/80 text-slate-300">
          <span className="text-slate-500">Target Pop:</span>
          <span className="text-emerald-400 font-semibold">{selectedSite?.proposed_population.toLocaleString() || '20,000'}</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
          <span>ISRO Calibrated</span>
        </div>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpen3D}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-600/40 transition flex items-center space-x-1.5 shadow-sm"
          title="Open Interactive 3D Digital Twin City Model"
        >
          <Boxes className="w-4 h-4 text-cyan-300" />
          <span className="hidden sm:inline">3D City Twin</span>
        </button>

        <button
          onClick={() => setCurrentTab('isro_hub')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1.5 ${
            currentTab === 'isro_hub' 
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-semibold shadow-md shadow-cyan-500/20' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Satellite className="w-4 h-4 text-orange-400" />
          <span className="hidden sm:inline">ISRO Hub</span>
        </button>

        <button
          onClick={onOpenAdvisor}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
            isAdvisorOpen 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30' 
              : 'bg-indigo-950/60 border border-indigo-700/60 text-indigo-200 hover:bg-indigo-900/60'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-300" />
          <span className="hidden sm:inline">TerraAdvisor</span>
        </button>
      </div>
    </header>
  );
};
