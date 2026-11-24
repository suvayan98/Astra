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
      title: 'ISRO Bhoonidhi STAC sync',
      message: 'Sentinel-2 10m multispectral imagery updated for current coordinates.',
      time: '12m ago',
      type: 'success',
      read: false
    },
    {
      id: 'n2',
      title: 'CGWB hydrology assessment',
      message: 'Block extraction stage at 72.4% (Semi-Critical). RWH mitigation applied.',
      time: '45m ago',
      type: 'warning',
      read: false
    },
    {
      id: 'n3',
      title: 'Master plan generated',
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
      badge: 'Agent',
      badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      description: 'Planning assistant with grounded formulas and live inspector'
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
    <header className="sticky top-0 z-40 h-14 bg-[#101113]/95 backdrop-blur-md border-b border-[#282A2E] px-4 flex items-center justify-between gap-3 select-none transition-colors duration-150">
      {/* Left: Branding & Site Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Sidebar Hamburger Toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 bg-[#18191B] hover:bg-[#222326] border border-[#282A2E] lg:hidden transition cursor-pointer"
            title={isSidebarCollapsed ? "Expand menu" : "Collapse menu"}
          >
            <Menu className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}

        {/* Brand Logo & Title */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2 cursor-pointer group"
          title="Go to overview"
        >
          <div className="w-7 h-7 rounded-md bg-[#242529] border border-[#2E3035] flex items-center justify-center text-zinc-200">
            <Globe2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-medium text-base tracking-tight text-zinc-100">
                TerraAI
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#18191B] border border-[#282A2E] text-zinc-400">
                v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block h-5 w-px bg-[#282A2E]" />

        {/* Site Selector Dropdown */}
        <div className="relative flex items-center bg-[#18191B] border border-[#282A2E] hover:border-zinc-600 rounded-lg px-2.5 py-1 gap-2 text-xs transition">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={1.5} />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-zinc-500 font-mono leading-none">
              Site
            </span>
            <select
              value={selectedSiteId}
              onChange={(e) => onSelectSite(e.target.value)}
              className="bg-transparent text-zinc-200 font-medium text-xs focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {presetSites && presetSites.length > 0 ? (
                presetSites.map((site) => (
                  <option key={site.id} value={site.id} className="bg-[#18191B] text-zinc-200">
                    {site.name} ({site.state})
                  </option>
                ))
              ) : (
                <option value="site-dholera" className="bg-[#18191B] text-zinc-200">
                  Dholera SIR Greenfield (Gujarat)
                </option>
              )}
            </select>
          </div>
          <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 pointer-events-none" strokeWidth={1.5} />
        </div>

        {/* Quick Area / Population Metrics */}
        <div className="hidden xl:flex items-center gap-2 bg-[#18191B] border border-[#282A2E] rounded-lg px-2.5 py-1 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Area</span>
            <span className="text-zinc-200 font-medium tabular-nums">{areaAcres} ac</span>
            <span className="text-zinc-600">({(areaAcres * 0.00404686).toFixed(2)} km²)</span>
          </div>
          <span className="text-[#282A2E]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Pop</span>
            <input
              type="number"
              min="2000"
              max="500000"
              step="1000"
              value={population}
              onChange={(e) => setPopulation(Number(e.target.value))}
              className="w-16 bg-[#101113] text-zinc-200 font-medium text-center rounded px-1 py-0.5 focus:outline-none border border-[#282A2E] focus:border-zinc-500 tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Middle: Quick Search Bar */}
      <div className="relative flex-1 max-w-sm hidden md:block">
        <div
          onClick={() => {
            setIsSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }}
          className="flex items-center justify-between w-full bg-[#18191B] hover:bg-[#202124] border border-[#282A2E] hover:border-zinc-600 rounded-lg px-2.5 py-1 text-xs text-zinc-400 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
            <span>Search modules and datasets</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono bg-[#242529] text-zinc-400 px-1.5 py-0.5 rounded border border-[#2E3035]">
            Ctrl K
          </kbd>
        </div>

        {/* Search Results Dropdown Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-[#18191B] border border-[#282A2E] rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#282A2E] bg-[#16171A]">
                <Search className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules, datasets, or regulations..."
                  className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-[#242529]"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
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
                        className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-[#242529] transition text-xs group"
                      >
                        <div className="p-1.5 rounded-md bg-[#101113] text-zinc-400 group-hover:text-zinc-200 transition-colors">
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-200">{mod.label}</span>
                            {mod.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border bg-[#101113] text-zinc-400 border-[#282A2E]">
                                {mod.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 truncate">{mod.description}</p>
                        </div>
                      </button>
                    );
                  })
                ) : searchQuery.trim() ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    No matching modules found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="p-3 text-[11px] text-zinc-400">
                    <span className="font-mono text-zinc-500 text-xs block mb-2">
                      Suggested destinations
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {MODULE_ITEMS.slice(0, 6).map((mod) => {
                        const Icon = mod.icon;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => handleSelectModuleFromSearch(mod.id)}
                            className="flex items-center gap-2 p-2 rounded-md bg-[#101113] hover:bg-[#242529] text-left transition"
                          >
                            <Icon className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                            <span className="text-zinc-300 text-xs truncate">{mod.shortLabel}</span>
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
      <div className="flex items-center gap-2">
        {/* ISRO Space Hub Connection Pill */}
        <button
          onClick={onOpenIsroModal}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#18191B] border border-[#282A2E] hover:border-zinc-600 text-xs text-zinc-300 transition"
          title="Configure ISRO space portals (Bhoonidhi, Bhuvan, MOSDAC, VEDAS)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline font-mono text-[11px]">ISRO Hub</span>
          <span className="text-[9px] font-mono bg-[#101113] text-zinc-400 px-1 py-0.2 rounded border border-[#202225]">
            4/4 active
          </span>
        </button>

        {/* AI Advisor Button */}
        {onOpenAdvisor && (
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18191B] hover:bg-[#222326] text-zinc-200 border border-[#282A2E] hover:border-zinc-600 text-xs font-medium transition cursor-pointer"
            title="Open TerraAdvisor planning assistant"
          >
            <Bot className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span className="hidden md:inline">Advisor</span>
          </button>
        )}

        {/* Export Report Button */}
        {onOpenReport && (
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18191B] hover:bg-[#222326] text-zinc-200 border border-[#282A2E] hover:border-zinc-600 text-xs font-medium transition cursor-pointer"
            title="Generate comprehensive master plan dossier"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span className="hidden lg:inline">Report</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 bg-[#18191B] hover:bg-[#222326] border border-[#282A2E] transition relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#18191B] border border-[#282A2E] rounded-xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#282A2E] bg-[#16171A]">
                <span className="font-mono text-xs text-zinc-200">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[#202225]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs transition-colors ${
                      n.read ? 'bg-[#18191B]' : 'bg-[#1D1E22]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-zinc-200">{n.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 bg-[#18191B] hover:bg-[#222326] border border-[#282A2E] transition cursor-pointer"
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? <Sun className="w-4 h-4" strokeWidth={1.5} /> : <Moon className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </div>
    </header>
  );
};
