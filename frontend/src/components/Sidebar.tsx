import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Target, 
  Mountain, 
  Droplet, 
  CloudLightning, 
  SunMedium, 
  Trees, 
  Compass, 
  TrendingUp, 
  Satellite, 
  FileCheck2,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  siteScore?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, siteScore }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard, badge: null },
    { id: 'map', label: 'Interactive GIS Map', icon: Map, badge: 'Workspace' },
    { id: 'site_selection', label: 'TerraSite AI (Scoring)', icon: Target, badge: siteScore ? `${siteScore}/100` : null },
    { id: 'terrain_soil', label: 'Terrain & Soil AI', icon: Mountain, badge: null },
    { id: 'water', label: 'TerraWater AI (CGWB)', icon: Droplet, badge: null },
    { id: 'climate', label: 'Climate & Disaster AI', icon: CloudLightning, badge: null },
    { id: 'energy', label: 'TerraEnergy AI (Solar/Wind)', icon: SunMedium, badge: null },
    { id: 'vegetation', label: 'TerraVegetation AI (NDVI)', icon: Trees, badge: null },
    { id: 'master_plan', label: 'TerraCity Designer', icon: Compass, badge: 'Plan A/B/C' },
    { id: 'future_sim', label: 'TerraFuture AI (100yr)', icon: TrendingUp, badge: '10-100yr' },
    { id: 'isro_hub', label: 'ISRO Space Data Hub', icon: Satellite, badge: '4 Portals' },
    { id: 'reports', label: 'Appraisal Reports & Export', icon: FileCheck2, badge: null },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#080d19] flex flex-col h-[calc(100vh-4rem)] flex-shrink-0 select-none">
      <div className="p-3 border-b border-slate-800/80">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold px-2 mb-1">
          Geospatial Intelligence Engine
        </div>
        <div className="px-2 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-200">12 Multi-Factor Layers</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Online</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-300 border border-cyan-800/60 shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ml-1.5 ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="font-semibold text-slate-300">Indian Space Infrastructure</span>
          <span className="text-[10px] text-cyan-400">ISRO / NRSC</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Integrated with Bhoonidhi STAC, Bhuvan Thematic 50K, MOSDAC, & VEDAS temporal phenology.
        </p>
      </div>
    </aside>
  );
};
