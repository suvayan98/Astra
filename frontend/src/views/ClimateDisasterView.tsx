import React from 'react';
import { 
  CloudLightning, 
  Thermometer, 
  Droplet, 
  Wind, 
  ShieldAlert, 
  AlertTriangle, 
  Navigation, 
  Trees, 
  Building,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface ClimateDisasterViewProps {
  climateData: any;
}

export const ClimateDisasterView: React.FC<ClimateDisasterViewProps> = ({ climateData }) => {
  const c = climateData || {
    flood_susceptibility: 'Moderate',
    heatwave_risk: 'Severe',
    drought_risk: 'Low-Moderate',
    cyclone_risk: 'Moderate-High (Bay of Bengal post-monsoon depressions)',
    annual_rainfall_avg_mm: 1050.0,
    extreme_rainfall_24h_mm: 245.0,
    summer_peak_temp_c: 45.0,
    climate_zone_india: 'Zone XI: East Coast Plains and Hills (Krishna-Godavari Alluvial)',
    monthly_climatology: [
      { month: 'Jan', rain_mm: 5.0, temp_c: 24.2 },
      { month: 'Feb', rain_mm: 8.0, temp_c: 27.5 },
      { month: 'Mar', rain_mm: 12.0, temp_c: 32.1 },
      { month: 'Apr', rain_mm: 18.0, temp_c: 36.8 },
      { month: 'May', rain_mm: 45.0, temp_c: 40.2 },
      { month: 'Jun', rain_mm: 135.0, temp_c: 34.5 },
      { month: 'Jul', rain_mm: 245.0, temp_c: 30.8 },
      { month: 'Aug', rain_mm: 210.0, temp_c: 29.8 },
      { month: 'Sep', rain_mm: 175.0, temp_c: 30.5 },
      { month: 'Oct', rain_mm: 125.0, temp_c: 31.0 },
      { month: 'Nov', rain_mm: 52.0, temp_c: 28.0 },
      { month: 'Dec', rain_mm: 15.0, temp_c: 25.1 }
    ]
  };

  const getRiskBadge = (level: string) => {
    if (level.includes('High') || level.includes('Severe') || level.includes('Extreme')) {
      return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">{level}</span>;
    }
    if (level.includes('Moderate')) {
      return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">{level}</span>;
    }
    return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">{level}</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 mb-1">
          <CloudLightning className="w-4 h-4" />
          <span>MODULE E &bull; TERRACLIMATE AI & ISRO MOSDAC</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Climate Vulnerability & Multi-Hazard Disaster Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical precipitation regimes, extreme 24h rainfall modeling, heatwave microclimate risks, and resilient infrastructure zoning.
        </p>
      </div>

      {/* Probabilistic Disclaimer */}
      <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-2xl flex items-start space-x-3 text-xs text-rose-200">
        <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-rose-300 font-semibold">Climate Hazard Disclaimer (NDMA & WMO Protocol):</strong>
          <p className="leading-relaxed">
            {c.disclaimer || "Climate risk classifications are probabilistic susceptibility models derived from historical satellite archives (ISRO MOSDAC / IMD 1980-2024). They do NOT represent deterministic guaranteed predictions of future singular disaster events."}
          </p>
        </div>
      </div>

      {/* Hazard Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Flood Inundation</span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="pt-1">{getRiskBadge(c.flood_susceptibility)}</div>
          <p className="text-[11px] text-slate-400">
            24h Peak Rainfall: <strong className="text-white font-mono">{c.extreme_rainfall_24h_mm} mm</strong>
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Heatwave & UHI Risk</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className="pt-1">{getRiskBadge(c.heatwave_risk)}</div>
          <p className="text-[11px] text-slate-400">
            Summer Peak Ambient: <strong className="text-white font-mono">{c.summer_peak_temp_c}°C</strong>
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Drought Vulnerability</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="pt-1">{getRiskBadge(c.drought_risk)}</div>
          <p className="text-[11px] text-slate-400">
            Annual Rainfall: <strong className="text-white font-mono">{c.annual_rainfall_avg_mm} mm</strong>
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Cyclone / Wind Storm</span>
            <Wind className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="pt-1">{getRiskBadge(c.cyclone_risk.split(' ')[0])}</div>
          <p className="text-[11px] text-slate-400 truncate" title={c.cyclone_risk}>
            {c.cyclone_risk}
          </p>
        </div>
      </div>

      {/* Climatology Chart: Rainfall & Temperature */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Monthly Climatology & Monsoon Dynamics</h2>
            <p className="text-xs text-slate-400">Monthly Precipitation (mm) & Average Ambient Temperature (°C) from ISRO MOSDAC INSAT-3D Archive</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">{c.climate_zone_india}</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={c.monthly_climatology || []} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis yAxisId="left" stroke="#06b6d4" tickFormatter={(v) => `${v}mm`} fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tickFormatter={(v) => `${v}°C`} domain={[15, 50]} fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar yAxisId="left" name="Rainfall (mm)" dataKey="rain_mm" fill="#06b6d4" radius={[6, 6, 0, 0]} opacity={0.8} />
              <Line yAxisId="right" name="Temperature (°C)" type="monotone" dataKey="temp_c" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resilience Recommendations & Evacuation Routes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center">
            <ShieldAlert className="w-4 h-4 text-emerald-400 mr-2" />
            Statutory Disaster Buffer Zones
          </h3>
          <ul className="text-xs text-slate-300 space-y-2">
            {(c.disaster_buffer_zones || []).map((buf: string, idx: number) => (
              <li key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                <span>{buf}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center">
            <Navigation className="w-4 h-4 text-cyan-400 mr-2" />
            Emergency Evacuation & Resilient Infrastructure
          </h3>
          <ul className="text-xs text-slate-300 space-y-2">
            {(c.emergency_evacuation_routes || []).map((route: string, idx: number) => (
              <li key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                <span>{route}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
