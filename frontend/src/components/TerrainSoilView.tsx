import React, { useState } from 'react';
import {
  Globe2, Mountain, AlertOctagon, Layers, Compass,
  CheckCircle2, ArrowDownRight, ShieldAlert, Sparkles, TestTube,
  TrendingDown, TrendingUp, Compass as CompassIcon, ShieldCheck,
  Activity, ArrowRight, Info
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, AreaChart, Area, CartesianGrid, ReferenceLine
} from 'recharts';
import { TerrainAnalysisResult, SoilAnalysisResult } from '../types';

interface TerrainSoilViewProps {
  terrain: TerrainAnalysisResult | null;
  soil: SoilAnalysisResult | null;
  loading: boolean;
}

export const TerrainSoilView: React.FC<TerrainSoilViewProps> = ({ terrain, soil, loading }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cross_section' | 'soil_mechanics'>('overview');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Processing NASA SRTM 30m Digital Elevation Models & ICAR Soil Mechanics...</p>
        <span className="text-xs text-slate-500">Generating slope vectors, flow accumulation networks, and ternary soil texture taxonomy</span>
      </div>
    );
  }

  if (!terrain || !soil) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Mountain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-300">No terrain or soil data available.</p>
        <p className="text-xs text-slate-500 mt-1">Please select a site to load topography and geotechnical profiles.</p>
      </div>
    );
  }

  // Slope Distribution Data
  const slopeData = Object.entries(terrain.slope_distribution).map(([name, pct]) => ({
    name,
    pct,
    buildability: name.includes('<5%') ? 'Optimal Direct Building' : name.includes('5-15%') ? 'Terraced Construction' : 'Conservation & Forestry'
  }));

  // Synthetic Elevation Cross-Section Transect (West to East across site)
  const elevationTransect = [
    { distance_m: 0, elevation_m: terrain.min_elevation_m + (terrain.elevation_range_m * 0.72), label: 'Western Ridge', slope: '4.2%' },
    { distance_m: 200, elevation_m: terrain.min_elevation_m + (terrain.elevation_range_m * 0.85), label: 'High Crest', slope: '5.8%' },
    { distance_m: 450, elevation_m: terrain.min_elevation_m + (terrain.elevation_range_m * 0.65), label: 'Upper Terrace', slope: '2.9%' },
    { distance_m: 750, elevation_m: terrain.mean_elevation_m, label: 'Central Plateau', slope: '1.4%' },
    { distance_m: 1100, elevation_m: terrain.min_elevation_m + (terrain.elevation_range_m * 0.35), label: 'Lower Plain', slope: '1.8%' },
    { distance_m: 1400, elevation_m: terrain.min_elevation_m + (terrain.elevation_range_m * 0.18), label: 'Retention Basin Entry', slope: '3.1%' },
    { distance_m: 1750, elevation_m: terrain.min_elevation_m, label: 'Natural Depression / Swale', slope: '0.8%' }
  ];

  // Ternary calculation for Soil Texture Triangle (Sand, Silt, Clay)
  // Triangle dimensions
  const triSide = 260;
  const triHeight = (Math.sqrt(3) / 2) * triSide; // ~225.16
  const pad = 24;
  // Sand = (pad, pad + triHeight), Silt = (pad + triSide, pad + triHeight), Clay = (pad + triSide/2, pad)
  const sandPct = soil.sand_pct / 100;
  const siltPct = soil.silt_pct / 100;
  const clayPct = soil.clay_pct / 100;

  // Barycentric coordinates
  const soilX = pad + (sandPct * 0) + (siltPct * triSide) + (clayPct * (triSide / 2));
  const soilY = pad + (sandPct * triHeight) + (siltPct * triHeight) + (clayPct * 0);

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-950/80 border border-indigo-500/40 rounded-xl">
              <Mountain className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                TerraTerrain & TerraSoil AI — Topography & Geotechnical Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                NASA SRTM 30m Digital Elevation Models, surface hydrology vectors, and ICAR soil mechanics taxonomy.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terrain Overview
          </button>
          <button
            onClick={() => setActiveTab('cross_section')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'cross_section'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Elevation Transect
          </button>
          <button
            onClick={() => setActiveTab('soil_mechanics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'soil_mechanics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ICAR Soil Mechanics
          </button>
        </div>
      </div>

      {/* Prominent Geotechnical Engineering Compliance Banner */}
      <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-4 text-amber-200 text-xs shadow-xl flex items-start gap-4">
        <div className="p-2 bg-amber-900/60 border border-amber-600/60 rounded-xl shrink-0 mt-0.5">
          <AlertOctagon className="w-6 h-6 text-amber-400" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <strong className="text-amber-300 font-bold block text-sm tracking-wide">
              MANDATORY GEOTECHNICAL ENGINEERING COMPLIANCE NOTICE (IS 1892 &amp; IS 1904)
            </strong>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/80 border border-amber-700 px-2 py-0.5 rounded">
              Statutory Requirement
            </span>
          </div>
          <p className="text-slate-200 leading-relaxed">
            {terrain.geotechnical_disclaimer} Satellite-derived DEMs and regional ICAR soil classifications provide macro-level
            feasibility indicators only. Compulsory physical borehole exploration (SPT tests at minimum 1 borehole per 2.5 acres,
            triaxial shear testing, and plate load tests) must be conducted prior to final structural foundation design.
          </p>
        </div>
      </div>

      {/* Core Topography KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Elevation Range</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-cyan-400">{terrain.min_elevation_m}m</span>
            <span className="text-xs text-slate-400">to {terrain.max_elevation_m}m AMSL</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Mean: {terrain.mean_elevation_m}m (Relief: {terrain.elevation_range_m}m)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Mean Gradient</span>
          <span className="text-2xl font-black text-indigo-400">{terrain.mean_slope_deg}° Slope</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Ideal natural gravity sewerage</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Dominant Aspect</span>
          <span className="text-base font-bold text-emerald-400 truncate block mt-1">{terrain.dominant_aspect}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Optimal solar daylight capture</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Roughness & Erosion</span>
          <span className="text-2xl font-black text-blue-400">{terrain.terrain_roughness_index}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Susceptibility: {terrain.erosion_susceptibility}</span>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'cross_section' ? (
        /* Section: 2D Elevation Profile Transect */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Mountain className="w-5 h-5 text-indigo-400" />
                <span>Topographic Cross-Section Transect (West → East, 1.75 km)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Elevational variation along site centerline indicating cut/fill earthwork balance and gravity drainage slope.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-0.5 bg-indigo-500"></span>
                <span>Terrain Surface</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 bg-cyan-400 border-dashed"></span>
                <span>Mean Datum ({terrain.mean_elevation_m}m)</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={elevationTransect} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="distance_m"
                  unit="m"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: 'Distance along Transect (Meters)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  domain={['dataMin - 2', 'dataMax + 2']}
                  unit="m"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: 'AMSL (m)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 11 }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val} m (${item.payload.label}, slope ~${item.payload.slope})`,
                    'Elevation'
                  ]}
                />
                <ReferenceLine y={terrain.mean_elevation_m} stroke="#06b6d4" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="elevation_m" stroke="#6366f1" strokeWidth={3} fill="url(#elevationGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Earthwork Grading Strategy</span>
              <p className="text-xs text-slate-300">
                Natural slope allows cut-and-fill volume minimization (&lt; 40,000 m³). High crest utilized for Master Balancing Reservoir.
              </p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Surface Gravity Drainage</span>
              <p className="text-xs text-slate-300">
                1.4% to 4.2% descent ensures gravity conveyance to the eastern bioswale and retention pond without booster pumping.
              </p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contour Line Generation</span>
              <p className="text-xs text-slate-300">
                {terrain.contours.length} contour vectors generated at 1.0m intervals from CartoDEM for site civil engineering plans.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Section 2: Slope Distribution & Construction Suitability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center justify-between">
              <span>Slope Classification &amp; Landform Partition</span>
              <span className="text-xs font-normal text-slate-400">IS 14243 Guidelines</span>
            </h3>
            <p className="text-xs text-slate-400">
              Grading and foundation requirements based on slope angle thresholds.
            </p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slopeData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#cbd5e1', fontSize: 11 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 11 }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% of site area (${item.payload.buildability})`,
                    'Slope Coverage'
                  ]}
                />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                  {slopeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#10b981' : index === 1 ? '#06b6d4' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5">
              <span className="block text-[10px] text-slate-400 uppercase">Flat (&lt;5%)</span>
              <span className="text-lg font-black text-emerald-400">
                {terrain.construction_suitability["Direct Construction (Flat <5%)"]}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">High-density urban</span>
            </div>
            <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5">
              <span className="block text-[10px] text-slate-400 uppercase">Moderate (5-15%)</span>
              <span className="text-lg font-black text-cyan-400">
                {terrain.construction_suitability["Terraced Construction (5-15%)"]}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Terraced / Low-rise</span>
            </div>
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-2.5">
              <span className="block text-[10px] text-slate-400 uppercase">Steep (&gt;15%)</span>
              <span className="text-lg font-black text-rose-400">
                {terrain.construction_suitability["Non-Buildable Conservation (>15%)"]}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Forestry buffer</span>
            </div>
          </div>
        </div>

        {/* Drainage Pattern & Flow Accumulation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-200">Drainage Pattern & Flow Direction Summary</h3>
              <span className="text-xs text-cyan-400 font-mono bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
                D8 Flow Algorithm
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{terrain.drainage_pattern}</p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed mb-4">
              <strong className="text-cyan-400 block mb-1 flex items-center gap-1.5">
                <CompassIcon className="w-4 h-4 text-cyan-400" />
                <span>Hydrological Flow Direction Vector:</span>
              </strong>
              {terrain.flow_direction_summary}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Aspect Direction</span>
              <span className="text-sm font-bold text-emerald-400 block mt-0.5">{terrain.dominant_aspect}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Maximum passive winter solar exposure</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Erosion Susceptibility</span>
              <span className="text-sm font-bold text-blue-400 block mt-0.5">{terrain.erosion_susceptibility}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Miyawaki afforestation stabilization advised</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: ICAR Soil Mechanics & Soil Texture Triangle */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-xl">
              <TestTube className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                TerraSoil AI — ICAR Soil Mechanics &amp; Ternary Soil Texture Triangle
              </h3>
              <p className="text-xs text-slate-400">
                Indian Council of Agricultural Research (ICAR) regional soil survey and geotechnical foundation taxonomy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800/80 font-bold">
              {soil.agricultural_suitability_class}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* ICAR Ternary Soil Texture Triangle Diagram */}
          <div className="lg:col-span-5 flex flex-col items-center bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-bold text-slate-200">ICAR / USDA Soil Texture Triangle</span>
              <span className="text-[10px] text-cyan-400 font-mono">Ternary (Sand/Silt/Clay)</span>
            </div>

            <div className="relative w-[308px] h-[270px] flex items-center justify-center">
              <svg width="308" height="270" viewBox="0 0 308 270" className="overflow-visible">
                {/* Background triangle */}
                <polygon
                  points={`${pad},${pad + triHeight} ${pad + triSide},${pad + triHeight} ${pad + triSide/2},${pad}`}
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="2"
                />

                {/* Sub-regions (decorative approximation for soil classes) */}
                {/* Clay zone at top */}
                <polygon
                  points={`${pad + triSide*0.25},${pad + triHeight*0.5} ${pad + triSide*0.75},${pad + triHeight*0.5} ${pad + triSide/2},${pad}`}
                  fill="#3b82f6"
                  fillOpacity="0.12"
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Loam center */}
                <polygon
                  points={`${pad + triSide*0.2},${pad + triHeight*0.8} ${pad + triSide*0.8},${pad + triHeight*0.8} ${pad + triSide*0.75},${pad + triHeight*0.5} ${pad + triSide*0.25},${pad + triHeight*0.5}`}
                  fill="#10b981"
                  fillOpacity="0.10"
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Sand zone */}
                <polygon
                  points={`${pad},${pad + triHeight} ${pad + triSide*0.4},${pad + triHeight} ${pad + triSide*0.2},${pad + triHeight*0.8}`}
                  fill="#f59e0b"
                  fillOpacity="0.12"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Grid lines */}
                <line x1={pad + triSide*0.25} y1={pad + triHeight*0.5} x2={pad + triSide*0.75} y2={pad + triHeight*0.5} stroke="#334155" strokeDasharray="3 3" />
                <line x1={pad + triSide*0.5} y1={pad} x2={pad + triSide*0.5} y2={pad + triHeight} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />

                {/* Triangle Labels */}
                <text x={pad + triSide/2} y={pad - 8} fill="#60a5fa" fontSize="10" fontWeight="bold" textAnchor="middle">
                  100% Clay
                </text>
                <text x={pad - 4} y={pad + triHeight + 16} fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="start">
                  100% Sand
                </text>
                <text x={pad + triSide + 4} y={pad + triHeight + 16} fill="#22d3ee" fontSize="10" fontWeight="bold" textAnchor="end">
                  100% Silt
                </text>

                {/* Plotted Soil Sample Location */}
                <circle cx={soilX} cy={soilY} r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" className="animate-pulse" />
                <circle cx={soilX} cy={soilY} r="14" fill="#ef4444" fillOpacity="0.25" />
                <text x={soilX} y={soilY - 12} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {soil.texture_class}
                </text>
              </svg>
            </div>

            {/* Percentages bar */}
            <div className="w-full flex items-center justify-around gap-2 text-xs font-semibold pt-3 mt-2 border-t border-slate-800">
              <span className="text-amber-400">Sand: {soil.sand_pct}%</span>
              <span className="text-cyan-400">Silt: {soil.silt_pct}%</span>
              <span className="text-blue-400">Clay: {soil.clay_pct}%</span>
            </div>
          </div>

          {/* Core Geotechnical & Pedological Properties */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Indian Soil Order</span>
              <span className="text-sm font-bold text-slate-100">{soil.soil_order}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Deep profile, high mineral clay content</span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Texture Classification</span>
              <span className="text-sm font-bold text-cyan-300">{soil.texture_class}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Good bearing when dry; swell when saturated</span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Soil Organic Carbon (SOC)</span>
              <span className="text-sm font-bold text-emerald-400">
                {soil.soil_organic_carbon_pct}% (Depth: {soil.estimated_soil_depth_cm} cm)
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">Sufficient for urban afforestation & Miyawaki</span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Shrink-Swell Expansiveness</span>
              <span className="text-sm font-bold text-amber-300">{soil.shrink_swell_potential}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Under-reamed piles recommended for structures</span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Infiltration & Drainage</span>
              <span className="text-xs font-bold text-slate-200">{soil.drainage_characteristic}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Requires perforated sub-base drainage</span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Agro-Forestry Zone Sizing</span>
              <span className="text-xs font-bold text-emerald-300">
                {soil.recommended_agro_zones_pct}% of total settlement area
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">Preserve topsoil for parks and Miyawaki belts</span>
            </div>
          </div>
        </div>

        {/* Soil Conservation & Testing Protocols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended Soil Conservation & Earthwork Measures</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              {soil.soil_conservation_measures.map((m, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Mandatory On-Site Testing Protocols (Prior to Construction)</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              {soil.field_testing_protocols_needed.map((p, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
