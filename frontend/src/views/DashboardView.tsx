import React from 'react';
import { 
  Target, 
  Droplet, 
  SunMedium, 
  Trees, 
  Mountain, 
  CloudLightning, 
  Compass, 
  TrendingUp, 
  Satellite, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { SiteSuitabilityResult, MasterPlanAlternative, SampleSite } from '../types';

interface DashboardViewProps {
  siteAnalysis: SiteSuitabilityResult | null;
  activePlan: MasterPlanAlternative | null;
  selectedSite: SampleSite | null;
  onNavigate: (tab: string) => void;
  onOpenAdvisor: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  siteAnalysis,
  activePlan,
  selectedSite,
  onNavigate,
  onOpenAdvisor
}) => {
  const score = siteAnalysis?.overall_suitability_score || 81.4;
  const pop = selectedSite?.proposed_population || 20000;
  const area = selectedSite?.area_acres || 500;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
      {/* Hero Executive Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ISRO-CALIBRATED SMART CITY MASTER PLANNER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Sustainable Settlement Planning Platform
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Evaluating <strong className="text-cyan-300 font-semibold">{area} Acres</strong> (~{(area * 0.00404686).toFixed(2)} km²) in{' '}
              <strong className="text-white font-semibold">{selectedSite?.district}, {selectedSite?.state}</strong> for approximately{' '}
              <strong className="text-emerald-300 font-semibold">{pop.toLocaleString()} people</strong> using multi-sensor Earth observation, 
              geospatial hydrological models, and multi-decadal simulation.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('master_plan')}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition flex items-center space-x-2"
              >
                <Compass className="w-4 h-4 text-slate-950" />
                <span>Explore Master Plans (A, B, C)</span>
              </button>
              <button
                onClick={() => onNavigate('map')}
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                Open GIS Workspace Map
              </button>
              <button
                onClick={onOpenAdvisor}
                className="px-4 py-2 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-800/60 transition"
              >
                Ask TerraAdvisor AI
              </button>
            </div>
          </div>

          {/* Site Suitability Overall Score Gauge */}
          <div className="flex-shrink-0 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center w-56 shadow-xl">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Site Suitability Score
            </span>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#06b6d4"
                  strokeWidth="8"
                  strokeDasharray={`${(score / 100) * 301} 301`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-white">{score}</span>
                <span className="text-xs text-slate-400 block -mt-1">/ 100</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-300">
                {siteAnalysis?.suitability_class || 'Highly Suitable'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Quantitative Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Developable Land</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {siteAnalysis?.net_developable_area_acres || 412} <span className="text-sm font-normal text-slate-400">Acres</span>
          </div>
          <div className="text-[11px] text-emerald-400">
            88 Acres preserved as statutory buffers (17.6%)
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Water Self-Sufficiency</span>
            <Droplet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activePlan?.water_self_sufficiency_pct || 72.0}%
          </div>
          <div className="text-[11px] text-cyan-400">
            RWH Lake (0.89 MCM) + Tertiary STP Recycling
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Clean Energy Share</span>
            <SunMedium className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activePlan?.renewable_energy_share_pct || 76.5}%
          </div>
          <div className="text-[11px] text-amber-300">
            15.2 MW Solar + 14.8 MWh BESS Microgrid
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Green Open Space</span>
            <Trees className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activePlan?.green_open_space_pct || 42.0}%
          </div>
          <div className="text-[11px] text-emerald-300">
            210 Acres contiguous forest & corridors
          </div>
        </div>
      </div>

      {/* Core Intelligence Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center">
            <span>Core Geospatial & Planning Intelligence Modules</span>
            <span className="ml-2 text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Modules A — J
            </span>
          </h2>
          <span className="text-xs text-slate-400">Click any card to inspect detailed telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Module A */}
          <div 
            onClick={() => onNavigate('site_selection')}
            className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Module A</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition">TerraSite AI (Site Selection)</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                12-factor multi-criteria suitability scoring (AHP weighted sum), carrying capacity, and statutory exclusion buffer demarcation.
              </p>
            </div>
            <div className="text-xs text-cyan-400 flex items-center font-medium pt-1">
              <span>View 12-factor breakdown</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module B & C */}
          <div 
            onClick={() => onNavigate('terrain_soil')}
            className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Mountain className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Modules B & C</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition">TerraTerrain & TerraSoil AI</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Digital elevation profiles, slope aspect, drainage directions, soil texture (sand/silt/clay), and geotechnical foundation warnings.
              </p>
            </div>
            <div className="text-xs text-emerald-400 flex items-center font-medium pt-1">
              <span>Inspect topo & soil matrix</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module D */}
          <div 
            onClick={() => onNavigate('water')}
            className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
                <Droplet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Module D</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-blue-300 transition">TerraWater AI & CGWB Aquifer</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                CPHEEO standard water balance (3.39 MLD for 20k pop), RWH potential, and official Central Ground Water Board assessment extraction categories.
              </p>
            </div>
            <div className="text-xs text-blue-400 flex items-center font-medium pt-1">
              <span>View water balance & RWH</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module E */}
          <div 
            onClick={() => onNavigate('climate')}
            className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 transition cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-800/60 flex items-center justify-center text-rose-400">
                <CloudLightning className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Module E</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-300 transition">TerraClimate AI (Disaster Risk)</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                MOSDAC calibrated rainfall trends, extreme precipitation hazard buffers, heatwave vulnerability, and resilient evacuation corridors.
              </p>
            </div>
            <div className="text-xs text-rose-400 flex items-center font-medium pt-1">
              <span>Inspect disaster hazard zoning</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module F */}
          <div 
            onClick={() => onNavigate('energy')}
            className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400">
                <SunMedium className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Module F</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition">TerraEnergy AI (Solar / Wind)</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Solar irradiance (GHI/DNI), rooftop + ground PV sizing, micro-wind boundary generation, and 14.8 MWh BESS battery microgrid design.
              </p>
            </div>
            <div className="text-xs text-amber-400 flex items-center font-medium pt-1">
              <span>View clean energy & storage</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Module G */}
          <div 
            onClick={() => onNavigate('vegetation')}
            className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Trees className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Module G</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition">TerraVegetation AI (NDVI & Flora)</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                ISRO VEDAS 12-month NDVI/EVI phenology, native tree species matrix (Neem, Jamun, Peepal, Banyan), and continuous wildlife corridors.
              </p>
            </div>
            <div className="text-xs text-emerald-400 flex items-center font-medium pt-1">
              <span>Explore native species guide</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* ISRO Space Portals Integration Status Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center">
              <Satellite className="w-4 h-4 text-orange-400 mr-2" />
              Mandatory Indian Space Portals — ASTRA Integration Status
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live telemetry & authoritative Earth observation adapters connected to the analysis pipeline.
            </p>
          </div>
          <button
            onClick={() => onNavigate('isro_hub')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center"
          >
            <span>Open ISRO Space Hub</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200">1. BHOONIDHI</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                STAC v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Cartosat-3 (0.28m) & Resourcesat-2A optical discovery</p>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5" />
              <span>ISRO / NRSC</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200">2. BHUVAN</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                WMS / 50K
              </span>
            </div>
            <p className="text-[11px] text-slate-400">National LULC 50k & Geomorphology Thematic Maps</p>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5" />
              <span>ISRO / NRSC</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200">3. MOSDAC</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                INSAT-3D/3DR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Hydro-Estimator Rainfall, Cloud Cover & Heatwaves</p>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5" />
              <span>ISRO / SAC</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200">4. VEDAS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                NDVI Phenology
              </span>
            </div>
            <p className="text-[11px] text-slate-400">15-day NDVI composites & Solar/Wind Resource screening</p>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5" />
              <span>ISRO / SAC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
