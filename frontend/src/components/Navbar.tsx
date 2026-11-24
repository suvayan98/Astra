import React from 'react';
import {
  Globe2, ShieldCheck, Cpu, FileText, Bot, Layers,
  Compass, Droplets, SunMedium, Trees, BarChart3, Clock, Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  presetSites: any[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  population: number;
  setPopulation: (pop: number) => void;
  areaAcres: number;
  isroConnected: boolean;
  onOpenAdvisor: () => void;
  onOpenReport: () => void;
  onOpenIsroModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  presetSites,
  selectedSiteId,
  onSelectSite,
  population,
  setPopulation,
  areaAcres,
  isroConnected,
  onOpenAdvisor,
  onOpenReport,
  onOpenIsroModal
}) => {
  const tabs = [
    { id: 'map', label: 'GIS Map & Zoning', icon: Layers },
    { id: 'suitability', label: 'Site Suitability', icon: Compass },
    { id: 'terrain_soil', label: 'Terrain & Soil', icon: Globe2 },
    { id: 'water', label: 'Water & CGWB', icon: Droplets },
    { id: 'climate', label: 'Climate & Hazards', icon: ShieldCheck },
    { id: 'energy', label: 'Renewable Energy', icon: SunMedium },
    { id: 'vegetation', label: 'Green City Planner', icon: Trees },
    { id: 'master_plan', label: 'AI Master Plan Designer', icon: Sparkles, highlight: true },
    { id: 'simulation', label: 'Future Simulation', icon: Clock },
    { id: 'isro_hub', label: 'ISRO Space Data Hub', icon: Cpu, badge: 'ASTRA' },
  ];

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Banner */}
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-emerald-400 bg-clip-text text-transparent">
                TerraAI
              </h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
                v1.0 • Geospatial Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI-Powered Sustainable Smart City Planning Platform
            </p>
          </div>
        </div>

        {/* Global Planning Controls */}
        <div className="flex items-center flex-wrap gap-3 text-xs">
          {/* Site Selector */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 gap-2">
            <span className="text-slate-400 font-medium">Site:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => onSelectSite(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {presetSites.map((site) => (
                <option key={site.id} value={site.id} className="bg-slate-900 text-slate-100">
                  {site.name} ({site.state})
                </option>
              ))}
            </select>
          </div>

          {/* Area & Population Metric Badges */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">Boundary:</span>
            <span className="text-emerald-400 font-bold">{areaAcres} Acres</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{(areaAcres * 0.00404686).toFixed(2)} km²</span>
          </div>

          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 gap-2">
            <span className="text-slate-400 font-medium">Target Pop:</span>
            <input
              type="number"
              step="1000"
              min="2000"
              max="200000"
              value={population}
              onChange={(e) => setPopulation(Number(e.target.value))}
              className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* ISRO Space Hub Status Button */}
          <button
            onClick={onOpenIsroModal}
            className="flex items-center gap-2 bg-[#18191B] border border-[#282A2E] hover:border-zinc-600 px-3 py-1.5 rounded-lg text-zinc-300 font-medium transition cursor-pointer"
            title="Configure ISRO Space Portals (Bhoonidhi, Bhuvan, MOSDAC, VEDAS)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>ISRO Space Hub</span>
            <span className="text-[10px] bg-[#101113] text-zinc-400 px-1.5 py-0.2 rounded font-mono border border-[#202225]">
              Active
            </span>
          </button>

          {/* AI Advisor Button */}
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-cyan-600/25 transition cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>TerraAdvisor AI</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Report</span>
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="max-w-[1700px] mx-auto px-4 overflow-x-auto scrollbar-none flex gap-1 border-t border-slate-800/60 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? tab.highlight
                    ? 'bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/40 font-semibold'
                    : 'bg-slate-800 text-cyan-300 border border-slate-700 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
