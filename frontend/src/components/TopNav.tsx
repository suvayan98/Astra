import React, { useState, useEffect, useRef } from 'react';
import {
  Globe2,
  Search,
  Bell,
  Sun,
  Moon,
  Bot,
  FileText,
  Cpu,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  ExternalLink,
  User,
  Settings,
  Shield,
  Layers,
  Compass,
  Droplets,
  Trees,
  Clock,
  X,
  Menu
} from 'lucide-react';
import { MODULE_ITEMS, ModuleItem } from './Sidebar';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  presetSites: any[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  population: number;
  setPopulation: (pop: number) => void;
  areaAcres: number;
  isroConnected?: boolean;
  onOpenAdvisor?: () => void;
  onOpenReport?: () => void;
  onOpenIsroModal?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  presetSites,
  selectedSiteId,
  onSelectSite,
  population,
  setPopulation,
  areaAcres,
  isroConnected = true,
  onOpenAdvisor,
  onOpenReport,
  onOpenIsroModal,
  onToggleSidebar,
  isSidebarCollapsed
}) => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notifications state
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'ISRO Bhoonidhi STAC Sync',
      message: 'Sentinel-2 10m multispectral imagery updated for current coordinates.',
      time: '12m ago',
      type: 'success',
      read: false
    },
    {
      id: 'n2',
      title: 'CGWB Hydrology Assessment',
      message: 'Block extraction stage at 72.4% (Semi-Critical). RWH mitigation applied.',
      time: '45m ago',
      type: 'warning',
      read: false
    },
    {
      id: 'n3',
      title: 'AI Master Plan Generated',
      message: 'Plan A (Walkable TOD) generated with 42.4% green canopy reserve.',
      time: '1h ago',
      type: 'info',
      read: false
    }
  ]);

  // User Profile Dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Sync theme with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const allNavigableModules: ModuleItem[] = [
    ...MODULE_ITEMS,
    {
      id: 'advisor',
      label: 'TerraAdvisor AI Studio',
      shortLabel: 'AI Studio',
      category: 'workspace',
      icon: Bot,
      badge: 'AGENT',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Dedicated full-page AI planning assistant with grounded formulas and live inspector'
    }
  ];

  const filteredModules = searchQuery.trim()
    ? allNavigableModules.filter(
        (m) =>
          m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.shortLabel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectModuleFromSearch = (moduleId: string) => {
    setActiveTab(moduleId);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#07111F]/95 backdrop-blur-md border-b border-[#1E2D42] px-4 flex items-center justify-between gap-3 select-none transition-colors duration-200">
      {/* Left: Branding & Site Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Sidebar Hamburger Toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white bg-[#0D1928] hover:bg-[#111F30] border border-[#1E2D42] lg:hidden transition cursor-pointer"
            title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Brand Logo & Title */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Go to Platform Overview"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#22D3EE] via-indigo-600 to-[#34D399] p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#07111F] rounded-[10px] flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-[#22D3EE] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#22D3EE] via-[#60A5FA] to-[#34D399] bg-clip-text text-transparent">
                TerraAI
              </span>
              <span className="hidden sm:inline-flex text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
                v1.0
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-[#94A3B8] font-medium leading-none">
              AI-Powered Sustainable Urban Master-Planning
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block h-7 w-px bg-[#1E2D42]" />

        {/* Site Selector Dropdown */}
        <div className="relative flex items-center bg-[#0D1928] border border-[#1E2D42] hover:border-[#22D3EE]/40 rounded-xl px-3 py-1.5 gap-2 text-xs transition">
          <MapPin className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-[#94A3B8] uppercase font-mono font-bold leading-none">
              Planning Site
            </span>
            <select
              value={selectedSiteId}
              onChange={(e) => onSelectSite(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {presetSites && presetSites.length > 0 ? (
                presetSites.map((site) => (
                  <option key={site.id} value={site.id} className="bg-[#0D1928] text-white">
                    {site.name} ({site.state})
                  </option>
                ))
              ) : (
                <option value="site-dholera" className="bg-[#0D1928] text-white">
                  Dholera SIR Greenfield (Gujarat)
                </option>
              )}
            </select>
          </div>
          <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-2 pointer-events-none" />
        </div>

        {/* Quick Area / Population Metrics */}
        <div className="hidden xl:flex items-center gap-2 bg-[#0D1928] border border-[#1E2D42] rounded-xl px-3 py-1.5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[#94A3B8]">Area:</span>
            <span className="text-[#34D399] font-bold">{areaAcres} ac</span>
            <span className="text-[#94A3B8]/60">({(areaAcres * 0.00404686).toFixed(2)} km²)</span>
          </div>
          <span className="text-[#1E2D42]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#94A3B8]">Pop:</span>
            <input
              type="number"
              min="2000"
              max="500000"
              step="1000"
              value={population}
              onChange={(e) => setPopulation(Number(e.target.value))}
              className="w-16 bg-[#17283A] text-[#22D3EE] font-bold text-center rounded px-1 py-0.5 focus:outline-none border border-transparent focus:border-[#22D3EE]"
            />
          </div>
        </div>
      </div>

      {/* Middle: Quick Search Bar */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <div
          onClick={() => {
            setIsSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }}
          className="flex items-center justify-between w-full bg-[#0D1928] hover:bg-[#111F30] border border-[#1E2D42] hover:border-[#22D3EE]/40 rounded-xl px-3 py-1.5 text-xs text-[#94A3B8] transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Search modules, layers, zones, or data...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono bg-[#17283A] text-[#94A3B8] px-1.5 py-0.5 rounded border border-[#1E2D42]">
            Ctrl K
          </kbd>
        </div>

        {/* Search Results Dropdown Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-[#0D1928] border border-[#22D3EE]/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2D42] bg-[#111F30]">
                <Search className="w-4 h-4 text-[#22D3EE]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search all 12 modules, datasets, or regulations..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#94A3B8] focus:outline-none"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#17283A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                {filteredModules.length > 0 ? (
                  filteredModules.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleSelectModuleFromSearch(mod.id)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-[#17283A] transition text-xs group"
                      >
                        <div className="p-2 rounded-lg bg-[#07111F] text-[#22D3EE] group-hover:bg-[#22D3EE]/20 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{mod.label}</span>
                            {mod.badge && (
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                  mod.badgeColor || 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {mod.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#94A3B8] truncate">{mod.description}</p>
                        </div>
                      </button>
                    );
                  })
                ) : searchQuery.trim() ? (
                  <div className="p-6 text-center text-xs text-[#94A3B8]">
                    No matching modules found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="p-3 text-[11px] text-[#94A3B8]">
                    <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-2">
                      Suggested Destinations
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {MODULE_ITEMS.slice(0, 6).map((mod) => {
                        const Icon = mod.icon;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => handleSelectModuleFromSearch(mod.id)}
                            className="flex items-center gap-2 p-2 rounded-lg bg-[#111F30] hover:bg-[#17283A] text-left transition"
                          >
                            <Icon className="w-3.5 h-3.5 text-[#22D3EE]" />
                            <span className="text-white text-xs truncate">{mod.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions, Status & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ISRO Space Hub Connection Pill */}
        <button
          onClick={onOpenIsroModal}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0D1928] border border-indigo-700/50 hover:border-indigo-500 text-xs text-indigo-300 transition shadow-sm"
          title="Configure ISRO Space Portals (Bhoonidhi, Bhuvan, MOSDAC, VEDAS)"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34D399]"></span>
          </span>
          <span className="hidden sm:inline font-mono font-medium text-[11px]">ISRO Space Hub</span>
          <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded border border-indigo-500/30">
            ONLINE
          </span>
        </button>

        {/* AI Advisor Button */}
        {onOpenAdvisor && (
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Advisor</span>
          </button>
        )}

        {/* Feasibility Report Button */}
        {onOpenReport && (
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0D1928] hover:bg-[#111F30] border border-[#1E2D42] text-slate-200 text-xs font-medium transition cursor-pointer"
            title="Export Comprehensive Feasibility Report"
          >
            <FileText className="w-3.5 h-3.5 text-[#34D399]" />
            <span className="hidden lg:inline">Dossier</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-xl text-[#94A3B8] hover:text-white bg-[#0D1928] hover:bg-[#111F30] border border-[#1E2D42] transition"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F87171] text-white text-[9px] font-bold flex items-center justify-center border border-[#07111F]">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0D1928] border border-[#1E2D42] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2D42] bg-[#111F30]">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xs text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#22D3EE] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#1E2D42]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs transition ${
                      n.read ? 'bg-[#0D1928]/60 opacity-80' : 'bg-[#111F30]/80'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {n.type === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                      )}
                      {n.type === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                      )}
                      {n.type === 'info' && (
                        <Info className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white truncate">{n.title}</span>
                          <span className="text-[10px] text-[#94A3B8] font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[#94A3B8] hover:text-white bg-[#0D1928] hover:bg-[#111F30] border border-[#1E2D42] transition"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-[#FBBF24]" />
          ) : (
            <Moon className="w-4 h-4 text-[#60A5FA]" />
          )}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#111F30] border border-transparent hover:border-[#1E2D42] transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#07111F] rounded-[6px] flex items-center justify-center text-[10px] font-bold text-[#22D3EE]">
                AS
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#94A3B8] hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0D1928] border border-[#1E2D42] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-[#1E2D42] bg-[#111F30] rounded-xl mb-1">
                <span className="font-display font-bold text-xs text-white block">
                  Dr. Ananya Sharma
                </span>
                <span className="text-[10px] text-[#22D3EE] font-mono block">
                  Chief Urban Planner
                </span>
                <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                  MoHUA Smart Cities Mission
                </span>
              </div>

              <div className="space-y-0.5 text-xs text-[#94A3B8]">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#17283A] hover:text-white text-left transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Planning Credentials</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setActiveTab('advisor');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#17283A] hover:text-white text-left transition"
                >
                  <Bot className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>TerraAdvisor AI Studio</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenIsroModal?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#17283A] hover:text-white text-left transition"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Space Portal Keys</span>
                </button>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#17283A] hover:text-white text-left transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>URDPFI Compliance Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
