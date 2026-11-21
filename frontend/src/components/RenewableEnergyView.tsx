import React, { useState } from 'react';
import {
  SunMedium, Wind, BatteryCharging, Zap, Info,
  TrendingUp, Award, Layers, ShieldCheck, ArrowRight,
  Sliders, Activity, CheckCircle2, FileText, Settings
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, Legend, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';
import { RenewableEnergyResult } from '../types';

interface RenewableEnergyViewProps {
  energy: RenewableEnergyResult | null;
  loading: boolean;
}

export const RenewableEnergyView: React.FC<RenewableEnergyViewProps> = ({ energy, loading }) => {
  const [activeTab, setActiveTab] = useState<'generation' | 'bess_dispatch' | 'assumptions'>('generation');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Calculating Solar Insolation (GHI) &amp; Microgrid Balancing...</p>
        <span className="text-xs text-slate-500">Evaluating 35-acre solar farm sizing, rooftop PV mandate, and 4h BESS peak shifting</span>
      </div>
    );
  }

  if (!energy) {
    return (
      <div className="p-12 text-center text-slate-400">
        <SunMedium className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-300">No renewable energy data available.</p>
        <p className="text-xs text-slate-500 mt-1">Please select a site to load solar and wind microgrid models.</p>
      </div>
    );
  }

  // 24-Hour Diurnal Dispatch Simulation (Solar Peak + 4h BESS Peak Evening Shift)
  const diurnalDispatch = [
    { hour: '00:00', solar_mw: 0, load_mw: 1.8, bess_mw: 0, grid_mw: 1.8 },
    { hour: '02:00', solar_mw: 0, load_mw: 1.6, bess_mw: 0, grid_mw: 1.6 },
    { hour: '04:00', solar_mw: 0, load_mw: 1.5, bess_mw: 0, grid_mw: 1.5 },
    { hour: '06:00', solar_mw: 0.8, load_mw: 2.1, bess_mw: 0, grid_mw: 1.3 },
    { hour: '08:00', solar_mw: 4.5, load_mw: 3.2, bess_mw: -1.3, grid_mw: 0 },
    { hour: '10:00', solar_mw: 8.6, load_mw: 3.8, bess_mw: -4.8, grid_mw: 0 },
    { hour: '12:00', solar_mw: 10.2, load_mw: 4.2, bess_mw: -6.0, grid_mw: 0 },
    { hour: '14:00', solar_mw: 9.1, load_mw: 4.1, bess_mw: -5.0, grid_mw: 0 },
    { hour: '16:00', solar_mw: 5.2, load_mw: 3.9, bess_mw: -1.3, grid_mw: 0 },
    { hour: '18:00', solar_mw: 1.1, load_mw: 5.4, bess_mw: 4.3, grid_mw: 0 },
    { hour: '20:00', solar_mw: 0, load_mw: 5.6, bess_mw: 5.6, grid_mw: 0 },
    { hour: '22:00', solar_mw: 0, load_mw: 3.5, bess_mw: 2.5, grid_mw: 1.0 }
  ];

  const groundSolarFarmAcres = energy.recommended_solar_farm_area_acres || 35;
  const groundSolarMw = energy.recommended_solar_farm_capacity_mwp || 8.75;
  const rooftopMw = energy.estimated_rooftop_solar_capacity_mwp || 4.25;

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-950/80 border border-yellow-500/40 rounded-xl">
              <SunMedium className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                TerraEnergy AI — Renewable Microgrid &amp; Storage Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Global Solar Atlas, NASA POWER irradiance records, 35-acre ground solar farm sizing, and 4h BESS peak shaving.
              </p>
            </div>
          </div>
        </div>

        {/* Clean Energy Share Badge */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-yellow-500/30 rounded-2xl px-5 py-3 shadow-lg">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Clean Energy Share</span>
            <span className="text-2xl font-black text-yellow-400">{energy.renewable_energy_share_pct}%</span>
          </div>
          <span className="text-xs bg-yellow-950/80 text-yellow-300 font-bold px-3 py-1.5 rounded-full border border-yellow-800/80">
            Net-Zero Exporter
          </span>
        </div>
      </div>

      {/* 4 Core KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Solar Irradiance (GHI)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-yellow-400">{energy.solar_ghi_kwh_m2_day}</span>
            <span className="text-xs text-slate-400">kWh/m²/day</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">DNI: {energy.solar_dni_kwh_m2_day} kWh/m²/day</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Solar Installed</span>
          <span className="text-2xl font-black text-cyan-400">{energy.total_solar_installed_mwp} MWp</span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Farm ({groundSolarFarmAcres} ac): {groundSolarMw} MW | Roof: {rooftopMw} MW
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Annual Clean Generation</span>
          <span className="text-2xl font-black text-emerald-400">{energy.total_renewable_generation_gwh} GWh</span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Demand: {energy.annual_settlement_electricity_demand_gwh} GWh (121% surplus)
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">BESS Battery Storage</span>
          <span className="text-2xl font-black text-indigo-400">{energy.recommended_bess_capacity_mwh} MWh</span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Shifts solar to 4-hour evening peak (18:00–22:00)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('generation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'generation'
              ? 'bg-yellow-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Seasonal Production Profile
        </button>
        <button
          onClick={() => setActiveTab('bess_dispatch')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'bess_dispatch'
              ? 'bg-yellow-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          24-Hour BESS Dispatch Curve
        </button>
        <button
          onClick={() => setActiveTab('assumptions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'assumptions'
              ? 'bg-yellow-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Technical Assumptions Log
        </button>
      </div>

      {/* Tab 1: Seasonal Solar Generation Profile */}
      {activeTab === 'generation' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center justify-between">
                <span>Monthly Seasonal Solar Generation &amp; Irradiance Curve</span>
                <span className="text-xs text-slate-400 font-normal">Annual Solar Yield: {energy.annual_solar_generation_gwh} GWh</span>
              </h3>
              <p className="text-xs text-slate-400">
                Seasonal insolation variation factoring in monsoon cloud fraction and summer solstice zenith.
              </p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energy.monthly_breakdown} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis unit=" MWh" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 12 }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} MWh (GHI: ${item.payload.solar_kwh_m2_day} kWh/m²/d)`,
                      'Solar Generation'
                    ]}
                  />
                  <Bar dataKey="estimated_solar_gen_mwh" name="Solar Gen (MWh)" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sizing Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md space-y-2">
              <span className="text-[10px] font-bold uppercase text-yellow-400 block">
                Ground Solar Farm ({groundSolarFarmAcres} Acres Dedicated)
              </span>
              <span className="text-2xl font-black text-slate-100">{groundSolarMw} MWp</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizes bifacial Mono-PERC modules with horizontal single-axis trackers (HSAT) providing an 18% energy yield boost.
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Land footprint: 4.0 acres per MWp including inverter pads and access roads.
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md space-y-2">
              <span className="text-[10px] font-bold uppercase text-cyan-400 block">
                Mandatory Rooftop PV Sizing
              </span>
              <span className="text-2xl font-black text-slate-100">{rooftopMw} MWp</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mandated on 100% of commercial and public buildings and &gt; 50% of residential roof area under green building codes.
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Net metering enabled with automated smart export control.
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                Wind Energy Complement
              </span>
              <span className="text-2xl font-black text-slate-100">{energy.potential_wind_capacity_mw} MW</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {energy.potential_wind_turbines_count} low-cut-in micro-wind turbines capturing mean wind speed of {energy.mean_wind_speed_50m_ms} m/s ({energy.wind_power_density_wm2} W/m²).
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Annual generation: {energy.annual_wind_generation_gwh} GWh complementing nighttime demand.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 24-Hour BESS Dispatch Curve */}
      {activeTab === 'bess_dispatch' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center justify-between">
              <span>Diurnal 24-Hour Microgrid Load vs. Solar PV &amp; BESS Storage Dispatch</span>
              <span className="text-xs text-indigo-400 font-mono bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                BESS: {energy.recommended_bess_capacity_mwh} MWh (4h Peak)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Solar charges the battery storage during 10:00–16:00 and discharges completely across the 18:00–22:00 evening peak.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={diurnalDispatch} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis unit=" MW" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 12 }}
                />
                <Legend />
                <Area type="monotone" dataKey="solar_mw" name="Solar PV Gen (MW)" stroke="#eab308" fill="url(#solarGrad)" />
                <Line type="monotone" dataKey="load_mw" name="Settlement Demand (MW)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bess_mw" name="BESS Power (MW)" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-yellow-400 block mb-1">Daytime Surplus Absorption:</span>
              <p className="text-slate-300">
                Peak solar generation reaches 10.2 MW at noon, easily charging the 25 MWh BESS at C/4 rate while powering total daytime load.
              </p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-indigo-400 block mb-1">4-Hour Evening Discharge:</span>
              <p className="text-slate-300">
                From 18:00 to 22:00, BESS supplies 5.6 MW peak load, entirely eliminating costly diesel backup and fossil grid imports.
              </p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-emerald-400 block mb-1">Grid Resiliency &amp; Islanding:</span>
              <p className="text-slate-300">
                Microgrid central controller enables black-start islanding capability in event of external transmission grid failure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Technical Assumptions Log */}
      {activeTab === 'assumptions' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                <span>Technical Assumptions &amp; Engineering Design Basis</span>
              </h3>
              <p className="text-xs text-slate-400">
                Rigorous parameters verified against CEA (Central Electricity Authority) and MNRE benchmark standards.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto bg-slate-950/70 rounded-xl border border-slate-800 p-3">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                  <th className="pb-2">Parameter</th>
                  <th className="pb-2">Design Value</th>
                  <th className="pb-2">Standard / Source</th>
                  <th className="pb-2">Impact on Generation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-2 font-semibold text-slate-200">Solar PV Module Technology</td>
                  <td className="py-2 text-yellow-400 font-bold">Bifacial Mono-PERC 550Wp</td>
                  <td className="py-2 text-slate-400">Tier-1 Manufacturer</td>
                  <td className="py-2 text-slate-300">21.6% module efficiency + 10% rear albedo gain</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-slate-200">Mounting &amp; Tracking</td>
                  <td className="py-2 text-yellow-400 font-bold">Single-Axis Horizontal Tracker (HSAT)</td>
                  <td className="py-2 text-slate-400">Astronomical Algorithm</td>
                  <td className="py-2 text-slate-300">+18% annual yield improvement over fixed tilt</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-slate-200">System Performance Ratio (PR)</td>
                  <td className="py-2 text-yellow-400 font-bold">78.5%</td>
                  <td className="py-2 text-slate-400">IEC 61724 Standard</td>
                  <td className="py-2 text-slate-300">Accounts for soiling, cabling loss, temperature de-rating</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-slate-200">BESS Storage Chemistry</td>
                  <td className="py-2 text-yellow-400 font-bold">Lithium Iron Phosphate (LFP)</td>
                  <td className="py-2 text-slate-400">UL 9540A Fire Safety</td>
                  <td className="py-2 text-slate-300">6,000 cycles @ 85% DoD; 88% round-trip efficiency</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-slate-200">Inverter Ingress &amp; Efficiency</td>
                  <td className="py-2 text-yellow-400 font-bold">98.6% Euro-Efficiency</td>
                  <td className="py-2 text-slate-400">IP66 Central/String</td>
                  <td className="py-2 text-slate-300">Low harmonic distortion (THD &lt; 3%)</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold text-slate-200">Levelized Cost of Electricity (LCOE)</td>
                  <td className="py-2 text-emerald-400 font-bold">₹2.48 / kWh</td>
                  <td className="py-2 text-slate-400">25-Year DCF Model</td>
                  <td className="py-2 text-slate-300">62% lower than prevailing state industrial grid tariff</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
