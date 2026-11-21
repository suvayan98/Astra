import React from 'react';
import { 
  Trees, 
  Sprout, 
  Layers, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  Leaf, 
  Sparkles,
  Compass
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

interface VegetationPlannerViewProps {
  vegetationData: any;
}

export const VegetationPlannerView: React.FC<VegetationPlannerViewProps> = ({ vegetationData }) => {
  const v = vegetationData || {
    mean_ndvi: 0.54,
    mean_evi: 0.39,
    canopy_cover_pct: 36.7,
    green_cover_ratio_pct: 42.0,
    biodiversity_corridors_acres: 84.0,
    urban_forest_parks_acres: 126.0,
    ndvi_time_series: [
      { period: 'Jan', ndvi: 0.46, evi: 0.33, health_status: 'Moderate' },
      { period: 'Feb', ndvi: 0.38, evi: 0.27, health_status: 'Moderate' },
      { period: 'Mar', ndvi: 0.30, evi: 0.22, health_status: 'Stressed/Sparse' },
      { period: 'Apr', ndvi: 0.24, evi: 0.17, health_status: 'Stressed/Sparse' },
      { period: 'May', ndvi: 0.27, evi: 0.19, health_status: 'Stressed/Sparse' },
      { period: 'Jun', ndvi: 0.41, evi: 0.29, health_status: 'Moderate' },
      { period: 'Jul', ndvi: 0.62, evi: 0.45, health_status: 'Vigorous' },
      { period: 'Aug', ndvi: 0.73, evi: 0.53, health_status: 'Vigorous' },
      { period: 'Sep', ndvi: 0.76, evi: 0.55, health_status: 'Vigorous' },
      { period: 'Oct', ndvi: 0.70, evi: 0.50, health_status: 'Vigorous' },
      { period: 'Nov', ndvi: 0.59, evi: 0.42, health_status: 'Vigorous' },
      { period: 'Dec', ndvi: 0.51, evi: 0.37, health_status: 'Moderate' }
    ],
    recommended_native_species: [
      { name: "Neem (Azadirachta indica)", stratum: "Canopy", eco_service: "Air purifying (PM10/2.5 capture), natural bio-pesticide, dense shade" },
      { name: "Peepal (Ficus religiosa)", stratum: "Keystone", eco_service: "Round-the-clock oxygen emission, avian sanctuary, broad cooling canopy" },
      { name: "Jamun (Syzygium cumini)", stratum: "Canopy", eco_service: "Tolerates clay waterlogging during monsoons, edible fruit for avifauna" },
      { name: "Tamarind (Tamarindus indica)", stratum: "Avenue Shade", eco_service: "Extremely long-lived avenue tree, acidic fruit, wind barrier" },
      { name: "Kadamba (Neolamarckia cadamba)", stratum: "Riparian Buffer", eco_service: "Rapid growing riparian tree along lake and water harvesting margins" },
      { name: "Honge (Pongamia pinnata)", stratum: "Nitrogen Fixer", eco_service: "Deep root soil anchoring, drought tolerant, biofuel seed production" }
    ],
    urban_greening_recommendations: [
      "Establish a continuous 150m wide ecological biodiversity corridor connecting site drainage to external rural forests",
      "Deploy the Japanese Miyawaki high-density native afforestation technique in pocket parks for 10x faster canopy growth",
      "Implement a 3-tier vertical green wall and rooftop sedum garden policy for all commercial facades",
      "Strict statutory ban on invasive non-native species such as Conocarpus and Eucalyptus that deplete groundwater"
    ]
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
          <Trees className="w-4 h-4" />
          <span>MODULE G &bull; TERRAVEGETATION AI & ISRO VEDAS</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Vegetation Intelligence & Native Biodiversity Planning</h1>
        <p className="text-xs text-slate-400 mt-1">
          ISRO VEDAS 15-day NDVI/EVI temporal phenology curves, ecological native species matrix, and contiguous wildlife biophilic corridors.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Mean NDVI Index</span>
          <div className="text-3xl font-bold text-emerald-400">
            {v.mean_ndvi}
          </div>
          <p className="text-[11px] text-slate-400">
            Enhanced Veg Index (EVI): <strong className="text-white font-mono">{v.mean_evi}</strong>
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Canopy Cover Pct</span>
          <div className="text-3xl font-bold text-white">
            {v.canopy_cover_pct}%
          </div>
          <p className="text-[11px] text-slate-400">
            Existing woody & scrub canopy
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Dedicated Green Spaces</span>
          <div className="text-3xl font-bold text-cyan-400">
            {v.green_cover_ratio_pct}%
          </div>
          <p className="text-[11px] text-emerald-400">
            210 Acres total biophilic reserve
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Biodiversity Corridors</span>
          <div className="text-3xl font-bold text-white">
            {v.biodiversity_corridors_acres} <span className="text-xs text-slate-400 font-normal">Acres</span>
          </div>
          <p className="text-[11px] text-slate-400">
            150m continuous fauna transit spine
          </p>
        </div>
      </div>

      {/* VEDAS NDVI / EVI Time Series */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">12-Month Temporal Vegetation Health & Phenology Curve (NDVI / EVI)</h2>
            <p className="text-xs text-slate-400">Calibrated seasonal progression from ISRO VEDAS 15-Day Composite Archive</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
            ISRO / SAC VEDAS Temporal API
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={v.ndvi_time_series || []} margin={{ top: 15, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" domain={[0, 1.0]} tickFormatter={(v) => v.toFixed(2)} fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                formatter={(val: any) => [val, 'Index']}
              />
              <Legend verticalAlign="top" height={36} />
              <Line name="Normalized Difference Veg Index (NDVI)" type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line name="Enhanced Vegetation Index (EVI)" type="monotone" dataKey="evi" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Native Tree Species Catalog */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center">
              <Leaf className="w-4 h-4 text-emerald-400 mr-2" />
              Ecologically Native Species Catalog
            </h2>
            <p className="text-xs text-slate-400">
              Prioritized by agro-climatic adaptability, groundwater replenishment, and air filtration. Zero invasive exotics.
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-full">
            Ecological Restoration
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(v.recommended_native_species || []).map((sp: any, idx: number) => (
            <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{sp.name.split('(')[0]}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                  {sp.stratum}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 italic">
                ({sp.name.split('(')[1] || ''}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {sp.eco_service}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Biophilic Guidelines */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center">
          <Sparkles className="w-4 h-4 text-cyan-400 mr-2" />
          Biophilic City Master Planning Mandates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          {(v.urban_greening_recommendations || []).map((rec: string, idx: number) => (
            <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
