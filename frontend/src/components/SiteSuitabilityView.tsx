import React from 'react';
import {
  Compass, AlertTriangle, CheckCircle, ShieldAlert, FileText,
  Layers, ArrowUpRight, Check, Info, Award
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { SiteSuitabilityResult } from '../types';

interface SiteSuitabilityViewProps {
  suitability: SiteSuitabilityResult | null;
  loading: boolean;
}

export const SiteSuitabilityView: React.FC<SiteSuitabilityViewProps> = ({ suitability, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Running Multi-Criteria Geospatial Suitability Analysis...</p>
      </div>
    );
  }

  if (!suitability) {
    return (
      <div className="p-8 text-center text-slate-400">
        No suitability data available. Please select a site.
      </div>
    );
  }

  const radarData = suitability.factor_breakdown.map((f) => ({
    factor: f.name.replace(/ \(.*\)/, '').substring(0, 15),
    score: f.score,
    full_name: f.name
  }));

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">
              TerraSite AI — Multi-Criteria Land Suitability Assessment
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Transparent 12-factor Analytical Hierarchy Process (AHP) evaluating {suitability.total_area_acres} Acres in {suitability.location_name}.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 border border-cyan-500/30 rounded-2xl px-6 py-4 shadow-lg">
          <div className="text-right">
            <span className="block text-xs uppercase font-semibold text-slate-400">Overall Score</span>
            <span className="text-xs font-semibold text-cyan-300">{suitability.suitability_class}</span>
          </div>
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-2xl font-black text-white">{suitability.overall_suitability_score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusion Zones & Warnings Alert */}
      {suitability.exclusion_zones_identified.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-600/40 rounded-2xl p-4 text-xs text-rose-200">
          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Environmental Exclusion & Restriction Zones Identified</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {suitability.exclusion_zones_identified.map((exc, idx) => (
              <li key={idx}><span className="font-semibold text-rose-200">{exc}</span></li>
            ))}
          </ul>
        </div>
      )}

      {/* Radar Chart & Top Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 12-Factor Radar Visualization */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-200 mb-1 self-start">Suitability Factors Radar Profile</h3>
          <p className="text-xs text-slate-400 mb-2 self-start">Multi-dimensional rating across all 12 criteria (0 - 100)</p>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Warnings & Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Engineering & Hydrological Warnings</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {suitability.critical_warnings.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Key Master Planning Recommendations</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {suitability.planning_recommendations.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed 12 Factors Breakdown Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <span>Complete Factor-by-Factor Methodology Breakdown</span>
          <span className="text-xs font-normal text-slate-400">(Weights normalized to sum = 1.0)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {suitability.factor_breakdown.map((f, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                      {f.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 mt-1.5 leading-snug">{f.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-cyan-300">{f.score}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Grade {f.grade}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full mb-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      f.score >= 85 ? 'bg-emerald-500' : f.score >= 70 ? 'bg-cyan-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${f.score}%` }}
                  ></div>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {f.observation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Weight: <strong className="text-slate-200">{(f.weight * 100).toFixed(1)}%</strong></span>
                <span className="truncate max-w-[170px]" title={f.data_source}>
                  Src: {f.data_source}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Explainer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200 block mb-1">TerraAI Multi-Criteria Decision Analysis (MCDA) Standard:</strong>
          {suitability.methodology_explanation}
        </div>
      </div>
    </div>
  );
};
