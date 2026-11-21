import React from 'react';
import { 
  SunMedium, 
  Wind, 
  Zap, 
  BatteryCharging, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight, 
  Cpu, 
  Info,
  Building
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface RenewableEnergyViewProps {
  energyData: any;
  population: number;
}

export const RenewableEnergyView: React.FC<RenewableEnergyViewProps> = ({ energyData, population }) => {
  const e = energyData || {
    solar_ghi_kwh_m2_day: 5.45,
    solar_dni_kwh_m2_day: 5.50,
    wind_speed_50m_mps: 5.5,
    wind_speed_100m_mps: 6.4,
    solar_pv_potential_mw: 15.2,
    wind_potential_mw: 5.0,
    annual_solar_generation_gwh: 27.3,
    annual_wind_generation_gwh: 5.7,
    total_renewable_generation_gwh: 33.0,
    projected_city_demand_gwh: 28.0,
    renewable_share_pct: 88.0,
    battery_bess_mwh_required: 14.8,
    monthly_generation_profile: [
      { month: 'Jan', solar_gwh: 2.15, wind_gwh: 0.38, total_re_gwh: 2.53, demand_gwh: 2.10 },
      { month: 'Feb', solar_gwh: 2.30, wind_gwh: 0.40, total_re_gwh: 2.70, demand_gwh: 2.15 },
      { month: 'Mar', solar_gwh: 2.68, wind_gwh: 0.45, total_re_gwh: 3.13, demand_gwh: 2.80 },
      { month: 'Apr', solar_gwh: 2.75, wind_gwh: 0.48, total_re_gwh: 3.23, demand_gwh: 2.85 },
      { month: 'May', solar_gwh: 2.65, wind_gwh: 0.55, total_re_gwh: 3.20, demand_gwh: 2.90 },
      { month: 'Jun', solar_gwh: 2.10, wind_gwh: 0.72, total_re_gwh: 2.82, demand_gwh: 2.30 },
      { month: 'Jul', solar_gwh: 1.65, wind_gwh: 0.78, total_re_gwh: 2.43, demand_gwh: 2.20 },
      { month: 'Aug', solar_gwh: 1.70, wind_gwh: 0.75, total_re_gwh: 2.45, demand_gwh: 2.25 },
      { month: 'Sep', solar_gwh: 2.15, wind_gwh: 0.48, total_re_gwh: 2.63, demand_gwh: 2.15 },
      { month: 'Oct', solar_gwh: 2.35, wind_gwh: 0.38, total_re_gwh: 2.73, demand_gwh: 2.10 },
      { month: 'Nov', solar_gwh: 2.20, wind_gwh: 0.35, total_re_gwh: 2.55, demand_gwh: 2.05 },
      { month: 'Dec', solar_gwh: 2.10, wind_gwh: 0.36, total_re_gwh: 2.46, demand_gwh: 2.05 }
    ],
    assumptions_summary: [
      "Solar PV: Bifacial Mono-PERC 550Wp modules at 15° fixed tilt, performance ratio (PR) 78%, CUF 20.5%.",
      "Wind: 2.5 MW class-III turbines at 100m hub height (cut-in 3.0 m/s, rated 10.5 m/s).",
      "Demand: 1,400 kWh/person/year based on Central Electricity Authority (CEA) smart city urban standard.",
      "Storage: 4-hour depth of discharge (DoD 90%) round-trip efficiency 86%."
    ]
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-1">
          <SunMedium className="w-4 h-4" />
          <span>MODULE F &bull; TERRAENERGY AI & NASA POWER / VEDAS</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Renewable Energy Intelligence & Microgrid Storage</h1>
        <p className="text-xs text-slate-400 mt-1">
          Bifacial solar PV modeling, boundary micro-wind generation, seasonal cloud cover impact, and 11kV islandable battery microgrid sizing.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Renewable Share %</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {e.renewable_share_pct}%
          </div>
          <p className="text-[11px] text-emerald-400">
            Generates {e.total_renewable_generation_gwh} GWh vs {e.projected_city_demand_gwh} GWh demand
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Solar PV Capacity</span>
            <SunMedium className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {e.solar_pv_potential_mw} <span className="text-xs text-slate-400 font-normal">MWp</span>
          </div>
          <p className="text-[11px] text-slate-400">
            6.2 MW Ground-mount (25 ac) + 9.0 MW Rooftop PV
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Boundary Wind Capacity</span>
            <Wind className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {e.wind_potential_mw} <span className="text-xs text-slate-400 font-normal">MW</span>
          </div>
          <p className="text-[11px] text-slate-400">
            2 &times; 2.5 MW turbines &bull; {e.wind_speed_100m_mps} m/s at 100m
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Battery Storage (BESS)</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {e.battery_bess_mwh_required} <span className="text-xs text-slate-400 font-normal">MWh</span>
          </div>
          <p className="text-[11px] text-slate-400">
            4-hour nighttime peak buffering (LFP chemistry)
          </p>
        </div>
      </div>

      {/* Monthly Profile Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Monthly Renewable Generation vs Municipal Electrical Demand (GWh)</h2>
            <p className="text-xs text-slate-400">Monsoon cloud attenuation in July-August balanced by peak monsoon wind speeds</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
            Solar GHI: {e.solar_ghi_kwh_m2_day} kWh/m²/day
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={e.monthly_generation_profile || []} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v} GWh`} fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                formatter={(val: any) => [`${val} GWh`, '']}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar name="Solar PV Generation" dataKey="solar_gwh" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar name="Wind Generation" dataKey="wind_gwh" stackId="a" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              <Line name="City Electricity Demand" type="monotone" dataKey="demand_gwh" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Microgrid Blueprint & Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center">
            <Cpu className="w-4 h-4 text-cyan-400 mr-2" />
            Islandable Microgrid Architecture
          </h3>
          <ul className="text-xs text-slate-300 space-y-2">
            {(e.microgrid_recommendations || [
              "Islandable 11kV municipal microgrid ring with smart fault isolation",
              "14.8 MWh Lithium Iron Phosphate (LFP) BESS for peak shifting and hospital/STP backup",
              "Solar carports and bi-directional V2G (Vehicle-to-Grid) chargers across transit terminals",
              "Mandatory rooftop solar on all civic, commercial, and multi-family structures"
            ]).map((rec: string, idx: number) => (
              <li key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center">
            <Info className="w-4 h-4 text-amber-400 mr-2" />
            Explicit Transparent Assumptions
          </h3>
          <ul className="text-xs text-slate-300 space-y-2">
            {(e.assumptions_summary || []).map((ass: string, idx: number) => (
              <li key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                <span>{ass}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
