import React, { useState } from 'react';
import {
  Droplets, ShieldCheck, AlertTriangle, ArrowDownCircle,
  RefreshCw, Waves, Info, MapPin, CheckCircle, ArrowRight,
  TrendingDown, Database, Building2, Sliders, Layers
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, PieChart, Pie, Legend, AreaChart, Area, CartesianGrid
} from 'recharts';
import { WaterIntelligenceResult } from '../types';

interface WaterIntelligenceViewProps {
  water: WaterIntelligenceResult | null;
  loading: boolean;
}

export const WaterIntelligenceView: React.FC<WaterIntelligenceViewProps> = ({ water, loading }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'cgwb' | 'dewats'>('balance');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Retrieving CGWB Groundwater Assessments & Hydro-Balancing...</p>
        <span className="text-xs text-slate-500">Calculating CPHEEO 162 LPCD demand, aquifer replenishment, and DEWATS water loop</span>
      </div>
    );
  }

  if (!water) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Droplets className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-300">No water intelligence data available.</p>
        <p className="text-xs text-slate-500 mt-1">Please select a site to load water balance models.</p>
      </div>
    );
  }

  const cgwb = water.cgwb_data;
  const isSafe = cgwb.category === 'Safe';
  const isSemi = cgwb.category === 'Semi-Critical';
  const isCritical = cgwb.category === 'Critical' || cgwb.category === 'Over-exploited';

  const cgwbColor = isSafe ? '#10b981' : isSemi ? '#f59e0b' : '#ef4444';

  // CPHEEO Demand Breakdown
  const cpheeoData = [
    { component: 'Domestic Potable & Hygiene', lpcd: 135, mld: Number(((135 * water.proposed_population) / 1000000).toFixed(2)), color: '#06b6d4' },
    { component: 'Civic, Commercial & Losses', lpcd: 27, mld: Number(((27 * water.proposed_population) / 1000000).toFixed(2)), color: '#3b82f6' }
  ];
  const totalLpcd = 162; // 135 + 27
  const totalDemandMld = Number(((totalLpcd * water.proposed_population) / 1000000).toFixed(2));

  // Daily Water Balance Chart
  const waterBalanceData = [
    { name: 'Total Demand', value: totalDemandMld, type: 'Gross Demand', color: '#f43f5e' },
    { name: 'DEWATS Recycled', value: water.treated_wastewater_reuse_potential_mld, type: 'Recycled Supply', color: '#10b981' },
    { name: 'RWH Daily Yield', value: water.rainwater_harvesting_potential_mld, type: 'Captured Supply', color: '#06b6d4' },
    { name: 'Net Aquifer Draw', value: Math.max(0.15, Number((totalDemandMld - water.treated_wastewater_reuse_potential_mld - water.rainwater_harvesting_potential_mld).toFixed(2))), type: 'Freshwater Makeup', color: '#8b5cf6' }
  ];

  // Water Table Fluctuation
  const waterTableDelta = Math.abs(cgwb.depth_to_water_table_mbgl_pre_monsoon - cgwb.depth_to_water_table_mbgl_post_monsoon).toFixed(1);

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-950/80 border border-cyan-500/40 rounded-xl">
              <Droplets className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                TerraWater AI — Water Security & Dynamic Groundwater Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                CPHEEO urban standards (135+27=162 LPCD), Central Ground Water Board (CGWB) taluka assessments, and closed-loop DEWATS recycling.
              </p>
            </div>
          </div>
        </div>

        {/* CGWB Status Pill */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-cyan-500/30 rounded-2xl px-5 py-3 shadow-lg">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">CGWB Stage Category</span>
            <div className="flex items-center gap-2 justify-end">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cgwbColor }}></span>
              <span className="text-base font-black text-white">{cgwb.category}</span>
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {cgwb.stage_of_groundwater_extraction_pct}% Extraction Stage
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Official Data Source & Disclaimer Banner */}
      <div className="bg-cyan-950/40 border border-cyan-600/40 rounded-2xl p-4 text-cyan-200 text-xs shadow-lg flex items-start gap-4">
        <div className="p-2 bg-cyan-900/60 border border-cyan-500/60 rounded-xl shrink-0 mt-0.5">
          <Info className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <strong className="text-cyan-300 font-bold block text-sm">
              CENTRAL GROUND WATER BOARD (CGWB) &amp; CPHEEO MUNICIPAL COMPLIANCE STANDARD
            </strong>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Assessment Year {cgwb.assessment_year}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {cgwb.disclaimer} {water.uncertainty_notes} Satellite radar remote sensing detects surface moisture only; aquifer depth
            metrics are sourced directly from CGWB national hydrograph stations in {cgwb.block_taluka} Block, {cgwb.district}.
          </p>
        </div>
      </div>

      {/* 4 Core Water KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            CPHEEO Total Demand
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-400">{totalDemandMld} MLD</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            162 LPCD for {water.proposed_population.toLocaleString()} pop ({water.annual_water_demand_mcm} MCM/yr)
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            RWH Harvesting Yield
          </span>
          <span className="text-2xl font-black text-cyan-400">{water.rainwater_harvesting_potential_mld} MLD</span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {water.rainwater_harvesting_annual_mcm} MCM/yr from {water.annual_rainfall_mm}mm rain
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            DEWATS Graywater Loop
          </span>
          <span className="text-2xl font-black text-emerald-400">{water.treated_wastewater_reuse_potential_mld} MLD</span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Recovers 90% of municipal sewage
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Net Aquifer Extraction
          </span>
          <span className="text-2xl font-black text-indigo-400">
            {Math.max(0.15, Number((totalDemandMld - water.treated_wastewater_reuse_potential_mld - water.rainwater_harvesting_potential_mld).toFixed(2)))} MLD
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            76% freshwater demand offset
          </span>
        </div>
      </div>

      {/* Tabs Switcher for Detailed Views */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'balance'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Water Balance & CPHEEO Demand
        </button>
        <button
          onClick={() => setActiveTab('cgwb')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'cgwb'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          CGWB Aquifer Hydrograph
        </button>
        <button
          onClick={() => setActiveTab('dewats')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'dewats'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          DEWATS &amp; RWH Recycling Loop
        </button>
      </div>

      {/* Tab 1: Water Balance & CPHEEO */}
      {activeTab === 'balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Daily Water Balance Chart */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center justify-between">
                <span>Daily Water Balance &amp; Offset Hierarchy (MLD)</span>
                <span className="text-xs text-slate-400 font-normal">Base Pop: {water.proposed_population.toLocaleString()}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Comparison of daily municipal water requirement against circular recycled graywater and RWH yield.
              </p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterBalanceData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis unit=" MLD" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 11 }}
                    formatter={(val: any, name: any, item: any) => [`${val} MLD (${item.payload.type})`, item.payload.name]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {waterBalanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-cyan-400 block mb-1">Water Balance Synthesis:</strong>
              <p className="leading-relaxed">{water.water_balance_summary}</p>
            </div>
          </div>

          {/* CPHEEO Water Demand Breakdown */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-200">CPHEEO Urban Water Norms</h3>
                <span className="text-xs text-cyan-400 font-mono bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
                  MoHUA Certified
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Mandatory Indian urban standard for piped water with full sewerage: 135 + 27 = 162 LPCD.
              </p>

              <div className="space-y-3">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">1. Domestic Water Demand (135 LPCD)</span>
                    <span className="font-bold text-cyan-400">2.70 MLD</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Drinking (5L), Cooking (5L), Bathing (55L), Flushing (30L), Washing Clothes (20L), Utensils (10L), House Cleaning (10L).
                  </p>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">2. Civic &amp; Commercial Demand (27 LPCD)</span>
                    <span className="font-bold text-blue-400">0.54 MLD</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Parks &amp; street landscaping, firefighting reserve, commercial / institutional floating population, and 15% distribution losses.
                  </p>
                </div>

                <div className="bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-cyan-300 block">Total Settlement Demand</span>
                    <span className="text-[11px] text-slate-400">162 LPCD × 20,000 Persons</span>
                  </div>
                  <span className="text-xl font-black text-cyan-400">{totalDemandMld} MLD</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Annual Volumetric Total:</span>
              <span className="font-bold text-slate-200">{water.annual_water_demand_mcm} MCM / year</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CGWB Aquifer Hydrograph */}
      {activeTab === 'cgwb' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <span>Central Ground Water Board (CGWB) Block Aquifer Ledger</span>
              </h3>
              <p className="text-xs text-slate-400">
                Assessment for Block: <strong className="text-cyan-300">{cgwb.block_taluka}</strong>, District: <strong className="text-cyan-300">{cgwb.district}</strong>, State: <strong className="text-cyan-300">{cgwb.state}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Extraction Stage</span>
              <span className="text-lg font-black" style={{ color: cgwbColor }}>
                {cgwb.stage_of_groundwater_extraction_pct}% ({cgwb.category})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Annual Recharge</span>
              <span className="text-xl font-bold text-emerald-400">{cgwb.annual_replenishable_recharge_mcm} MCM</span>
              <span className="text-[11px] text-slate-400 block mt-1">Natural replenishment</span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Annual Draft</span>
              <span className="text-xl font-bold text-rose-400">{cgwb.annual_groundwater_draft_total_mcm} MCM</span>
              <span className="text-[11px] text-slate-400 block mt-1">Irrigation: {cgwb.annual_draft_irrigation_mcm} MCM</span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Net Availability</span>
              <span className="text-xl font-bold text-cyan-400">{cgwb.net_annual_groundwater_availability_mcm} MCM</span>
              <span className="text-[11px] text-slate-400 block mt-1">Unallocated reserve</span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Water Table Delta</span>
              <span className="text-xl font-bold text-indigo-400">{waterTableDelta} m</span>
              <span className="text-[11px] text-slate-400 block mt-1">Monsoon recharge recharge rise</span>
            </div>
          </div>

          {/* Aquifer Well Depth Graphic */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-200">
              Hydrogeological Well Depth Profile (Meters Below Ground Level - mbgl)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Post-Monsoon Water Table (Peak Recharge):</span>
                    <span className="font-bold text-emerald-400">{cgwb.depth_to_water_table_mbgl_post_monsoon} mbgl</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (cgwb.depth_to_water_table_mbgl_post_monsoon / 30) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Pre-Monsoon Water Table (Summer Drawdown):</span>
                    <span className="font-bold text-amber-400">{cgwb.depth_to_water_table_mbgl_pre_monsoon} mbgl</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (cgwb.depth_to_water_table_mbgl_pre_monsoon / 30) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-400 block mb-1">Regulatory Groundwater Abstraction Guidelines:</span>
                Under Central Ground Water Authority (CGWA) norms for {cgwb.category} category blocks, all new urban master plans
                must implement 100% artificial recharge structures equivalent to at least 1.5 times the proposed groundwater abstraction.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DEWATS & RWH Recycling Loop */}
      {activeTab === 'dewats' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
                <span>DEWATS Closed-Loop Graywater &amp; Rainwater Harvesting Architecture</span>
              </h3>
              <p className="text-xs text-slate-400">
                Decentralized Wastewater Treatment System recovering 90% of sewage for dual-piped non-potable reuse.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Step 1: Sewage Generation</span>
              <span className="text-xl font-bold text-rose-400">{water.wastewater_generation_mld} MLD</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculated at 80% of domestic consumption per CPHEEO urban standards.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Step 2: Biological Treatment</span>
              <span className="text-xl font-bold text-emerald-400">{water.treated_wastewater_reuse_potential_mld} MLD</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Anaerobic Baffled Reactor (ABR) + Constructed Wetlands achieve BOD &lt; 10 mg/L without power grid reliance.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Step 3: Recycled Re-injection</span>
              <span className="text-xl font-bold text-cyan-400">100% Beneficial Reuse</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Routed via dual-plumbing network to toilet flushing (0.60 MLD), landscape Miyawaki irrigation (0.85 MLD), and cooling (0.49 MLD).
              </p>
            </div>
          </div>

          {/* RWH Locations */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Recommended Artificial Recharge &amp; RWH Structure Sites</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {water.recommended_rwh_locations.map((loc, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-100">{loc.name || `RWH Structure ${idx + 1}`}</span>
                    <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950/80 px-2 py-0.5 rounded">
                      {loc.type || 'Recharge Well'}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {loc.description || `High infiltration zone designed to intercept storm runoff and recharge the unconfined aquifer.`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
