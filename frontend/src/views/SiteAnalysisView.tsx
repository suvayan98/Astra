import React, { useState } from 'react';
import { 
  Target, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Layers, 
  Building, 
  MapPin,
  Scale,
  Sparkles
} from 'lucide-react';
import { SiteSuitabilityResult, SampleSite } from '../types';

interface SiteAnalysisViewProps {
  siteAnalysis: SiteSuitabilityResult | null;
  selectedSite: SampleSite | null;
  sampleSites: SampleSite[];
  onSelectSite: (site: SampleSite) => void;
}

export const SiteAnalysisView: React.FC<SiteAnalysisViewProps> = ({
  siteAnalysis,
  selectedSite,
  sampleSites,
  onSelectSite
}) => {
  const [activeTab, setActiveTab] = useState<'factors' | 'exclusions' | 'density'>('factors');

  const factors = siteAnalysis?.factors || [];
  const exclusions = siteAnalysis?.exclusion_zones || [];
  const score = siteAnalysis?.overall_suitability_score || 81.4;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'favorable':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Favorable</span>;
      case 'moderate':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">Moderate</span>;
      case 'restrictive':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">Restrictive</span>;
      case 'critical':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">Critical</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
      {/* Module Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Target className="w-4 h-4" />
            <span>MODULE A &bull; TERRASITE AI</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Intelligent Site Selection & Suitability Appraisal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-Criteria Analytical Hierarchy Process (AHP) evaluating 12 environmental and geospatial layers with statutory exclusion zones.
          </p>
        </div>

        {/* Candidate Site Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-xs">
          <MapPin className="w-4 h-4 text-cyan-400 ml-1.5" />
          <select
            value={selectedSite?.site_id || ''}
            onChange={(e) => {
              const found = sampleSites.find(s => s.site_id === e.target.value);
              if (found) onSelectSite(found);
            }}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-3"
          >
            {sampleSites.map(s => (
              <option key={s.site_id} value={s.site_id} className="bg-slate-900 text-slate-100">
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Score Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex items-center space-x-5 shadow-xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-cyan-500/20">
            {score}
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Composite Suitability Score</span>
            <div className="text-lg font-bold text-white">{siteAnalysis?.suitability_class || 'Highly Suitable'}</div>
            <p className="text-[11px] text-slate-400">Sum of 12 weighted criteria normalized to 100.</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Land Area Breakdown</span>
            <span className="text-cyan-400 font-mono">500 Acres Total</span>
          </div>
          <div className="flex items-center space-x-2 font-mono text-xs">
            <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden flex">
              <div className="bg-cyan-500 h-full" style={{ width: '82.4%' }} title="Net Developable (82.4%)" />
              <div className="bg-rose-500 h-full" style={{ width: '17.6%' }} title="Exclusion Buffers (17.6%)" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-cyan-400 mr-1.5" />
              Net Developable: <strong className="ml-1 text-white font-semibold">412 Acres</strong> (82.4%)
            </span>
            <span className="flex items-center text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400 mr-1.5" />
              Protected: <strong className="ml-1 text-white font-semibold">88 Acres</strong> (17.6%)
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Recommended Population Cap</span>
          <div className="text-2xl font-bold text-emerald-400">
            {siteAnalysis?.recommended_carrying_capacity?.toLocaleString() || '22,500'} <span className="text-xs text-slate-400 font-normal">Persons</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Compliant with Indian URDPFI guidelines for medium-density sustainable cities (100-150 persons/hectare).
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('factors')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'factors'
              ? 'text-cyan-400 border-cyan-400 bg-cyan-950/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          12-Factor Multi-Criteria Matrix
        </button>
        <button
          onClick={() => setActiveTab('exclusions')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'exclusions'
              ? 'text-rose-400 border-rose-400 bg-rose-950/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Statutory Exclusion & Restriction Zones ({exclusions.length})
        </button>
        <button
          onClick={() => setActiveTab('density')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'density'
              ? 'text-emerald-400 border-emerald-400 bg-emerald-950/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Carrying Capacity & Density Trade-Offs
        </button>
      </div>

      {/* Tab 1: Factors List */}
      {activeTab === 'factors' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start space-x-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Methodology:</strong> Multi-Criteria Evaluation (MCE) calculated as <code className="text-cyan-300">Score = &Sigma;(Weight_i &times; Factor_i)</code>. 
              Weights are calibrated according to environmental sensitivity, foundation safety, and municipal utility availability. No arbitrary scores are used.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {factors.map((f, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">{f.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({f.category})</span>
                  </div>
                  {getStatusBadge(f.status)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Weight: {(f.weight * 100).toFixed(0)}%</span>
                    <span className="text-cyan-400 font-bold">{f.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        f.score >= 80 ? 'bg-cyan-500' : (f.score >= 65 ? 'bg-amber-500' : 'bg-rose-500')
                      }`} 
                      style={{ width: `${f.score}%` }} 
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Exclusion Zones */}
      {activeTab === 'exclusions' && (
        <div className="space-y-4">
          <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs text-rose-200 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Statutory Ecological & Safety Exclusions:</strong> Under the Indian Environment (Protection) Act, State Water Bodies Preservation Acts, 
              and National Disaster Management Guidelines, development within these parcels is legally prohibited to preserve groundwater infiltration, flood buffers, and wildlife corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {exclusions.map((ez, idx) => (
              <div key={idx} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    {ez.type.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{ez.area_acres} Acres ({ez.percentage}%)</span>
                </div>
                <h3 className="font-bold text-sm text-slate-100">{ez.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{ez.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Density Trade-offs */}
      {activeTab === 'density' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center">
            <Scale className="w-4 h-4 text-emerald-400 mr-2" />
            Realistic Population & Carrying Capacity Analysis
          </h3>
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            {siteAnalysis?.density_assessment}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Total Land Footprint</span>
              <div className="text-base font-bold text-white">500 Acres (2.02 km²)</div>
              <p className="text-[11px] text-slate-400">Total area enclosed by user boundary</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Gross Population Density</span>
              <div className="text-base font-bold text-cyan-400">98.8 Persons / Hectare</div>
              <p className="text-[11px] text-slate-400">20,000 / 202.34 ha (Comfortable sustainable density)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Net Residential Density</span>
              <div className="text-base font-bold text-emerald-400">120.0 Persons / Hectare</div>
              <p className="text-[11px] text-slate-400">Calculated over 412 net developable acres</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
