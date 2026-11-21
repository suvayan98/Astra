import React, { useState } from 'react';
import {
  Home,
  Layers,
  Compass,
  Globe2,
  Droplets,
  ShieldAlert,
  SunMedium,
  Trees,
  Sparkles,
  Clock,
  Cpu,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bot,
  Satellite,
  HelpCircle
} from 'lucide-react';

export interface ModuleItem {
  id: string;
  label: string;
  shortLabel: string;
  category: 'overview' | 'workspace' | 'intelligence' | 'future';
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  description: string;
}

export const MODULE_ITEMS: ModuleItem[] = [
  {
    id: 'landing',
    label: 'Platform Overview',
    shortLabel: 'Overview',
    category: 'overview',
    icon: Home,
    description: 'Welcome hub, platform features & ISRO satellite data integration'
  },
  {
    id: 'map',
    label: 'GIS Map & Zoning',
    shortLabel: 'GIS Map',
    category: 'workspace',
    icon: Layers,
    description: 'Interactive Leaflet GIS with 8 satellite & thematic layers'
  },
  {
    id: 'master_plan',
    label: 'AI Master Plan Designer',
    shortLabel: 'Master Plan',
    category: 'workspace',
    icon: Sparkles,
    badge: 'AI GEN',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Multi-layout generative zoning (Plans A/B/C) with FAR balancing'
  },
  {
    id: 'suitability',
    label: 'Site Suitability (AHP)',
    shortLabel: 'Suitability',
    category: 'intelligence',
    icon: Compass,
    description: '12-factor Analytical Hierarchy Process & exclusion zone analysis'
  },
  {
    id: 'terrain_soil',
    label: 'Terrain & Soil Geotech',
    shortLabel: 'Terrain & Soil',
    category: 'intelligence',
    icon: Globe2,
    description: 'Elevation DEM, slope grading, ICAR soil texture triangle'
  },
  {
    id: 'water',
    label: 'Water & CGWB Hydrology',
    shortLabel: 'Water Hydrology',
    category: 'intelligence',
    icon: Droplets,
    description: 'CPHEEO LPCD demand, CGWB groundwater balance & DEWATS'
  },
  {
    id: 'climate',
    label: 'Climate & Hazard Risk',
    shortLabel: 'Climate Risk',
    category: 'intelligence',
    icon: ShieldAlert,
    description: '50-yr extreme storm return, flood buffers & heatwave resilience'
  },
  {
    id: 'energy',
    label: 'Renewable Microgrid',
    shortLabel: 'Energy Grid',
    category: 'intelligence',
    icon: SunMedium,
    description: 'Solar GHI / Wind potential, 35-acre PV farm & 4h BESS storage'
  },
  {
    id: 'vegetation',
    label: 'Green City & Miyawaki',
    shortLabel: 'Green Planner',
    category: 'intelligence',
    icon: Trees,
    description: 'VEDAS NDVI canopy indexing & indigenous Miyawaki afforestation'
  },
  {
    id: 'simulation',
    label: 'Future Simulation (100-Yr)',
    shortLabel: 'Simulation',
    category: 'future',
    icon: Clock,
    badge: '100-YR',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Decadal multi-parameter forecast: population, water, grid load'
  },
  {
    id: 'isro_hub',
    label: 'ISRO Space Data Hub',
    shortLabel: 'ISRO Hub',
    category: 'future',
    icon: Cpu,
    badge: 'ASTRA',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    description: 'Bhoonidhi STAC, Bhuvan WMS, MOSDAC & VEDAS satellite feeds'
  },
  {
    id: 'reports',
    label: 'Feasibility Report & Dossier',
    shortLabel: 'Reports',
    category: 'future',
    icon: FileText,
    badge: 'PDF',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Executive PDF export, GeoJSON zones & URDPFI compliance dossier'
  }
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAdvisor?: () => void;
  onOpenReport?: () => void;
  onOpenIsroModal?: () => void;
  siteName?: string;
  areaAcres?: number;
  population?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed: controlledCollapsed,
  onToggleCollapse: controlledToggleCollapse,
  onOpenAdvisor,
  onOpenReport,
  onOpenIsroModal,
  siteName = 'Dholera Greenfield Site',
  areaAcres = 500,
  population = 20000
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);
  const [hoveredModule, setHoveredModule] = useState<ModuleItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number } | null>(null);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = () => {
    if (controlledToggleCollapse) {
      controlledToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const handleMouseEnter = (item: ModuleItem, event: React.MouseEvent<HTMLButtonElement>) => {
    if (isCollapsed) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ top: rect.top });
      setHoveredModule(item);
    }
  };

  const handleMouseLeave = () => {
    setHoveredModule(null);
    setTooltipPosition(null);
  };

  const handleItemClick = (item: ModuleItem) => {
    if (item.id === 'reports') {
      if (onOpenReport) {
        onOpenReport();
      } else {
        setActiveTab('reports');
      }
    } else {
      setActiveTab(item.id);
    }
  };

  const categories = [
    { key: 'overview', label: 'Platform Hub' },
    { key: 'workspace', label: 'Core Planning Studio' },
    { key: 'intelligence', label: 'Geospatial Intelligence' },
    { key: 'future', label: 'Forecasting & Space' }
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col bg-[#07111F] border-r border-[#1E2D42] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[70px]' : 'w-[280px]'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#1E2D42]/80 bg-[#0D1928]/60">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#22D3EE] via-indigo-600 to-[#34D399] p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#07111F] rounded-[6px] flex items-center justify-center">
                <Satellite className="w-4 h-4 text-[#22D3EE] animate-pulse" />
              </div>
            </div>
            <div className="truncate">
              <span className="font-display font-bold text-sm tracking-wide text-white block truncate">
                TerraAI Suite
              </span>
              <span className="text-[10px] text-[#94A3B8] font-mono block truncate">
                12 Planning Modules
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#22D3EE] to-[#34D399] p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-[#07111F] rounded-[6px] flex items-center justify-center">
                <Satellite className="w-4 h-4 text-[#22D3EE]" />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#17283A] transition border border-transparent hover:border-[#1E2D42] shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Modules List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {categories.map((cat) => {
          const items = MODULE_ITEMS.filter((m) => m.category === cat.key);
          if (items.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]/70 font-mono">
                  {cat.label}
                </div>
              )}
              {isCollapsed && (
                <div className="w-full h-px bg-[#1E2D42]/60 my-2" />
              )}

              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={(e) => handleMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                    className={`w-full group relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#17283A] to-[#111F30] text-white shadow-md border border-[#22D3EE]/40'
                        : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#111F30]/80 border border-transparent'
                    }`}
                  >
                    {/* Active highlight indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#22D3EE] rounded-r-full shadow-sm shadow-[#22D3EE]" />
                    )}

                    <div
                      className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#22D3EE]/20 text-[#22D3EE]'
                          : 'bg-[#0D1928] text-[#94A3B8] group-hover:text-[#22D3EE] group-hover:bg-[#17283A]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                        <span className="truncate font-medium">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`ml-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                              item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Floating Hover Tooltip for Collapsed Mode */}
      {isCollapsed && hoveredModule && tooltipPosition && (
        <div
          className="fixed left-[76px] z-50 w-64 p-3 bg-[#111F30] border border-[#22D3EE]/30 rounded-xl shadow-2xl text-left pointer-events-none transform -translate-y-2 animate-in fade-in zoom-in-95 duration-150"
          style={{ top: `${tooltipPosition.top}px` }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-display font-bold text-xs text-white">
              {hoveredModule.label}
            </span>
            {hoveredModule.badge && (
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  hoveredModule.badgeColor || 'bg-slate-800 text-slate-300'
                }`}
              >
                {hoveredModule.badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            {hoveredModule.description}
          </p>
        </div>
      )}

      {/* Sidebar Footer Controls */}
      <div className="p-2.5 border-t border-[#1E2D42] bg-[#0D1928]/90 space-y-2">
        {/* Quick Launch TerraAdvisor */}
        {onOpenAdvisor && (
          <button
            onClick={onOpenAdvisor}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Open TerraAdvisor AI Assistant"
          >
            <Bot className="w-4 h-4 text-cyan-200 shrink-0" />
            {!isCollapsed && <span>TerraAdvisor AI</span>}
          </button>
        )}

        {/* Space Connection Pill */}
        {!isCollapsed ? (
          <div
            onClick={onOpenIsroModal}
            className="flex items-center justify-between p-2 rounded-lg bg-[#07111F] border border-[#1E2D42] text-[11px] text-[#94A3B8] hover:border-[#22D3EE]/40 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34D399]"></span>
              </span>
              <span className="font-mono text-[#F1F5F9] font-medium">ISRO Link</span>
            </div>
            <span className="text-[10px] font-mono text-[#34D399] bg-[#34D399]/10 px-1.5 py-0.5 rounded border border-[#34D399]/30">
              LIVE (4)
            </span>
          </div>
        ) : (
          <div
            onClick={onOpenIsroModal}
            className="flex justify-center p-2 rounded-lg bg-[#07111F] border border-[#1E2D42] hover:border-[#22D3EE]/40 cursor-pointer"
            title="ISRO Space Hub: Live (4 Portals Connected)"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34D399]"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
