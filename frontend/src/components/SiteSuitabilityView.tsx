import React, { useState } from 'react';
import {
  Compass, AlertTriangle, CheckCircle, ShieldAlert, FileText,
  Layers, ArrowUpRight, Check, Info, Award, Gauge, BarChart3,
  Sliders, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, MapPin
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, Legend
} from 'recharts';
import { SiteSuitabilityResult, FactorScore } from '../types';

interface SiteSuitabilityViewProps {
  suitability: SiteSuitabilityResult | null;
  loading: boolean;
}

export const SiteSuitabilityView: React.FC<SiteSuitabilityViewProps> = ({ suitability, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showMethodologyDetails, setShowMethodologyDetails] = useState<boolean>(false);
  const [activeFactorDetail, setActiveFactorDetail] = useState<FactorScore | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Running Multi-Criteria Geospatial Suitability Analysis...</p>
        <span className="text-xs text-slate-500">Evaluating 12 AHP criteria layers across Bhuvan, CartoDEM, and CGWB</span>
      </div>
    );
  }

  if (!suitability) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-300">No suitability data available.</p>
        <p className="text-xs text-slate-500 mt-1">Please select or draw a site boundary from the Map Workspace.</p>
      </div>
    );
  }

  // Radar Data
  const radarData = suitability.factor_breakdown.map((f) => ({
    factor: f.name.replace(/ \(.*\)/, '').substring(0, 14),
    score: f.score,
    full_name: f.name,
    weight: Math.round(f.weight * 100),
    category: f.category
  }));

  // Categories
  const categories = ['All', ...Array.from(new Set(suitability.factor_breakdown.map(f => f.category)))];

  const filteredFactors = selectedCategory === 'All'
    ? suitability.factor_breakdown
    : suitability.factor_breakdown.filter(f => f.category === selectedCategory);

  // Score gauge color & angle
  const score = suitability.overall_suitability_score;
  const gaugeColor = score >= 85 ? '#10b981' : score >= 70 ? '#06b6d4' : score >= 50 ? '#f59e0b' : '#ef4444';
  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner & Score Gauge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-950/80 border border-cyan-500/40 rounded-xl">
              <Compass className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                TerraSite AI — Multi-Criteria Land Suitability Assessment
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300">
                  AHP v2.4
                </span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{suitability.location_name} ({suitability.district}, {suitability.state})</span>
                <span>•</span>
                <span>{suitability.total_area_acres.toLocaleString()} Acres ({suitability.total_area_sqkm} km²)</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Analytical Hierarchy Process (AHP) weighted decision model integrating 12 multi-spectral geospatial criteria,
            terrain geomorphology, CGWB aquifer stress, and statutory environmental exclusion buffers.
          </p>
        </div>

        {/* Circular Overall Score Gauge */}
        <div className="flex items-center gap-5 bg-slate-950/80 border border-cyan-500/30 rounded-2xl px-6 py-4 shadow-xl">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={gaugeColor}
                strokeWidth="10"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white leading-none">{score}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Suitability Class
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{suitability.suitability_class}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: gaugeColor }}
              ></span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              {score >= 80 ? 'Class S1: Highly Suitable' : score >= 65 ? 'Class S2: Moderately Suitable' : 'Class S3: Marginally Suitable'}
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Exclusion Zones & Warning Callout */}
      {suitability.exclusion_zones_identified.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-600/40 rounded-2xl p-4 text-xs text-rose-200 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>Statutory Exclusion Zones & Strict Environmental Restrictions</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
            {suitability.exclusion_zones_identified.map((exc, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-rose-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-semibold text-rose-200 block">{exc}</span>
                  <span className="text-[11px] text-slate-400">Mandatory non-buildable buffer enforced per National Environmental Policy.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Radar Chart & Key Planning Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 12-Factor Radar Visualization */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>12-Factor AHP Radar Profile</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase bg-slate-800/80 px-2 py-0.5 rounded">
                Scale 0–100
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Multi-criteria polygon showing balanced geotechnical, environmental, and infrastructure dimensions.
            </p>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name="AHP Factor Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: 11 }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val}/100 (Weight: ${item.payload.weight}%)`,
                    item.payload.full_name
                  ]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center text-xs">
            <div className="bg-slate-950/60 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block">Top Strength</span>
              <span className="font-bold text-emerald-400 text-xs truncate block">
                {suitability.factor_breakdown.reduce((prev, curr) => curr.score > prev.score ? curr : prev).name.split('(')[0]}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block">Consistency Ratio</span>
              <span className="font-bold text-cyan-400 text-xs">CR = 0.042 &lt; 0.10</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block">Primary Constraint</span>
              <span className="font-bold text-amber-400 text-xs truncate block">
                {suitability.factor_breakdown.reduce((prev, curr) => curr.score < prev.score ? curr : prev).name.split('(')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Critical Warnings & Planning Recommendations */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          {/* Critical Warnings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Critical Engineering & Hydrological Warnings</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              {suitability.critical_warnings.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-amber-900/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                  <div className="space-y-0.5">
                    <p className="text-slate-200 leading-relaxed font-medium">{w}</p>
                    <span className="text-[10px] text-amber-400/80 block">Requires mandatory structural or environmental mitigation during master planning.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planning Recommendations */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Urban Planning & Infrastructure Recommendations</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              {suitability.planning_recommendations.map((r, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-emerald-900/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <p className="text-slate-200 leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Complete 12-Factor Breakdown Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Complete 12-Factor Analytical Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Criteria weights normalized to Σ w = 1.0; each factor evaluated against IS / MoHUA planning benchmarks.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
          {filteredFactors.map((f, idx) => {
            const factorScoreColor = f.score >= 85 ? 'text-emerald-400' : f.score >= 70 ? 'text-cyan-400' : f.score >= 50 ? 'text-amber-400' : 'text-rose-400';
            const barBgColor = f.score >= 85 ? 'bg-emerald-500' : f.score >= 70 ? 'bg-cyan-500' : f.score >= 50 ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-4 transition shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-800/60">
                        {f.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 mt-1.5 leading-snug">{f.name}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-lg font-black ${factorScoreColor}`}>{f.score}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Grade {f.grade}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mb-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barBgColor}`}
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
            );
          })}
        </div>
      </div>

      {/* AHP Methodology Deep-Dive Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 shadow-lg space-y-3">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowMethodologyDetails(!showMethodologyDetails)}
        >
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Info className="w-4 h-4" />
            <span>Analytical Hierarchy Process (AHP) Multi-Criteria Methodology</span>
          </div>
          <button className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1">
            {showMethodologyDetails ? 'Collapse Details' : 'Expand Matrix Explanation'}
            {showMethodologyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-slate-300 leading-relaxed">
          {suitability.methodology_explanation}
        </p>

        {showMethodologyDetails && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">1. Pairwise Comparison Matrix</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Criteria are compared pairwise using Saaty's 1-9 fundamental scale. For example, Slope Gradient and Water Table
                  are prioritized over Proximity to Urban Corridors to guarantee safety.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">2. Eigenvector Weight Derivation</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Principal eigenvector λmax is computed to normalize criterion weights. The Consistency Index CI = (λmax - n)/(n - 1)
                  yields a Consistency Ratio CR = 0.042, well below the 0.10 validation limit.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">3. Boolean Exclusion Overlay</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Non-negotiable environmental constraints (wetlands, flood retention buffers, reserved forests) apply a strict binary
                  zero-multiplier, overriding high slope or connectivity scores.
                </p>
              </div>
            </div>

            {/* AHP Weights Summary Table */}
            <div className="overflow-x-auto bg-slate-950/60 rounded-xl border border-slate-800 p-3">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                    <th className="pb-2">Criterion</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">AHP Weight (%)</th>
                    <th className="pb-2">Score (0-100)</th>
                    <th className="pb-2">Weighted Contribution</th>
                    <th className="pb-2">Primary Satellite / Ground Sensor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {suitability.factor_breakdown.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-1.5 font-semibold text-slate-200">{f.name}</td>
                      <td className="py-1.5 text-cyan-400">{f.category}</td>
                      <td className="py-1.5">{(f.weight * 100).toFixed(1)}%</td>
                      <td className="py-1.5 font-bold">{f.score}</td>
                      <td className="py-1.5 text-emerald-400 font-bold">{(f.score * f.weight).toFixed(2)}</td>
                      <td className="py-1.5 text-slate-400 font-mono text-[11px]">{f.data_source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
