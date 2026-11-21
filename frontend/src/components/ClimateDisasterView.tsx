import React from 'react';
import {
  ShieldAlert, CloudRain, Flame, Wind, AlertTriangle,
  Building, Navigation, CheckCircle2, ShieldCheck, Thermometer
} from 'lucide-react';
import { ClimateDisasterResult } from '../types';

interface ClimateDisasterViewProps {
  climate: ClimateDisasterResult | null;
  loading: boolean;
}

export const ClimateDisasterView: React.FC<ClimateDisasterViewProps> = ({ climate, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Synthesizing MOSDAC Satellite Meteorology & Hazard Risk Models...</p>
      </div>
    );
  }

  if (!climate) {
    return <div className="p-8 text-center text-slate-400">No climate data available.</div>;
  }

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h2 className="text-xl font-bold text-slate-100">
              TerraClimate AI — Climate Hazards & Disaster Resilience
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            ISRO / SAC MOSDAC Hydro-Estimator, IMD extreme weather return periods, and civil protection planning.
          </p>
        </div>
      </div>

      {/* Climate & Hazard Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">50-Yr Storm 24h Peak</span>
          <span className="text-2xl font-black text-rose-400">{climate.extreme_24h_rainfall_return_50yr_mm} mm</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Design storm datum</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Summer Max Temperature</span>
          <span className="text-2xl font-black text-amber-400">{climate.summer_max_temp_c}°C</span>
          <span className="text-[11px] text-slate-400 mt-1 block">{climate.heatwave_hazard_days_per_year} heatwave days/yr</span>
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

      {/* Disaster Shelters & Evacuation Corridors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Purpose Emergency Shelters */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Multi-Purpose Disaster Relief Shelters
            </h3>
          </div>

          <div className="space-y-3">
            {climate.emergency_shelters.map((sh, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-200">{sh.name}</h4>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    Capacity: {sh.capacity_people} People
                  </span>
                </div>
                <span className="text-[11px] text-cyan-400 font-medium block mb-1">{sh.location_zone}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{sh.features}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evacuation Corridors & Resilience Standards */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Primary Emergency Evacuation Corridors
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 mb-4">
              {climate.evacuation_corridors.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Mandatory Disaster-Resilient Building Codes</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {climate.disaster_resilience_measures.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
