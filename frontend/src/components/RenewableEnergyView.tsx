import React from 'react';
import {
  SunMedium, Wind, BatteryCharging, Zap, Info,
  TrendingUp, Award, Layers, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, Legend, Cell
} from 'recharts';
import { RenewableEnergyResult } from '../types';

interface RenewableEnergyViewProps {
  energy: RenewableEnergyResult | null;
  loading: boolean;
}

export const RenewableEnergyView: React.FC<RenewableEnergyViewProps> = ({ energy, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Calculating Solar Insolation (GHI) & Wind Microgrid Potentials...</p>
      </div>
    );
  }

  if (!energy) {
    return <div className="p-8 text-center text-slate-400">No renewable energy data available.</div>;
  }

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SunMedium className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-slate-100">
              TerraEnergy AI — Renewable Energy Intelligence & Microgrid Balancing
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Global Solar Atlas, NASA POWER irradiance records, and BESS storage sizing for net-zero settlement operations.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 border border-yellow-500/30 rounded-2xl px-5 py-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Clean Energy Share</span>
            <span className="text-xl font-black text-yellow-400">{energy.renewable_energy_share_pct}%</span>
          </div>
          <span className="text-xs bg-yellow-950/80 text-yellow-300 font-bold px-2.5 py-1 rounded-full border border-yellow-800/80">
            Net-Zero Capable
          </span>
        </div>
      </div>

      {/* KPI Energy Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Solar Irradiance (GHI)</span>
          <span className="text-2xl font-black text-yellow-400">{energy.solar_ghi_kwh_m2_day}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">kWh / m² / day</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Solar Capacity</span>
          <span className="text-2xl font-black text-cyan-400">{energy.total_solar_installed_mwp} MWp</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Farm: {energy.recommended_solar_farm_capacity_mwp} MW | Roof: {energy.estimated_rooftop_solar_capacity_mwp} MW</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Annual Clean Generation</span>
          <span className="text-2xl font-black text-emerald-400">{energy.total_renewable_generation_gwh} GWh</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Demand: {energy.annual_settlement_electricity_demand_gwh} GWh/yr</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">BESS Battery Storage</span>
          <span className="text-2xl font-black text-indigo-400">{energy.recommended_bess_capacity_mwh} MWh</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Shifts daytime solar to 4h evening peak</span>
        </div>
      </div>

      {/* Monthly Seasonal Generation Curve */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 mb-1">Monthly Seasonal Solar Production Profile (MWh)</h3>
        <p className="text-xs text-slate-400 mb-4">Variation in generation based on monsoon cloud fraction and seasonal solar zenith</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={energy.monthly_breakdown} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis unit=" MWh" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 12 }} />
              <Bar dataKey="estimated_solar_gen_mwh" name="Solar Gen (MWh)" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sizing Assumptions Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Transparent Engineering Sizing Assumptions & Technology Standards</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {Object.entries(energy.assumptions_log).map(([key, val], idx) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="font-bold text-slate-200">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
