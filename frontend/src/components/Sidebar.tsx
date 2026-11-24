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
  Clock,
  Cpu,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bot,
  Satellite
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
    description: 'Welcome hub, platform features and ISRO satellite integration'
  },
  {
    id: 'map',
    label: 'GIS Map & Zoning',
    shortLabel: 'GIS Map',
    category: 'workspace',
    icon: Layers,
    description: 'Interactive Leaflet GIS with 8 satellite and thematic layers'
  },
  {
    id: 'master_plan',
    label: 'Master Plan Designer',
    shortLabel: 'Master Plan',
    category: 'workspace',
    icon: Compass,
    badge: 'Plans',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    description: 'Multi-layout zoning (Plans A/B/C) with FAR balancing'
  },
  {
    id: 'suitability',
    label: 'Site Suitability (AHP)',
    shortLabel: 'Suitability',
    category: 'intelligence',
    icon: Compass,
    description: '12-factor Analytical Hierarchy Process and exclusion zones'
  },
  {
    id: 'terrain_soil',
    label: 'Terrain & Soil Geotech',
    shortLabel: 'Terrain & Soil',
    category: 'intelligence',
    icon: Globe2,
    description: 'Elevation DEM, slope grading, ICAR soil texture'
  },
  {
    id: 'water',
    label: 'Water & CGWB Hydrology',
    shortLabel: 'Water Hydrology',
    category: 'intelligence',
    icon: Droplets,
    description: 'CPHEEO LPCD demand, CGWB groundwater balance and DEWATS'
  },
  {
    id: 'climate',
    label: 'Climate & Hazard Risk',
    shortLabel: 'Climate Risk',
    category: 'intelligence',
    icon: ShieldAlert,
    description: '50-yr extreme storm return, flood buffers and heat resilience'
  },
  {
    id: 'energy',
    label: 'Renewable Microgrid',
    shortLabel: 'Energy Grid',
    category: 'intelligence',
    icon: SunMedium,
    description: 'Solar GHI / Wind potential, 35-acre PV farm and 4h BESS'
  },
  {
    id: 'vegetation',
    label: 'Green City & Miyawaki',
    shortLabel: 'Green Planner',
    category: 'intelligence',
    icon: Trees,
    description: 'VEDAS NDVI canopy indexing and Miyawaki afforestation'
  },
  {
    id: 'simulation',
    label: 'Future Simulation',
    shortLabel: 'Simulation',
    category: 'future',
    icon: Clock,
    badge: '100-yr',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    description: 'Decadal multi-parameter forecast: population, water, grid load'
  },
  {
    id: 'isro_hub',
    label: 'ISRO Space Data Hub',
    shortLabel: 'ISRO Hub',
    category: 'future',
    icon: Cpu,
    badge: 'ISRO',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    description: 'Bhoonidhi STAC, Bhuvan WMS, MOSDAC and VEDAS feeds'
  },
  {
    id: 'reports',
    label: 'Feasibility Report',
    shortLabel: 'Reports',
    category: 'future',
    icon: FileText,
    badge: 'PDF',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    description: 'Executive PDF export, GeoJSON zones and URDPFI dossier'
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
    { key: 'overview', label: 'Overview' },
    { key: 'workspace', label: 'Planning studio' },
    { key: 'intelligence', label: 'Intelligence suite' },
    { key: 'future', label: 'Forecasting & space' }
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col bg-[#101113] border-r border-[#282A2E] transition-all duration-150 ease-in-out select-none ${
        isCollapsed ? 'w-[64px]' : 'w-[260px]'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-[#282A2E] bg-[#16171A]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-[#242529] border border-[#2E3035] flex items-center justify-center text-zinc-300 shrink-0">
              <Satellite className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
            <div className="truncate">
              <span className="font-display font-medium text-xs text-zinc-200 block truncate">
                TerraAI Suite
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block truncate">
                12 modules
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto">
            <div className="w-7 h-7 rounded-md bg-[#242529] border border-[#2E3035] flex items-center justify-center text-zinc-300">
              <Satellite className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>
        )}

        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-[#242529] transition border border-transparent hover:border-[#282A2E] shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Navigation Modules List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-3">
        {categories.map((cat) => {
          const items = MODULE_ITEMS.filter((m) => m.category === cat.key);
          if (items.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-2 py-1 text-[10px] font-mono text-zinc-500">
                  {cat.label}
                </div>
              )}
              {isCollapsed && (
                <div className="w-full h-px bg-[#202225] my-2" />
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
                    className={`w-full group relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#242529] text-zinc-100 border border-zinc-700/60'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18191B] border border-transparent'
                    }`}
                  >
                    <div
                      className={`shrink-0 p-1 rounded-md transition-colors ${
                        isActive
                          ? 'text-zinc-100'
                          : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-1 text-[9px] font-mono px-1 py-0.2 rounded border bg-[#101113] text-zinc-500 border-[#282A2E] shrink-0">
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
          className="fixed left-[70px] z-50 w-56 p-2.5 bg-[#18191B] border border-[#282A2E] rounded-lg shadow-xl text-left pointer-events-none"
          style={{ top: `${tooltipPosition.top}px` }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-xs text-zinc-200">
              {hoveredModule.label}
            </span>
            {hoveredModule.badge && (
              <span className="text-[9px] font-mono px-1 py-0.2 rounded border bg-[#101113] text-zinc-400 border-[#202225]">
                {hoveredModule.badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {hoveredModule.description}
          </p>
        </div>
      )}

      {/* Sidebar Footer Controls */}
      <div className="p-2 border-t border-[#282A2E] bg-[#16171A] space-y-1.5">
        {/* Quick Launch TerraAdvisor */}
        {onOpenAdvisor && (
          <button
            onClick={onOpenAdvisor}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#18191B] hover:bg-[#222326] text-zinc-200 border border-[#282A2E] hover:border-zinc-600 transition-colors duration-150 cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Open TerraAdvisor planning assistant"
          >
            <Bot className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
            {!isCollapsed && <span>TerraAdvisor AI</span>}
          </button>
        )}

        {/* Space Connection Pill */}
        {!isCollapsed ? (
          <div
            onClick={onOpenIsroModal}
            className="flex items-center justify-between p-2 rounded-lg bg-[#18191B] border border-[#282A2E] text-[11px] text-zinc-400 hover:border-zinc-600 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-zinc-300 font-medium">ISRO Link</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-[#101113] px-1.5 py-0.5 rounded border border-[#202225]">
              Active (4)
            </span>
          </div>
        ) : (
          <div
            onClick={onOpenIsroModal}
            className="flex justify-center p-2 rounded-lg bg-[#18191B] border border-[#282A2E] hover:border-zinc-600 cursor-pointer"
            title="ISRO Space Hub: 4 portals connected"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
