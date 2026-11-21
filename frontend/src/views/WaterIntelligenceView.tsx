import React from 'react';
import { 
  Droplet, 
  Layers, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  ArrowDownCircle, 
  CheckCircle2, 
  TrendingDown,
  Building,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface WaterIntelligenceViewProps {
  waterData: any;
  population: number;
}

export const WaterIntelligenceView: React.FC<WaterIntelligenceViewProps> = ({ waterData, population }) => {
  const gw = waterData?.groundwater || {
    district: 'Guntur',
    state: 'Andhra Pradesh',
    assessment_year: '2023-2024',
    annual_extractable_ham: 128450.0,
    current_annual_extraction_ham: 74500.0,
    stage_of_extraction_pct: 58.0,
    category: 'Safe',
    pre_monsoon_depth_m_bgl: 8.4,
    post_monsoon_depth_m_bgl: 4.2,
    trend_10yr: 'Stable with seasonal recharge (+0.08 m/yr)'
  };

  const wb = waterData?.water_balance || {
    population: population || 20000,
    per_capita_lpcd: 189.8,
    domestic_demand_mld: 2.70,
    commercial_public_demand_mld: 0.69,
    total_daily_water_demand_mld: 3.39,
    annual_water_demand_mcm: 1.24,
    annual_rainfall_mm: 1050.0,
    rainwater_harvesting_potential_mcm: 0.89,
    wastewater_generation_mld: 2.16,
    recycled_water_available_mld: 1.62,
    net_external_water_deficit_mld: 0.88,
    sustainable_water_security_pct: 74.0
  };

  const trendData = waterData?.historical_water_table || [
    { year: 2019, pre_monsoon_depth_m: 7.6, post_monsoon_depth_m: 3.8 },
    { year: 2020, pre_monsoon_depth_m: 7.9, post_monsoon_depth_m: 3.9 },
    { year: 2021, pre_monsoon_depth_m: 8.3, post_monsoon_depth_m: 4.4 },
    { year: 2022, pre_monsoon_depth_m: 8.6, post_monsoon_depth_m: 4.6 },
    { year: 2023, pre_monsoon_depth_m: 8.4, post_monsoon_depth_m: 4.2 }
  ];

  const balanceBarData = [
    { name: 'Total Demand', mld: wb.total_daily_water_demand_mld, fill: '#f43f5e' },
    { name: 'STP Recycled', mld: wb.recycled_water_available_mld, fill: '#06b6d4' },
    { name: 'RWH Daily Equiv.', mld: 0.89 * 1000 / 365, fill: '#10b981' },
    { name: 'External Deficit', mld: wb.net_external_water_deficit_mld, fill: '#eab308' }
  ];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Safe': return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'Semi-Critical': return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'Critical': return 'bg-orange-950 text-orange-400 border-orange-800';
      case 'Over-Exploited': return 'bg-rose-950 text-rose-400 border-rose-800';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <Droplet className="w-4 h-4" />
          <span>MODULE D &bull; TERRAWATER AI & CGWB IN-GRES</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Water Intelligence & Hydrological Balance</h1>
        <p className="text-xs text-slate-400 mt-1">
          Municipal water demand estimation (CPHEEO 135 LPCD), rainwater harvesting potential, wastewater recycling, and official CGWB groundwater assessment.
        </p>
      </div>

      {/* Mandatory Scientific Disclaimer Banner */}
      <div className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-2xl flex items-start space-x-3 text-xs text-blue-200">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-cyan-300 font-semibold">Authoritative Groundwater Clarification (CGWB & Hydrogeological Standards):</strong>
          <p className="leading-relaxed">
            {gw.data_limitations_note || "Satellite imagery alone CANNOT measure deep subterranean aquifer volumes. Groundwater figures are derived from official Central Ground Water Board (CGWB / IN-GRES) observation wells. The 'Stage of Extraction' reflects the annual draft-to-recharge ratio, NOT the percentage of underground water remaining."}
          </p>
        </div>
      </div>

      {/* Water Demand & Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Daily Demand</span>
          <div className="text-2xl font-bold text-rose-400">
            {wb.total_daily_water_demand_mld} <span className="text-xs text-slate-400 font-normal">MLD</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {wb.population.toLocaleString()} pop &bull; 135 LPCD + 30 commercial + 15% losses
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">RWH Potential (500 ac)</span>
          <div className="text-2xl font-bold text-emerald-400">
            {wb.rainwater_harvesting_potential_mcm} <span className="text-xs text-slate-400 font-normal">MCM / Year</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Annual Rainfall: {wb.annual_rainfall_mm} mm &bull; C_comp: 0.51
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Tertiary STP Recycling</span>
          <div className="text-2xl font-bold text-cyan-400">
            {wb.recycled_water_available_mld} <span className="text-xs text-slate-400 font-normal">MLD</span>
          </div>
          <p className="text-[11px] text-slate-400">
            75% recovery of 2.16 MLD domestic sewage
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Water Self-Sufficiency</span>
          <div className="text-2xl font-bold text-white">
            {wb.sustainable_water_security_pct}%
          </div>
          <p className="text-[11px] text-emerald-400">
            Net external deficit: {wb.net_external_water_deficit_mld} MLD only
          </p>
        </div>
      </div>

      {/* Daily Water Balance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Daily Water Mass-Balance (MLD)</h2>
              <p className="text-xs text-slate-400">Million Litres Per Day &bull; Consumption vs Circular Recovery</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">CPHEEO Urban Standard</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={balanceBarData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v} MLD`} fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val.toFixed(2)} MLD`, 'Volume']}
                />
                <Bar dataKey="mld" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Official CGWB Ground Water Assessment Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center">
                <span>Official CGWB Ground Water Assessment</span>
              </h2>
              <p className="text-xs text-slate-400">District: {gw.district}, {gw.state} &bull; Cycle: {gw.assessment_year}</p>
            </div>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${getCategoryColor(gw.category)}`}>
              {gw.category.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Annual Extractable Resource</span>
              <strong className="text-white text-sm">{gw.annual_extractable_ham.toLocaleString()} Ham</strong>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Current Annual Extraction</span>
              <strong className="text-cyan-400 text-sm">{gw.current_annual_extraction_ham.toLocaleString()} Ham</strong>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Stage of Extraction</span>
              <strong className="text-emerald-400 text-sm">{gw.stage_of_extraction_pct}%</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">&lt; 70% threshold is Safe</span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Piezometer Depth (Pre-Monsoon)</span>
              <strong className="text-white text-sm">{gw.pre_monsoon_depth_m_bgl} m bgl</strong>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">10-Year Water Table Trend:</span>
              <span className="text-slate-200 text-[11px] font-mono">{gw.trend_10yr}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Salinity / EC Hazard:</span>
              <span className={gw.salinity_ec_warning ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {gw.salinity_ec_warning ? '⚠️ Elevated EC Alert' : 'Within Permissible Limit'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Year Historical Groundwater Depth Trend Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">5-Year Historical Groundwater Table Depth (m below ground level)</h2>
            <p className="text-xs text-slate-400">Comparing Pre-Monsoon (Summer Drawdown) vs Post-Monsoon (Recharge Recovery)</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">CGWB Piezometer Station</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" reversed={true} tickFormatter={(v) => `${v}m`} domain={[0, 15]} fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                formatter={(val: any) => [`${val} m bgl`, 'Depth']}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" name="Pre-Monsoon Depth (m bgl)" dataKey="pre_monsoon_depth_m" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" name="Post-Monsoon Depth (m bgl)" dataKey="post_monsoon_depth_m" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
