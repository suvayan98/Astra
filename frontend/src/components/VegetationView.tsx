import React from 'react';
import {
  Trees, Sprout, Leaf, Sparkles, TrendingUp,
  ShieldCheck, CheckCircle2, Info
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { VegetationIntelligenceResult } from '../types';

interface VegetationViewProps {
  vegetation: VegetationIntelligenceResult | null;
  loading: boolean;
}

export const VegetationView: React.FC<VegetationViewProps> = ({ vegetation, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Analyzing VEDAS Temporal NDVI Composites & Botanical Suitability...</p>
      </div>
    );
  }

  if (!vegetation) {
    return <div className="p-8 text-center text-slate-400">No vegetation data available.</div>;
  }

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trees className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100">
              TerraVegetation AI — Green City Planner & Native Forestry
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            ISRO / SAC VEDAS NDVI/EVI temporal indices, Miyawaki afforestation standards, and native biodiversity corridors.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Satellite NDVI Mean</span>
          <span className="text-2xl font-black text-emerald-400">{vegetation.satellite_ndvi_mean}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Range: {vegetation.satellite_ndvi_min} to {vegetation.satellite_ndvi_max}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Existing Canopy Cover</span>
          <span className="text-2xl font-black text-cyan-400">{vegetation.existing_canopy_cover_pct}%</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Baseline pre-development</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Green Cover</span>
          <span className="text-2xl font-black text-emerald-400">{vegetation.proposed_green_cover_target_pct}%</span>
          <span className="text-[11px] text-slate-400 mt-1 block">{vegetation.urban_forest_area_acres} Acres allocated</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Miyawaki Pockets</span>
          <span className="text-2xl font-black text-indigo-400">{vegetation.miyawaki_pockets_recommended} Pockets</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Ultra-dense microclimate cooling</span>
        </div>
      </div>

      {/* Native Tree Species Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span>Ecologically Appropriate Native Tree Catalog for Local Conditions</span>
          </h3>
          <span className="text-xs text-slate-400">Prioritizes native drought tolerance & deep root structures</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vegetation.native_species_list.map((tree, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-bold text-slate-100">{tree.common_name}</h4>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    {tree.category}
                  </span>
                </div>
                <span className="text-xs italic text-cyan-300 font-mono block mb-2">{tree.botanical_name}</span>

                <div className="space-y-1 text-xs text-slate-300 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Canopy Spread:</span>
                    <span className="font-semibold">{tree.canopy_spread_m}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Need:</span>
                    <span className="font-semibold">{tree.water_requirement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carbon Potential:</span>
                    <span className="font-semibold text-emerald-400">{tree.carbon_sequestration_potential}</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-xl text-[11px] text-slate-400 border border-slate-800/80">
                  <strong className="text-slate-300">Soil Fit:</strong> {tree.soil_affinity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Miyawaki Afforestation & Biodiversity Corridors */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200">
          Miyawaki Urban Forest Method & Biodiversity Corridors
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {vegetation.biodiversity_corridor_connectivity}. By planting 3 to 4 native multi-tier saplings per square meter
          following the Miyawaki methodology, these {vegetation.miyawaki_pockets_recommended} urban forest pockets will grow
          10x faster, create 30x denser foliage, and reduce ambient urban surface temperature by 3.5°C within 3 years.
        </p>

        <div className="pt-2">
          <h4 className="text-xs font-bold text-cyan-400 mb-2">Sustainable Agro-Crop Patterns</h4>
          <div className="flex flex-wrap gap-2">
            {vegetation.recommended_crop_patterns.map((crop, idx) => (
              <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl">
                {crop}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
