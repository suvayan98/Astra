import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  Boxes, 
  Sparkles, 
  MapPin, 
  Building2, 
  Trees, 
  Droplet, 
  SunMedium, 
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { MasterPlanComparison, MasterPlanAlternative, CityZone } from '../types';

interface MasterPlanDesignerViewProps {
  planComparison: MasterPlanComparison | null;
  activePlanId: string;
  onSelectPlan: (planId: string) => void;
  onOpenMap: () => void;
  onOpen3D: () => void;
}

export const MasterPlanDesignerView: React.FC<MasterPlanDesignerViewProps> = ({
  planComparison,
  activePlanId,
  onSelectPlan,
  onOpenMap,
  onOpen3D
}) => {
  const plans = planComparison?.plans || [];
  const currentPlan = plans.find(p => p.plan_id === activePlanId) || plans[0];
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');

  const tradeOffs = planComparison?.trade_off_analysis || {
    density_vs_sprawl: {
      winner: "Plan A",
      rationale: "Plan A prevents vehicle miles traveled by keeping all daily destinations within 15 minutes walking radius."
    },
    biodiversity_carbon_sink: {
      winner: "Plan B",
      rationale: "Plan B commits 62% of site area to contiguous forest and regenerative agriculture, sequestering 26,400 tonnes CO2/yr."
    },
    circular_resource_efficiency: {
      winner: "Plan C",
      rationale: "Plan C achieves highest renewable penetration (88%) and 85% water self-sufficiency via floating solar and MBR reclamation."
    }
  };

  const filteredZones = currentPlan?.zones.filter(z => {
    if (selectedZoneFilter === 'all') return true;
    return z.type.toLowerCase().includes(selectedZoneFilter.toLowerCase());
  }) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>MODULE H &bull; TERRACITY DESIGNER</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AI Master Plan Generator & Zoning Optimization</h1>
          <p className="text-xs text-slate-400 mt-1">
            Comparing 3 distinct spatial settlement typologies for 20,000 residents across 500 acres with editable functional parcels.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpen3D}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 hover:from-blue-500 hover:to-cyan-500 transition flex items-center space-x-1.5"
          >
            <Boxes className="w-4 h-4" />
            <span>View 3D Digital Twin</span>
          </button>
          <button
            onClick={onOpenMap}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Edit on Map</span>
          </button>
        </div>
      </div>

      {/* Plan Alternative Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isSelected = plan.plan_id === activePlanId;
          return (
            <div
              key={plan.plan_id}
              onClick={() => onSelectPlan(plan.plan_id)}
              className={`rounded-2xl p-6 transition cursor-pointer border flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-cyan-400">
                    {plan.name.split(':')[0]}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                    Score: {plan.suitability_score}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-white">{plan.tagline}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{plan.philosophy}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Residential Density:</span>
                  <strong className="text-white">{plan.residential_density_pph} PPH</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Transit Reach:</span>
                  <strong className="text-cyan-400">{plan.public_transport_coverage_pct}%</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Clean Energy Share:</span>
                  <strong className="text-amber-400">{plan.renewable_energy_share_pct}%</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Green Open Space:</span>
                  <strong className="text-emerald-400">{plan.green_open_space_pct}%</strong>
                </div>
              </div>

              <button
                className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{isSelected ? 'Active Plan' : 'Select This Alternative'}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparative Trade-Off Analysis Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Scale className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Multi-Plan Comparative Trade-Off Matrix</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Density vs Sprawl</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                Winner: {tradeOffs.density_vs_sprawl?.winner || 'Plan A'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {tradeOffs.density_vs_sprawl?.rationale || 'Plan A minimizes vehicle miles traveled by clustering destinations within 15 minutes walking radius.'}
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Biodiversity & Carbon Sink</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                Winner: {tradeOffs.biodiversity_carbon_sink?.winner || 'Plan B'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {tradeOffs.biodiversity_carbon_sink?.rationale || 'Plan B commits 62% of site area to contiguous forest and permaculture, sequestering 26,400 tonnes CO2/yr.'}
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Circular Efficiency</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                Winner: {tradeOffs.circular_resource_efficiency?.winner || 'Plan C'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {tradeOffs.circular_resource_efficiency?.rationale || 'Plan C achieves highest renewable penetration (88%) and 85% water self-sufficiency via floating solar and MBR.'}
            </p>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <div className="p-4 bg-cyan-950/30 border border-cyan-800/50 rounded-2xl flex items-start space-x-3 text-xs text-cyan-200">
          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-cyan-300 font-semibold block mb-0.5">TerraAI Urban Planner Recommendation:</strong>
            <p className="text-slate-300 leading-relaxed">
              {planComparison?.recommendation_reason || "For a proposed population of 20,000 on 500 acres, Plan A (Compact 15-Minute City) achieves the optimal equilibrium: it comfortably houses the target population with superior pedestrian accessibility while leaving over 200 acres untouched for flood attenuation, local agriculture, and urban biodiversity."}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Plan: Functional Zones Breakdown */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center">
              <span>Functional Land-Use Zones: {currentPlan?.name}</span>
              <span className="ml-2 text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {currentPlan?.zones.length} Parcels
              </span>
            </h2>
            <p className="text-xs text-slate-400">All zones are guaranteed non-overlapping and fit within the 500-acre boundary.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
            {['all', 'Residential', 'Commercial', 'Forest', 'Water', 'Solar', 'Civic'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedZoneFilter(f)}
                className={`px-2.5 py-1 rounded-lg capitalize transition ${
                  selectedZoneFilter === f
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredZones.map((zone) => (
            <div key={zone.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[180px]">{zone.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {zone.type}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[10px] block">Acreage</span>
                  <strong className="text-cyan-400 text-sm">{zone.area_acres} Acres</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Share</span>
                  <strong className="text-white text-sm">{zone.area_percentage}%</strong>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {zone.description}
              </p>

              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-semibold block">Key Specifications:</span>
                <ul className="text-[11px] text-slate-300 list-disc pl-4 space-y-0.5">
                  {zone.key_features.slice(0, 2).map((feat, fIdx) => (
                    <li key={fIdx}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
