import React, { useState } from 'react';
import { 
  TrendingUp, 
  SlidersHorizontal, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Droplet, 
  Users, 
  Trees, 
  Scale,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { FutureSimulationResult, ScenarioSimulation } from '../types';

interface FutureSimulationViewProps {
  simulationData: FutureSimulationResult | null;
  onRunSimulation: (params: { pop_growth_rate_pct: number; water_lpcd: number; re_growth_rate_pct: number }) => void;
  isLoading: boolean;
}

export const FutureSimulationView: React.FC<FutureSimulationViewProps> = ({
  simulationData,
  onRunSimulation,
  isLoading
}) => {
  const [growthRate, setGrowthRate] = useState<number>(2.2);
  const [waterLpcd, setWaterLpcd] = useState<number>(135.0);
  const [reGrowth, setReGrowth] = useState<number>(3.5);
  const [selectedMetric, setSelectedMetric] = useState<'population' | 'water' | 'energy' | 'co2' | 'resilience'>('population');

  const scenarios: ScenarioSimulation[] = simulationData?.scenarios || [];

  // Transform data for Recharts across 10, 20, 50, 100 years
  const chartData = [10, 20, 50, 100].map((yr) => {
    const item: any = { year: `${yr} Years` };
    scenarios.forEach((sc) => {
      const milestone = sc.milestones.find((m) => m.year === yr);
      if (milestone) {
        if (selectedMetric === 'population') item[sc.scenario_name] = milestone.population;
        else if (selectedMetric === 'water') item[sc.scenario_name] = milestone.water_demand_mld;
        else if (selectedMetric === 'energy') item[sc.scenario_name] = milestone.energy_demand_gwh;
        else if (selectedMetric === 'co2') item[sc.scenario_name] = milestone.co2_emissions_net_kt;
        else if (selectedMetric === 'resilience') item[sc.scenario_name] = milestone.resilience_score;
      }
    });
    return item;
  });

  const scenarioColors: Record<string, string> = {
    "Sustainable Development (Recommended)": "#10b981",
    "Business As Usual (Baseline)": "#94a3b8",
    "High Population In-Migration Spurt": "#f43f5e",
    "Severe Climate & Water-Stressed Future": "#f59e0b",
    "Climate-Resilient Smart Circular Haven": "#06b6d4"
  };

  const metricUnits: Record<string, string> = {
    population: 'Inhabitants',
    water: 'MLD',
    energy: 'GWh / Year',
    co2: 'kt CO2 / Year',
    resilience: 'Score / 100'
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>MODULE I &bull; TERRAFUTURE AI MULTI-DECADAL SIMULATOR</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Long-Term City Future Simulation (10, 20, 50 & 100 Years)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulating demographic expansion, water mass-balance stress, clean energy transition, and climate resilience under 5 distinct trajectories.
        </p>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-start space-x-3 text-xs text-slate-300">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-semibold">Simulation Methodology Notice:</strong>
          <p className="leading-relaxed">
            {simulationData?.simulation_disclaimer || "Multi-decadal projections are exploratory systemic simulation models based on demographic compounding, resource mass-balance equations, and climate IPCC RCP 4.5/8.5 trajectories. They are scenario planning aids, not guaranteed deterministic forecasts."}
          </p>
        </div>
      </div>

      {/* Interactive Parameter Sliders Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Interactive Sensitivity Controls</h2>
          </div>
          <button
            onClick={() => onRunSimulation({ pop_growth_rate_pct: growthRate, water_lpcd: waterLpcd, re_growth_rate_pct: reGrowth })}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Re-Computing...' : 'Re-Run Multi-Decadal Simulation'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Pop Growth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Annual Population Growth:</span>
              <strong className="text-cyan-400 font-mono text-sm">{growthRate}% / yr</strong>
            </div>
            <input
              type="range"
              min="0.8"
              max="4.5"
              step="0.1"
              value={growthRate}
              onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.8% (Organic)</span>
              <span>2.2% (Moderate)</span>
              <span>4.5% (High In-Migration)</span>
            </div>
          </div>

          {/* Slider 2: Water Demand */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Per-Capita Water Consumption:</span>
              <strong className="text-blue-400 font-mono text-sm">{waterLpcd} LPCD</strong>
            </div>
            <input
              type="range"
              min="90"
              max="200"
              step="5"
              value={waterLpcd}
              onChange={(e) => setWaterLpcd(parseFloat(e.target.value))}
              className="w-full accent-blue-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>90 (Eco Rationing)</span>
              <span>135 (CPHEEO Urban)</span>
              <span>200 (Intensive)</span>
            </div>
          </div>

          {/* Slider 3: Clean Energy Expansion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Annual Renewable Expansion:</span>
              <strong className="text-emerald-400 font-mono text-sm">{reGrowth}% / yr</strong>
            </div>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.5"
              value={reGrowth}
              onChange={(e) => setReGrowth(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1.0% (Gradual)</span>
              <span>3.5% (Targeted)</span>
              <span>7.0% (Aggressive)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Scenario Comparison Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center">
              <span>Scenario Comparison: {selectedMetric.toUpperCase()} ({metricUnits[selectedMetric]})</span>
            </h2>
            <p className="text-xs text-slate-400">Projections across 10, 20, 50, and 100-year milestones</p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'population', label: 'Population' },
              { id: 'water', label: 'Water Demand' },
              { id: 'energy', label: 'Energy Demand' },
              { id: 'co2', label: 'Net CO2' },
              { id: 'resilience', label: 'Resilience Score' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id as any)}
                className={`px-3 py-1 rounded-lg transition ${
                  selectedMetric === m.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
              />
              <Legend verticalAlign="top" height={36} />
              {scenarios.map((sc) => (
                <Line
                  key={sc.scenario_id}
                  name={sc.scenario_name}
                  type="monotone"
                  dataKey={sc.scenario_name}
                  stroke={scenarioColors[sc.scenario_name] || '#38bdf8'}
                  strokeWidth={sc.scenario_name.includes('Sustainable') ? 3.5 : 2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Descriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.map((sc) => {
          const m100 = sc.milestones.find((m) => m.year === 100);
          return (
            <div
              key={sc.scenario_id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: scenarioColors[sc.scenario_name] || '#06b6d4' }}
                  />
                  <h3 className="font-bold text-sm text-white">{sc.scenario_name}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{sc.description}</p>
              </div>

              {m100 && (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-800 text-slate-300">
                  <div className="p-2 bg-slate-950/60 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">100-Yr Population:</span>
                    <strong className="text-white">{m100.population.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Resilience Index:</span>
                    <strong className="text-emerald-400">{m100.resilience_score}/100</strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
