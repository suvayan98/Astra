import React from 'react';
import {
  Droplets, ShieldCheck, AlertTriangle, ArrowDownCircle,
  RefreshCw, Waves, Info, MapPin, CheckCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { WaterIntelligenceResult } from '../types';

interface WaterIntelligenceViewProps {
  water: WaterIntelligenceResult | null;
  loading: boolean;
}

export const WaterIntelligenceView: React.FC<WaterIntelligenceViewProps> = ({ water, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Retrieving CGWB Groundwater Assessments & Hydro-Balancing...</p>
      </div>
    );
  }

  if (!water) {
    return <div className="p-8 text-center text-slate-400">No water intelligence data available.</div>;
  }

  const balanceChartData = [
    { name: 'Total Demand', value: water.daily_total_demand_mld, color: '#f43f5e' },
    { name: 'RWH Yield', value: water.rainwater_harvesting_potential_mld, color: '#06b6d4' },
    { name: 'Recycled Graywater', value: water.treated_wastewater_reuse_potential_mld, color: '#10b981' },
    { name: 'Net Aquifer Draw', value: Math.max(0.2, water.net_freshwater_deficit_or_surplus_mld), color: '#8b5cf6' }
  ];

  const cgwb = water.cgwb_data;
  const isSafe = cgwb.category === 'Safe';
  const isSemi = cgwb.category === 'Semi-Critical';

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">
              TerraWater AI — Water Security & Dynamic Groundwater Intelligence
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            CPHEEO per-capita urban standards, Central Ground Water Board (CGWB) taluka assessments, and circular RWH balancing.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 border border-cyan-500/30 rounded-2xl px-5 py-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">CGWB Stage Category</span>
            <span className={`text-base font-black ${isSafe ? 'text-emerald-400' : isSemi ? 'text-amber-400' : 'text-rose-400'}`}>
              {cgwb.category} ({cgwb.stage_of_groundwater_extraction_pct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Water Uncertainty & Disclaimer Banner */}
      <div className="bg-cyan-950/40 border border-cyan-600/40 rounded-2xl p-4 text-cyan-200 text-xs shadow-lg flex items-start gap-3">
        <Info className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-cyan-300 font-bold block text-sm">
            CGWB OFFICIAL DATASET INTEGRATION & SATELLITE LIMITATION NOTE
          </strong>
          <p className="text-slate-300 leading-relaxed">
            {cgwb.disclaimer} {water.uncertainty_notes}
          </p>
        </div>
      </div>

      {/* KPI Cards: Water Demand & Recycling */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Daily Municipal Demand</span>
          <span className="text-2xl font-black text-rose-400">{water.daily_total_demand_mld} MLD</span>
          <span className="text-[11px] text-slate-400 mt-1 block">{water.annual_water_demand_mcm} MCM / year</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">RWH Harvesting Yield</span>
          <span className="text-2xl font-black text-cyan-400">{water.rainwater_harvesting_potential_mld} MLD</span>
          <span className="text-[11px] text-slate-400 mt-1 block">{water.rainwater_harvesting_annual_mcm} MCM captured/yr</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">DEWATS Wastewater Recovery</span>
          <span className="text-2xl font-black text-emerald-400">{water.treated_wastewater_reuse_potential_mld} MLD</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Recovers 90% of sewage</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Net Fresh Aquifer Draw</span>
          <span className="text-2xl font-black text-indigo-400">{Math.max(0.2, water.net_freshwater_deficit_or_surplus_mld)} MLD</span>
          <span className="text-[11px] text-slate-400 mt-1 block">{( ( (water.daily_total_demand_mld - Math.max(0.2, water.net_freshwater_deficit_or_surplus_mld)) / water.daily_total_demand_mld) * 100).toFixed(0)}% offset via circular loops</span>
        </div>
      </div>

      {/* Section 2: Water Balance & CGWB Hydrogeology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Water Balance Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 mb-1">Daily Municipal Water Balance (MLD)</h3>
          <p className="text-xs text-slate-400 mb-4">Comparing gross consumption vs circular RWH and graywater recycling</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={balanceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis unit=" MLD" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {balanceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CGWB Block Hydrogeology Profile */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-200">Official CGWB Block Assessment</h3>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
                {cgwb.block_taluka} Block, {cgwb.district}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Annual Recharge</span>
                <span className="text-base font-bold text-slate-100">{cgwb.annual_replenishable_recharge_mcm} MCM</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Annual Total Draft</span>
                <span className="text-base font-bold text-slate-100">{cgwb.annual_groundwater_draft_total_mcm} MCM</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Water Table Pre-Monsoon</span>
                <span className="text-base font-bold text-amber-400">{cgwb.depth_to_water_table_mbgl_pre_monsoon} mbgl</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Water Table Post-Monsoon</span>
                <span className="text-base font-bold text-emerald-400">{cgwb.depth_to_water_table_mbgl_post_monsoon} mbgl</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
            {water.water_balance_summary}
          </div>
        </div>
      </div>

      {/* Decentralized Rainwater Harvesting Infrastructure Plan */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400" />
          <span>Recommended Rainwater Harvesting & Managed Aquifer Recharge (MAR) Infrastructure</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {water.recommended_rwh_locations.map((loc, idx) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                {loc.recommended_zone}
              </span>
              <h4 className="text-xs font-bold text-slate-100 mt-2 mb-1.5">{loc.type}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{loc.purpose}</p>
              {loc.capacity_cubic_meters && (
                <div className="text-[11px] font-semibold text-emerald-400">
                  Capacity: {loc.capacity_cubic_meters.toLocaleString()} m³
                </div>
              )}
              {loc.count && (
                <div className="text-[11px] font-semibold text-indigo-400">
                  Total Units: {loc.count} Bore Recharge Shafts
                </div>
              )}
              {loc.capacity_mld && (
                <div className="text-[11px] font-semibold text-cyan-400">
                  Plant Capacity: {loc.capacity_mld} MLD Tertiary Flow
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
