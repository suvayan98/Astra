import React from 'react';
import {
  Globe2, Mountain, AlertOctagon, Layers, Compass,
  CheckCircle2, ArrowDownRight, ShieldAlert, Sparkles, TestTube
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { TerrainAnalysisResult, SoilAnalysisResult } from '../types';

interface TerrainSoilViewProps {
  terrain: TerrainAnalysisResult | null;
  soil: SoilAnalysisResult | null;
  loading: boolean;
}

export const TerrainSoilView: React.FC<TerrainSoilViewProps> = ({ terrain, soil, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Processing Elevation Rasters & ICAR Soil Datasets...</p>
      </div>
    );
  }

  if (!terrain || !soil) {
    return <div className="p-8 text-center text-slate-400">No terrain or soil data available.</div>;
  }

  const slopeData = Object.entries(terrain.slope_distribution).map(([name, pct]) => ({
    name,
    pct
  }));

  const soilTexturePie = [
    { name: 'Sand', value: soil.sand_pct, color: '#f59e0b' },
    { name: 'Silt', value: soil.silt_pct, color: '#06b6d4' },
    { name: 'Clay', value: soil.clay_pct, color: '#3b82f6' }
  ];

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mountain className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-100">
              TerraTerrain AI & TerraSoil AI — Topography & Soil Intelligence
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            NASA SRTM 30m Digital Elevation Model, surface drainage flow vectors, and ICAR soil mechanics.
          </p>
        </div>
      </div>

      {/* Prominent Geotechnical Engineering Warning Banner */}
      <div className="bg-amber-950/40 border border-amber-600/50 rounded-2xl p-4 text-amber-200 text-xs shadow-lg flex items-start gap-3">
        <AlertOctagon className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-bold block text-sm">
            MANDATORY GEOTECHNICAL ENGINEERING COMPLIANCE DISCLAIMER
          </strong>
          <p className="text-slate-300 leading-relaxed">
            {terrain.geotechnical_disclaimer}
          </p>
        </div>
      </div>

      {/* Section 1: Terrain Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Elevation Range</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-cyan-400">{terrain.min_elevation_m}m</span>
            <span className="text-xs text-slate-400">to {terrain.max_elevation_m}m</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Mean: {terrain.mean_elevation_m}m AMSL</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Mean Gradient</span>
          <span className="text-2xl font-black text-indigo-400">{terrain.mean_slope_deg}° Slope</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Natural gravity drainage</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Aspect & Solar Gain</span>
          <span className="text-base font-bold text-emerald-400 truncate block">{terrain.dominant_aspect}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Optimal daylight orientation</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Roughness Index</span>
          <span className="text-2xl font-black text-blue-400">{terrain.terrain_roughness_index}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Erosion: {terrain.erosion_susceptibility}</span>
        </div>
      </div>

      {/* Section 2: Slope Distribution & Construction Suitability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 mb-1">Slope Classification & Landform Partition</h3>
          <p className="text-xs text-slate-400 mb-4">Grading requirements based on terrain slope threshold</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slopeData} layout="vertical" margin={{ left: 40, right: 30 }}>
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 12 }} />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                  {slopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#06b6d4' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">Drainage Pattern & Flow Accumulation</h3>
            <p className="text-xs text-slate-400 mb-3">{terrain.drainage_pattern}</p>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 leading-relaxed mb-4">
              <strong className="text-cyan-400 block mb-1">Hydrological Flow Summary:</strong>
              {terrain.flow_direction_summary}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5">
              <span className="block text-[10px] text-slate-400 uppercase">Optimal Buildable</span>
              <span className="text-lg font-black text-emerald-400">{terrain.construction_suitability["Direct Construction (Flat <5%)"]}%</span>
            </div>
            <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5">
              <span className="block text-[10px] text-slate-400 uppercase">Terraced</span>
              <span className="text-lg font-black text-cyan-400">{terrain.construction_suitability["Terraced Construction (5-15%)"]}%</span>
            </div>
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-2.5">
              <span className="block text-[10px] text-slate-400 uppercase">Restricted</span>
              <span className="text-lg font-black text-rose-400">{terrain.construction_suitability["Non-Buildable Conservation (>15%)"]}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Soil Intelligence (Module C) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              TerraSoil AI — Soil Taxonomy & Geotechnical Profile
            </h3>
          </div>
          <span className="text-xs bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800/80 font-bold">
            {soil.agricultural_suitability_class}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Soil Texture Triangle Doughnut */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-300 mb-2">Soil Texture Composition</span>
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={soilTexturePie} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={4}>
                    {soilTexturePie.map((entry, index) => (
                      <Cell key={`pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="text-amber-400">Sand: {soil.sand_pct}%</span>
              <span className="text-cyan-400">Silt: {soil.silt_pct}%</span>
              <span className="text-blue-400">Clay: {soil.clay_pct}%</span>
            </div>
          </div>

          {/* Core Soil Parameters */}
          <div className="space-y-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Indian Soil Order</span>
              <span className="text-sm font-bold text-slate-100">{soil.soil_order}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Soil Texture Class</span>
              <span className="text-sm font-bold text-cyan-300">{soil.texture_class}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Soil Organic Carbon (SOC)</span>
              <span className="text-sm font-bold text-emerald-400">{soil.soil_organic_carbon_pct}% (Depth: {soil.estimated_soil_depth_cm} cm)</span>
            </div>
          </div>

          {/* Shrink-Swell & Bearing Capacity */}
          <div className="space-y-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Shrink-Swell Expansiveness</span>
              <span className="text-xs font-bold text-amber-300">{soil.shrink_swell_potential}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Drainage Infiltration</span>
              <span className="text-xs font-bold text-slate-200">{soil.drainage_characteristic}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recommended Agro-Forestry Zone</span>
              <span className="text-xs font-bold text-emerald-300">{soil.recommended_agro_zones_pct}% of settlement area</span>
            </div>
          </div>
        </div>

        {/* Soil Conservation & Testing Protocols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-emerald-400 mb-2">Soil Conservation Methods</h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {soil.soil_conservation_measures.map((m, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-cyan-400 mb-2">Compulsory On-Site Soil Testing Protocols</h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {soil.field_testing_protocols_needed.map((p, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
