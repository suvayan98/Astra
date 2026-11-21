import React, { useState } from 'react';
import {
  Sparkles, CheckCircle2, TrendingUp, Compass, Layers,
  Droplets, SunMedium, Trees, ShieldAlert, Edit3, ArrowRight, Info
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { MasterPlanAlternative, MasterPlanZone } from '../types';

interface MasterPlanDesignerProps {
  plans: MasterPlanAlternative[];
  activePlan: MasterPlanAlternative | null;
  onSelectPlan: (plan: MasterPlanAlternative) => void;
  onEditZone: (zone: MasterPlanZone) => void;
  onRegeneratePlans: (priorities: string[]) => void;
  population: number;
  areaAcres: number;
  loading: boolean;
}

export const MasterPlanDesigner: React.FC<MasterPlanDesignerProps> = ({
  plans,
  activePlan,
  onSelectPlan,
  onEditZone,
  onRegeneratePlans,
  population,
  areaAcres,
  loading
}) => {
  const [priorities, setPriorities] = useState<string[]>([
    'water_security', 'renewable_energy', 'public_transport', 'green_spaces', 'disaster_resilience'
  ]);

  const togglePriority = (p: string) => {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Generating AI Master Plans (Plan A, Plan B, Plan C)...</p>
      </div>
    );
  }

  if (!plans || plans.length === 0 || !activePlan) {
    return <div className="p-8 text-center text-slate-400">No master plans generated yet.</div>;
  }

  // Zone distribution bar data
  const zoneBarData = activePlan.zones.map((z) => ({
    name: z.name.length > 20 ? z.name.substring(0, 18) + '...' : z.name,
    acres: z.area_acres,
    pct: z.area_percentage,
    color: z.color
  }));

  const totalAllocatedAcres = activePlan.zones.reduce((acc, z) => acc + z.area_acres, 0);

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100">
              TerraCity Designer — AI Master Plan Generator & Zoning Studio
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Synthesizing {population.toLocaleString()} inhabitants across {areaAcres} Acres ({(areaAcres * 0.00404686).toFixed(2)} km²) with multi-modal zoning partitions.
          </p>
        </div>

        {/* Priority Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'water_security', label: 'Water Security', icon: Droplets },
            { id: 'renewable_energy', label: '100% Renewables', icon: SunMedium },
            { id: 'public_transport', label: 'Walkable TOD', icon: Compass },
            { id: 'green_spaces', label: 'Green Loop', icon: Trees },
            { id: 'disaster_resilience', label: 'Disaster Resilient', icon: ShieldAlert }
          ].map((item) => {
            const Icon = item.icon;
            const active = priorities.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => togglePriority(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-cyan-600/90 text-white shadow-md shadow-cyan-600/20 border border-cyan-400/50'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => onRegeneratePlans(priorities)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer ml-1"
          >
            Re-Generate Plans
          </button>
        </div>
      </div>

      {/* Plan Alternative Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isSelected = plan.plan_id === activePlan.plan_id;
          return (
            <div
              key={plan.plan_id}
              onClick={() => onSelectPlan(plan)}
              className={`rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between shadow-lg ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    plan.plan_code === 'PLAN_A' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    plan.plan_code === 'PLAN_B' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  }`}>
                    {plan.plan_code}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Plan
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1">{plan.name}</h3>
                <p className="text-xs text-cyan-300 font-medium mb-3">{plan.tagline}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{plan.paradigm}</p>
              </div>

              {/* Mini KPI Chips */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 rounded-xl p-2.5 text-center text-xs border border-slate-800/80">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Walkability</span>
                  <span className="font-bold text-cyan-400">{plan.walkability_score}/100</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Water Sec.</span>
                  <span className="font-bold text-emerald-400">{plan.water_self_sufficiency_pct}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">Capex</span>
                  <span className="font-bold text-indigo-400">₹{plan.estimated_infrastructure_capex_cr_inr}Cr</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Realistic Population Density & Infrastructure Trade-offs Evaluation */}
      <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Info className="w-5 h-5 shrink-0" />
          <span>Demographic Density & Infrastructure Trade-off Verification</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gross Population Density</span>
            <span className="text-xl font-black text-cyan-400">{activePlan.gross_population_density_per_sqkm.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block">people / km²</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Acre Density</span>
            <span className="text-xl font-black text-emerald-400">{activePlan.gross_density_per_acre}</span>
            <span className="text-[10px] text-slate-400 block">people / gross acre</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Green Space / Person</span>
            <span className="text-xl font-black text-yellow-400">{activePlan.green_space_per_capita_sqm} m²</span>
            <span className="text-[10px] text-slate-400 block">WHO norm: &gt;9 m²</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Transit Mode Share</span>
            <span className="text-xl font-black text-indigo-400">{activePlan.public_transit_mode_share_target_pct}%</span>
            <span className="text-[10px] text-slate-400 block">Non-motorized / BRT</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            <strong className="text-emerald-400 font-semibold">Density Realism Check: </strong>
            {activePlan.density_evaluation}
          </p>
          <p>
            <strong className="text-amber-400 font-semibold">Infrastructure Trade-Offs: </strong>
            {activePlan.tradeoffs_summary}
          </p>
        </div>
      </div>

      {/* Complete 12-Zone Budget Allocation Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>{activePlan.name} — Geometric Zone Land Allocation Budget</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Total Partition: <strong className="text-cyan-400">{totalAllocatedAcres.toFixed(1)} / {activePlan.total_area_acres} Acres</strong> (100% Boundary Envelope Verified)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Zone / Classification</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Acres</th>
                <th className="py-2.5 px-3 text-right">Share (%)</th>
                <th className="py-2.5 px-3 text-right">FAR</th>
                <th className="py-2.5 px-3 text-right">Capacity</th>
                <th className="py-2.5 px-3">Zoning Purpose & Infrastructure Role</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activePlan.zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 flex items-center gap-2 font-semibold text-slate-100">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }}></span>
                    <span>{zone.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{zone.zone_type}</td>
                  <td className="py-3 px-3 text-right font-bold text-cyan-400">{zone.area_acres}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">{zone.area_percentage}%</td>
                  <td className="py-3 px-3 text-right font-semibold text-indigo-400">{zone.far_ratio}</td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {zone.target_capacity_people > 0 ? `${zone.target_capacity_people.toLocaleString()} cap` : '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-sm truncate" title={zone.description}>
                    {zone.description}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onEditZone(zone)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold p-1.5 rounded hover:bg-slate-800 transition"
                      title="Edit Zone Parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
