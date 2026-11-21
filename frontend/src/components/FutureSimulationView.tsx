import React, { useState, useEffect } from 'react';
import {
  Clock, TrendingUp, AlertTriangle, ShieldCheck,
  Zap, Droplets, Trash2, Trees, Leaf, RefreshCw,
  Sliders, Calendar, ArrowRight, Gauge, Activity,
  Layers, CheckCircle2, ChevronRight, BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { ScenarioSimulationResult, SimulationRequest, FutureYearProjection } from '../types';
import { simulateFutureCity } from '../api';

interface FutureSimulationViewProps {
  basePopulation: number;
}

export const FutureSimulationView: React.FC<FutureSimulationViewProps> = ({ basePopulation }) => {
  const [scenarioType, setScenarioType] = useState<string>('Sustainable Development');
  const [selectedMilestoneOffset, setSelectedMilestoneOffset] = useState<number>(20); // 10, 20, 50, 100 years
  const [growthRate, setGrowthRate] = useState<number>(1.8);
  const [lpcd, setLpcd] = useState<number>(135.0);
  const [rainVar, setRainVar] = useState<number>(0.0);
  const [reCap, setReCap] = useState<number>(25.0);

  const [simResult, setSimResult] = useState<ScenarioSimulationResult | null>(null);
  const [comparisonResults, setComparisonResults] = useState<Record<string, ScenarioSimulationResult>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [activeChartTab, setActiveChartTab] = useState<'demographics_water' | 'energy_emissions' | 'stress_canopy' | 'comparison_matrix'>('demographics_water');

  const scenarios = [
    { id: 'Sustainable Development', label: 'Sustainable Development', desc: 'Circular water, 100% RE microgrid, high green cover' },
    { id: 'Business as Usual', label: 'Business as Usual (BAU)', desc: 'Linear expansion, fossil grid imports, aquifer draw' },
    { id: 'High Growth', label: 'High Growth (Boomtown)', desc: 'Industrial migration, rapid density, infrastructure strain' },
    { id: 'Water Stressed', label: 'Water-Stressed Shock', desc: '-25% rainfall drought cycles, aquifer depletion testing' },
    { id: 'Resilient', label: 'Net-Zero Resilient', desc: 'Biophilic sanctuary, hyper-efficient circular loops' }
  ];

  const milestones = [10, 20, 50, 100];

  const runSim = async () => {
    setLoading(true);
    try {
      const res = await simulateFutureCity('active_session', {
        base_population: basePopulation,
        annual_population_growth_rate: growthRate,
        per_capita_water_consumption_lpcd: lpcd,
        rainfall_variation_pct: rainVar,
        renewable_capacity_mw: reCap,
        scenario_type: scenarioType
      });
      setSimResult(res);

      // Also compute comparison snapshot for all scenarios at selected milestone
      const compMap: Record<string, ScenarioSimulationResult> = {};
      await Promise.all(
        scenarios.map(async (sc) => {
          try {
            const compRes = await simulateFutureCity('active_session', {
              base_population: basePopulation,
              annual_population_growth_rate: sc.id === 'High Growth' ? 3.4 : sc.id === 'Water Stressed' ? 1.5 : sc.id === 'Resilient' ? 1.6 : sc.id === 'Business as Usual' ? 2.2 : 1.8,
              per_capita_water_consumption_lpcd: lpcd,
              rainfall_variation_pct: sc.id === 'Water Stressed' ? -25 : rainVar,
              renewable_capacity_mw: sc.id === 'Resilient' ? 35 : reCap,
              scenario_type: sc.id
            });
            compMap[sc.id] = compRes;
          } catch (e) {
            // ignore comparison errors
          }
        })
      );
      setComparisonResults(compMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSim();
  }, [scenarioType, growthRate, lpcd, rainVar, reCap, basePopulation]);

  // Active projection at selected milestone
  const activeProjection: FutureYearProjection | undefined = simResult?.projections.find(
    (p) => p.year_offset === selectedMilestoneOffset
  ) || simResult?.projections[1];

  const baseYear = 2026;
  const currentCalendarYear = baseYear + selectedMilestoneOffset;

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-950/80 border border-indigo-500/40 rounded-xl">
              <Clock className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                TerraFuture AI — Multi-Decadal Urban Trajectory Simulation
              </h2>
              <p className="text-xs text-slate-400">
                10, 20, 50, and 100-year demographic compounding, groundwater extraction, energy transition, and climate stress.
              </p>
            </div>
          </div>
        </div>

        {/* Scenario Selector Pills */}
        <div className="flex flex-wrap gap-1.5">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenarioType(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                scenarioType === s.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Time Slider / Decadal Milestone Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Multi-Decadal Horizon Time Slider (10, 20, 50, 100 Years)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select or scrub to view predicted municipal carrying capacity and infrastructure stress at specific planning epochs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Active Horizon:</span>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-3 py-1 rounded-full">
              +{selectedMilestoneOffset} Years (Year {currentCalendarYear})
            </span>
          </div>
        </div>

        {/* Milestone Buttons & Visual Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {milestones.map((m) => {
            const isSelected = selectedMilestoneOffset === m;
            const year = baseYear + m;
            return (
              <button
                key={m}
                onClick={() => setSelectedMilestoneOffset(m)}
                className={`p-3.5 rounded-2xl border transition text-left cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>
                    +{m} Years
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Epoch</span>
                </div>
                <span className="text-lg font-black text-white block">Year {year}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {m === 10 ? 'Initial TOD Stabilization' : m === 20 ? 'Design Capacity Horizon' : m === 50 ? 'Long-Term Mature City' : 'Century Legacy Horizon'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Snapshot Cards for the Active Horizon Milestone */}
      {activeProjection && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Projected Pop</span>
            <span className="text-xl font-black text-cyan-400">
              {activeProjection.projected_population.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {((activeProjection.projected_population / basePopulation) * 100 - 100).toFixed(0)}% growth
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Water Demand</span>
            <span className="text-xl font-black text-blue-400">{activeProjection.daily_water_demand_mld} MLD</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Daily municipal need</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Aquifer Stage</span>
            <span className={`text-xl font-black ${activeProjection.groundwater_extraction_stage_pct > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeProjection.groundwater_extraction_stage_pct}%
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {activeProjection.groundwater_extraction_stage_pct > 100 ? 'Over-exploited' : 'Sustainable recharge'}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Energy Demand</span>
            <span className="text-xl font-black text-yellow-400">{activeProjection.daily_energy_demand_mwh} MWh</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Solar Gen: {activeProjection.renewable_generation_mwh} MWh</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Solid Waste</span>
            <span className="text-xl font-black text-slate-200">{activeProjection.solid_waste_generated_tpd} TPD</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Tons per day</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">CO₂ Offset</span>
            <span className="text-xl font-black text-emerald-400">{activeProjection.cumulative_co2_offset_kt} kt</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Cumulative clean offset</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Stress Index</span>
            <span className={`text-xl font-black ${activeProjection.infrastructure_stress_index > 75 ? 'text-rose-400' : activeProjection.infrastructure_stress_index > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {activeProjection.infrastructure_stress_index} / 100
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Infrastructure load</span>
          </div>
        </div>
      )}

      {/* Interactive Simulation Levers & Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Interactive Simulation Levers &amp; Climate Forcings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Annual Population Growth:</span>
              <span className="text-cyan-400 font-bold">{growthRate}% / yr</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.5"
              step="0.1"
              value={growthRate}
              onChange={(e) => setGrowthRate(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Default: 1.8% (Sustainable) to 3.4% (Boomtown)</span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Per-Capita Water Consumption:</span>
              <span className="text-emerald-400 font-bold">{lpcd} LPCD</span>
            </div>
            <input
              type="range"
              min="90"
              max="200"
              step="5"
              value={lpcd}
              onChange={(e) => setLpcd(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">CPHEEO baseline: 135 LPCD</span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Monsoon Rainfall Variance:</span>
              <span className="text-blue-400 font-bold">{rainVar > 0 ? `+${rainVar}%` : `${rainVar}%`}</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={rainVar}
              onChange={(e) => setRainVar(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Drought anomaly sensitivity testing</span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Renewable Energy Capacity:</span>
              <span className="text-yellow-400 font-bold">{reCap} MW</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={reCap}
              onChange={(e) => setReCap(Number(e.target.value))}
              className="w-full accent-yellow-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Ground solar + rooftop PV scaling</span>
          </div>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveChartTab('demographics_water')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeChartTab === 'demographics_water'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Demographics &amp; Water Security
        </button>
        <button
          onClick={() => setActiveChartTab('energy_emissions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeChartTab === 'energy_emissions'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Clean Energy &amp; CO₂ Trajectory
        </button>
        <button
          onClick={() => setActiveChartTab('stress_canopy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeChartTab === 'stress_canopy'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Canopy Cover &amp; Stress Index
        </button>
        <button
          onClick={() => setActiveChartTab('comparison_matrix')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeChartTab === 'comparison_matrix'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          5-Scenario Comparative Matrix (+{selectedMilestoneOffset} Yrs)
        </button>
      </div>

      {/* Chart Views */}
      {simResult && (
        <>
          {activeChartTab === 'demographics_water' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demographics */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  Demographic Compounding Projection (10 to 100 Years)
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  Starting Population: {basePopulation.toLocaleString()} | Growth Rate: {growthRate}% / yr
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simResult.projections}>
                      <defs>
                        <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="calendar_year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 12 }}
                        formatter={(val: any) => [`${val.toLocaleString()} Persons`, 'Projected Population']}
                      />
                      <Area type="monotone" dataKey="projected_population" name="Population" stroke="#06b6d4" strokeWidth={3} fill="url(#popGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Water Demand vs GW Stage */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  Daily Water Demand (MLD) vs Groundwater Stage (%)
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  Dashed line shows aquifer extraction stress (&gt; 100% indicates severe depletion)
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simResult.projections}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="calendar_year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis yAxisId="left" unit=" MLD" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 180]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line yAxisId="left" type="monotone" dataKey="daily_water_demand_mld" name="Water Demand (MLD)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line yAxisId="right" type="monotone" dataKey="groundwater_extraction_stage_pct" name="Groundwater Stage (%)" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeChartTab === 'energy_emissions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Energy Generation vs Demand */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  Clean Energy Generation vs Total Electricity Demand (MWh/day)
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  Evaluating long-term net-zero microgrid export balance
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={simResult.projections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="calendar_year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis unit=" MWh" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="renewable_generation_mwh" name="Renewable Gen (MWh)" fill="#eab308" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="daily_energy_demand_mwh" name="Electricity Demand (MWh)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CO2 Offset & Solid Waste */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  Cumulative CO₂ Offset (Kilotonnes) &amp; Solid Waste (TPD)
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  Carbon neutrality trajectory and landfill diversion volume
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simResult.projections}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="calendar_year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis yAxisId="left" unit=" kt" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" unit=" TPD" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line yAxisId="left" type="monotone" dataKey="cumulative_co2_offset_kt" name="CO₂ Offset (kt)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                      <Line yAxisId="right" type="monotone" dataKey="solid_waste_generated_tpd" name="Solid Waste (TPD)" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeChartTab === 'stress_canopy' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Infrastructure Stress Index */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  Infrastructure Stress Index (0 to 100)
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  Composite index combining road congestion, water deficit, power load, and waste logistics
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simResult.projections}>
                      <defs>
                        <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="calendar_year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 12 }} />
                      <Area type="monotone" dataKey="infrastructure_stress_index" name="Stress Index" stroke="#f43f5e" strokeWidth={3} fill="url(#stressGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Green Canopy Cover % */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  Green Canopy Cover Progression (%)
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  Miyawaki maturation and biophilic urban policy impact
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simResult.projections}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="calendar_year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis domain={[0, 60]} unit="%" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 12 }} />
                      <Line type="monotone" dataKey="green_canopy_cover_pct" name="Canopy Cover (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeChartTab === 'comparison_matrix' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <span>5-Scenario Multi-Parameter Comparison Matrix at Year {currentCalendarYear} (+{selectedMilestoneOffset} Years)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive comparative trade-off across BAU, Sustainable, Boomtown, Water Stress, and Resilient paradigms.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto bg-slate-950/70 rounded-xl border border-slate-800 p-3">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                      <th className="pb-2.5">Scenario</th>
                      <th className="pb-2.5">Growth Rate</th>
                      <th className="pb-2.5">Projected Pop</th>
                      <th className="pb-2.5">Water Demand</th>
                      <th className="pb-2.5">GW Stage</th>
                      <th className="pb-2.5">RE Gen vs Demand</th>
                      <th className="pb-2.5">Solid Waste</th>
                      <th className="pb-2.5">Canopy Cover</th>
                      <th className="pb-2.5">Stress Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {scenarios.map((sc) => {
                      const comp = comparisonResults[sc.id];
                      const proj = comp?.projections.find((p) => p.year_offset === selectedMilestoneOffset);
                      const isCurrentActive = sc.id === scenarioType;

                      return (
                        <tr
                          key={sc.id}
                          className={`hover:bg-slate-800/40 transition ${
                            isCurrentActive ? 'bg-indigo-950/40 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2.5 flex items-center gap-2">
                            {isCurrentActive && <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></span>}
                            <div>
                              <span className="text-slate-100 block">{sc.label}</span>
                              <span className="text-[10px] text-slate-400 block">{sc.desc}</span>
                            </div>
                          </td>
                          <td className="py-2.5 font-mono">{comp?.population_growth_rate_pct || '--'}%</td>
                          <td className="py-2.5 font-bold text-cyan-400">
                            {proj ? proj.projected_population.toLocaleString() : '--'}
                          </td>
                          <td className="py-2.5 text-blue-400">{proj ? `${proj.daily_water_demand_mld} MLD` : '--'}</td>
                          <td className="py-2.5 font-bold">
                            {proj ? (
                              <span className={proj.groundwater_extraction_stage_pct > 100 ? 'text-rose-400' : 'text-emerald-400'}>
                                {proj.groundwater_extraction_stage_pct}%
                              </span>
                            ) : '--'}
                          </td>
                          <td className="py-2.5 text-yellow-400">
                            {proj ? `${proj.renewable_generation_mwh} / ${proj.daily_energy_demand_mwh} MWh` : '--'}
                          </td>
                          <td className="py-2.5 text-slate-300">{proj ? `${proj.solid_waste_generated_tpd} TPD` : '--'}</td>
                          <td className="py-2.5 text-emerald-400">{proj ? `${proj.green_canopy_cover_pct}%` : '--'}</td>
                          <td className="py-2.5 font-bold">
                            {proj ? (
                              <span className={proj.infrastructure_stress_index > 70 ? 'text-rose-400' : proj.infrastructure_stress_index > 45 ? 'text-amber-400' : 'text-emerald-400'}>
                                {proj.infrastructure_stress_index} / 100
                              </span>
                            ) : '--'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Critical Milestone Narrative & Policy Intervention Triggers */}
      {simResult && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Decadal Milestone Narrative &amp; Strategic Policy Interventions ({simResult.scenario_name})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simResult.critical_milestone_notes.map((note, idx) => (
              <div key={idx} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
