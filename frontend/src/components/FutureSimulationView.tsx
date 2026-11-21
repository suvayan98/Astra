import React, { useState, useEffect } from 'react';
import {
  Clock, TrendingUp, AlertTriangle, ShieldCheck,
  Zap, Droplets, Trash2, Trees, Leaf, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import { ScenarioSimulationResult, SimulationRequest } from '../types';
import { simulateFutureCity } from '../api';

interface FutureSimulationViewProps {
  basePopulation: number;
}

export const FutureSimulationView: React.FC<FutureSimulationViewProps> = ({ basePopulation }) => {
  const [scenarioType, setScenarioType] = useState<string>('Sustainable Development');
  const [growthRate, setGrowthRate] = useState<number>(2.0);
  const [lpcd, setLpcd] = useState<number>(135.0);
  const [rainVar, setRainVar] = useState<number>(0.0);
  const [reCap, setReCap] = useState<number>(25.0);

  const [simResult, setSimResult] = useState<ScenarioSimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSim();
  }, [scenarioType, growthRate, lpcd, rainVar, reCap, basePopulation]);

  const scenarios = [
    { id: 'Sustainable Development', label: 'Sustainable Development' },
    { id: 'Business as Usual', label: 'Business as Usual (BAU)' },
    { id: 'High Growth', label: 'High Growth (Boomtown)' },
    { id: 'Water Stressed', label: 'Water-Stressed Shock' },
    { id: 'Resilient', label: 'Net-Zero Resilient' }
  ];

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-100">
              TerraFuture AI — Long-Term Multi-Decadal Urban Simulation
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Simulate 10, 20, 50, and 100-year demographic, hydrological, energy, and climate trajectories.
          </p>
        </div>

        {/* Scenario Pills */}
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

      {/* Interactive Simulation Sliders */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Adjust Simulation Levers & Climate Forcings</h3>

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
          </div>
        </div>
      </div>

      {/* Projection Charts Grid */}
      {simResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Population Projection Curve */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 mb-1">Demographic Compounding Projection (10 to 100 Years)</h3>
            <p className="text-xs text-slate-400 mb-4">Starting Population: {basePopulation.toLocaleString()}</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simResult.projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="calendar_year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 12 }} />
                  <Line type="monotone" dataKey="projected_population" name="Population" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Water Demand (MLD) & Groundwater Stage (%) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 mb-1">Daily Water Demand (MLD) vs Groundwater Stage (%)</h3>
            <p className="text-xs text-slate-400 mb-4">Evaluates whether aquifer extraction crosses sustainable recharge</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simResult.projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="calendar_year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="left" unit=" MLD" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 160]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="left" type="monotone" dataKey="daily_water_demand_mld" name="Water Demand (MLD)" stroke="#3b82f6" strokeWidth={2.5} />
                  <Line yAxisId="right" type="monotone" dataKey="groundwater_extraction_stage_pct" name="Groundwater Stage (%)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Narrative Timeline */}
      {simResult && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">
            Decadal Infrastructure Milestone Projections ({simResult.scenario_name})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {simResult.projections.map((p, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                    +{p.year_offset} Years ({p.calendar_year})
                  </span>
                  <span className="text-xs font-black text-cyan-400">
                    {p.projected_population.toLocaleString()} Pop
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Demand:</span>
                    <span className="font-semibold">{p.daily_water_demand_mld} MLD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GW Stage:</span>
                    <span className={`font-semibold ${p.groundwater_extraction_stage_pct > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {p.groundwater_extraction_stage_pct}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Energy:</span>
                    <span className="font-semibold text-yellow-400">{p.daily_energy_demand_mwh} MWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Solid Waste:</span>
                    <span className="font-semibold text-slate-200">{p.solid_waste_generated_tpd} TPD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CO2 Offset:</span>
                    <span className="font-semibold text-emerald-400">{p.cumulative_co2_offset_kt} kt</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Narrative Notes */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-1.5">
            {simResult.critical_milestone_notes.map((note, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{note}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
