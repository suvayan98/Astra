import React from 'react';
import { 
  Mountain, 
  Layers, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Sprout, 
  Compass, 
  CheckCircle2, 
  Wheat,
  Trees
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface TerrainSoilViewProps {
  terrainData: any;
  soilData: any;
}

export const TerrainSoilView: React.FC<TerrainSoilViewProps> = ({ terrainData, soilData }) => {
  const elev = terrainData?.elevation || { min_elev_m: 18.5, max_elev_m: 33.2, mean_elev_m: 24.8, slope_mean_deg: 2.0, terrain_roughness: 'Low' };
  const profile = terrainData?.elevation_profile || [
    { distance_m: 0, elevation_m: 20 },
    { distance_m: 400, elevation_m: 24 },
    { distance_m: 800, elevation_m: 29 },
    { distance_m: 1200, elevation_m: 31 },
    { distance_m: 1600, elevation_m: 26 },
    { distance_m: 1800, elevation_m: 21 },
  ];

  const soilTexture = [
    { name: 'Sand %', value: soilData?.sand_pct || 18.0, fill: '#f59e0b' },
    { name: 'Silt %', value: soilData?.silt_pct || 26.0, fill: '#06b6d4' },
    { name: 'Clay %', value: soilData?.clay_pct || 56.0, fill: '#8b5cf6' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
          <Mountain className="w-4 h-4" />
          <span>MODULES B & C &bull; TERRATERRAIN AI & TERRASOIL AI</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Terrain, Geomorphology & Soil Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1">
          Topographical elevation profiling, slope grading suitability, soil physical-chemical composition, and geotechnical foundation screening.
        </p>
      </div>

      {/* Geotechnical & Engineering Disclaimer Banner */}
      <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-2xl flex items-start space-x-3 text-xs text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-semibold">Geotechnical Engineering Notice (IS:1892 & IS:2911 Compliance):</strong>
          <p className="leading-relaxed">
            {terrainData?.geotechnical_disclaimer || "Satellite DEMs (SRTM / CartoDEM 30m) provide macro-topographical contours for master planning and gravity drainage. They do NOT replace statutory on-site Standard Penetration Tests (SPT) and core bore-hole drilling required for structural foundation design."}
          </p>
        </div>
      </div>

      {/* Terrain Elevation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Elevation Metrics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center">
            <Compass className="w-4 h-4 text-cyan-400 mr-2" />
            Elevation & Topography Statistics
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Mean Elevation</span>
              <strong className="text-white text-base">{elev.mean_elev_m} m</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">MSL Datum</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Elevation Relief</span>
              <strong className="text-cyan-400 text-base">{elev.min_elev_m}m — {elev.max_elev_m}m</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">&Delta; {(elev.max_elev_m - elev.min_elev_m).toFixed(1)}m</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Mean Terrain Slope</span>
              <strong className="text-emerald-400 text-base">{elev.slope_mean_deg}°</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Gentle Grading</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Buildable Area</span>
              <strong className="text-white text-base">{terrainData?.buildable_area_pct || 88}%</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">&lt; 8° slope threshold</span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Terrain Roughness:</span>
              <strong className="text-slate-200">{elev.terrain_roughness}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Drainage Flow Aspect:</span>
              <strong className="text-cyan-300 text-[11px] truncate max-w-[180px]">{elev.aspect_dominant || 'Towards Drainage Nallah'}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Landslide Hazard:</span>
              <strong className="text-emerald-400">{terrainData?.landslide_risk || 'None'}</strong>
            </div>
          </div>
        </div>

        {/* Elevation Transect Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">East-West Transect Elevation Profile</h2>
              <p className="text-xs text-slate-400">Cross-sectional topography across the 500-acre site boundary</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">SRTM / CartoDEM 30m</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profile} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="distance_m" stroke="#64748b" tickFormatter={(v) => `${v}m`} fontSize={11} />
                <YAxis stroke="#64748b" domain={['auto', 'auto']} tickFormatter={(v) => `${v}m`} fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} m (MSL)`, 'Elevation']}
                  labelFormatter={(lbl) => `Transect Distance: ${lbl} metres`}
                />
                <Area type="monotone" dataKey="elevation_m" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#elevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Module C: Soil Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Soil Texture & Chemical Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center">
            <Sprout className="w-4 h-4 text-emerald-400 mr-2" />
            Pedological Composition
          </h2>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400">Classified Soil Series:</span>
            <div className="text-sm font-bold text-emerald-300">{soilData?.soil_type || 'Deep Black Cotton Clay (Vertisols)'}</div>
            <span className="text-[11px] text-slate-400 block">{soilData?.soil_depth_cm || 'Very Deep (>150 cm)'}</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={soilTexture} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={11} width={65} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val}%`, 'Content']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Soil pH:</span>
              <strong className="text-white">{soilData?.soil_ph || 7.8}</strong> (Alkaline-Neutral)
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Org. Carbon (SOC):</span>
              <strong className="text-emerald-400">{soilData?.soil_organic_carbon_g_kg || 6.2} g/kg</strong>
            </div>
          </div>
        </div>

        {/* Agricultural Recommendations & Tree Species */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Wheat className="w-4 h-4 text-amber-400 mr-2" />
              Agronomic & Tree Species Suitability
            </h2>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              {soilData?.agricultural_suitability_pct || 88}% Agricultural Suitability
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                <Wheat className="w-3.5 h-3.5" />
                <span>Recommended Urban Farming Crops</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                {(soilData?.recommended_crops || ["Organic Chillies & Pulses", "Cotton & Fodder Legumes", "Drip-irrigated Turmeric", "Heirloom Millets"]).map((c: string, idx: number) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300">
                <Trees className="w-3.5 h-3.5" />
                <span>Ecologically Appropriate Native Trees</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                {(soilData?.recommended_trees || ["Neem (Azadirachta indica)", "Jamun (Syzygium cumini)", "Peepal (Ficus religiosa)", "Tamarind (Tamarindus indica)"]).map((t: string, idx: number) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Soil Conservation & Foundation Rules */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <strong className="text-slate-200 block">Soil Conservation & Foundation Engineering Guidelines:</strong>
            <p className="text-slate-400 leading-relaxed">
              {soilData?.field_survey_recommendation || "High-plasticity clay soils require under-reamed pile foundations to bypass expansive active upper clay layers. Broad-bed furrows recommended for surface drainage."}
            </p>
            <div className="pt-1 text-[11px] text-cyan-400">
              Data Source: {soilData?.data_source_nature || "Regional ICAR-NBSS&LUP Soil Mapping & SoilGrids Global 250m Model."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
