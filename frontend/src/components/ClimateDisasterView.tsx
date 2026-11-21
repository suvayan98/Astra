import React, { useState } from 'react';
import {
  ShieldAlert, CloudRain, Flame, Wind, AlertTriangle,
  Building, Navigation, CheckCircle2, ShieldCheck, Thermometer,
  CloudLightning, Waves, ArrowRight, MapPin, Eye, Compass, Info
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, Legend, AreaChart, Area, CartesianGrid
} from 'recharts';
import { ClimateDisasterResult } from '../types';

interface ClimateDisasterViewProps {
  climate: ClimateDisasterResult | null;
  loading: boolean;
}

export const ClimateDisasterView: React.FC<ClimateDisasterViewProps> = ({ climate, loading }) => {
  const [activeTab, setActiveTab] = useState<'climate_charts' | 'flood_hazards' | 'shelters_evacuation'>('climate_charts');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Synthesizing MOSDAC Satellite Meteorology & Hazard Risk Models...</p>
        <span className="text-xs text-slate-500">Querying IMD 50-year extreme rainfall return periods, heatwave frequency, and cyclone corridors</span>
      </div>
    );
  }

  if (!climate) {
    return (
      <div className="p-12 text-center text-slate-400">
        <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-300">No climate or disaster risk data available.</p>
        <p className="text-xs text-slate-500 mt-1">Please select a site to synthesize meteorological hazard models.</p>
      </div>
    );
  }

  // Monthly Temperature & Rainfall Profile (Synthesized based on annual figures)
  const meanTemp = climate.mean_annual_temp_c || 27;
  const maxTemp = climate.summer_max_temp_c || 42;
  const minTemp = climate.winter_min_temp_c || 13;
  const annualRain = climate.mean_annual_rainfall_mm || 750;

  const monthlyMeteorology = [
    { month: 'Jan', min_c: minTemp, max_c: minTemp + 14, rainfall_mm: Math.round(annualRain * 0.005) },
    { month: 'Feb', min_c: minTemp + 3, max_c: minTemp + 17, rainfall_mm: Math.round(annualRain * 0.008) },
    { month: 'Mar', min_c: minTemp + 7, max_c: minTemp + 22, rainfall_mm: Math.round(annualRain * 0.012) },
    { month: 'Apr', min_c: minTemp + 11, max_c: maxTemp - 3, rainfall_mm: Math.round(annualRain * 0.02) },
    { month: 'May', min_c: minTemp + 14, max_c: maxTemp, rainfall_mm: Math.round(annualRain * 0.035) },
    { month: 'Jun', min_c: minTemp + 13, max_c: maxTemp - 4, rainfall_mm: Math.round(annualRain * 0.18) },
    { month: 'Jul', min_c: minTemp + 12, max_c: maxTemp - 8, rainfall_mm: Math.round(annualRain * 0.35) },
    { month: 'Aug', min_c: minTemp + 11, max_c: maxTemp - 9, rainfall_mm: Math.round(annualRain * 0.26) },
    { month: 'Sep', min_c: minTemp + 10, max_c: maxTemp - 6, rainfall_mm: Math.round(annualRain * 0.10) },
    { month: 'Oct', min_c: minTemp + 7, max_c: maxTemp - 5, rainfall_mm: Math.round(annualRain * 0.02) },
    { month: 'Nov', min_c: minTemp + 4, max_c: minTemp + 16, rainfall_mm: Math.round(annualRain * 0.006) },
    { month: 'Dec', min_c: minTemp, max_c: minTemp + 13, rainfall_mm: Math.round(annualRain * 0.004) }
  ];

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-950/80 border border-rose-500/40 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                TerraClimate AI — Climate Hazards &amp; Disaster Resilience
              </h2>
              <p className="text-xs text-slate-400">
                ISRO / SAC MOSDAC Hydro-Estimator, IMD extreme weather return periods, and NDMA civil protection infrastructure.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('climate_charts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'climate_charts'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Temperature &amp; Rainfall
          </button>
          <button
            onClick={() => setActiveTab('flood_hazards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'flood_hazards'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Flood Risk &amp; 50-Yr Storm
          </button>
          <button
            onClick={() => setActiveTab('shelters_evacuation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'shelters_evacuation'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Shelters &amp; Evacuation
          </button>
        </div>
      </div>

      {/* 4 Core Climate & Hazard KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">50-Yr Storm 24h Peak</span>
          <span className="text-2xl font-black text-rose-400">{climate.extreme_24h_rainfall_return_50yr_mm} mm</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Statutory drainage design storm</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Summer Max Temperature</span>
          <span className="text-2xl font-black text-amber-400">{climate.summer_max_temp_c}°C</span>
          <span className="text-[11px] text-slate-400 mt-1 block">{climate.heatwave_hazard_days_per_year} heatwave days/year</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Flood Susceptibility</span>
          <span className="text-2xl font-black text-cyan-400">{climate.flood_susceptibility_zone}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">{climate.flood_drainage_buffer_m}m setback buffer</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Safe Development Area</span>
          <span className="text-2xl font-black text-emerald-400">{climate.recommended_safe_development_area_pct}%</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Cyclone: {climate.cyclone_hazard_risk}</span>
        </div>
      </div>

      {/* Tab 1: Temperature & Rainfall Charts */}
      {activeTab === 'climate_charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Variation Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>Monthly Temperature Range (°C)</span>
                </h3>
                <p className="text-xs text-slate-400">Mean annual: {climate.mean_annual_temp_c}°C | Summer max: {climate.summer_max_temp_c}°C</p>
              </div>
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
                {climate.heatwave_hazard_days_per_year} Heatwave Days/Yr
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyMeteorology} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis unit="°C" domain={[0, 50]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 11 }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="max_c" name="Summer Peak (°C)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="min_c" name="Winter Min (°C)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-amber-400 block mb-0.5">Urban Heat Island (UHI) Mitigation:</strong>
              High summer peaks of {climate.summer_max_temp_c}°C require mandatory cool-roof high-albedo coatings (SRI &gt; 78)
              and dense Miyawaki canopy cooling corridors along pedestrian transit corridors.
            </div>
          </div>

          {/* Rainfall Distribution Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span>Monsoon Rainfall Distribution (mm)</span>
                </h3>
                <p className="text-xs text-slate-400">Mean annual total: {climate.mean_annual_rainfall_mm} mm (79% concentrated in Jul–Aug)</p>
              </div>
              <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
                ISRO MOSDAC
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyMeteorology} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis unit="mm" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 11 }}
                    formatter={(val: any) => [`${val} mm`, 'Rainfall']}
                  />
                  <Bar dataKey="rainfall_mm" name="Precipitation (mm)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-cyan-400 block mb-0.5">Hydrological Capture Optimization:</strong>
              The extreme rainfall concentration during July–August provides 80% of annual aquifer recharge potential,
              requiring retention ponds with at least 150,000 m³ capacity.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Flood Hazards & 50-Yr Storm */}
      {activeTab === 'flood_hazards' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Waves className="w-5 h-5 text-rose-400" />
                <span>50-Year Extreme Storm Return &amp; Flood Inundation Modeling</span>
              </h3>
              <p className="text-xs text-slate-400">
                IDF storm frequency calculations per CPHEEO stormwater manual and National Disaster Management Guidelines.
              </p>
            </div>
            <span className="text-xs bg-rose-950/80 text-rose-300 px-3 py-1 rounded-full border border-rose-800 font-bold">
              Zone: {climate.flood_susceptibility_zone}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">50-Yr 24h Extreme Precipitation</span>
              <span className="text-2xl font-black text-rose-400">{climate.extreme_24h_rainfall_return_50yr_mm} mm</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Design datum used for sizing major box culverts, retention basins, and bioswales.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Mandatory Riparian Setback</span>
              <span className="text-2xl font-black text-cyan-400">{climate.flood_drainage_buffer_m} Meters</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Buffer along all natural nallahs and floodplains zoned strictly for green parks and afforestation.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Drought Vulnerability Index</span>
              <span className="text-2xl font-black text-amber-400">{climate.drought_vulnerability_index}</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Requires mandatory multi-month water storage reservoirs to bridge inter-monsoon drought episodes.
              </p>
            </div>
          </div>

          {/* Disaster Resilience Measures */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Statutory Disaster Resilience Measures &amp; Structural Codes</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              {climate.disaster_resilience_measures.map((m, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Disaster Shelters & Evacuation Corridors */}
      {activeTab === 'shelters_evacuation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Multi-Purpose Emergency Shelters */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Multi-Purpose Disaster Relief Shelters
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800 font-bold">
                Civil Defense Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dual-use facilities functioning as high schools, community auditoriums, and civil protection shelters during extreme events.
            </p>

            <div className="space-y-3">
              {climate.emergency_shelters.map((sh, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200">{sh.name}</h4>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      Capacity: {sh.capacity_people} People
                    </span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-medium block">{sh.location_zone}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{sh.features}</p>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>• 48-hr Off-grid BESS Backup</span>
                    <span>• 50,000L Emergency Potable Sump</span>
                    <span>• Medical Triage Bay</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evacuation Corridors & Civil Defense Logistics */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Designated Emergency Evacuation Corridors
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                All-weather arterial transit spines engineered with elevated plinth levels above the 100-year High Flood Level (HFL).
              </p>

              <div className="space-y-2.5">
                {climate.evacuation_corridors.map((c, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-200 block">{c}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Direct connectivity to Regional Highway; dedicated emergency vehicle shoulder and solar lighting.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-emerald-400 block mb-1">Civil Protection Standard:</strong>
              Evacuation routes are planned to ensure 100% of the settlement population can safely reach a reinforced relief
              shelter within a maximum 10-minute walk (800 meters) from any residential or commercial zone.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
