import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Database,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Mountain,
  Droplets,
  Trees,
  Compass,
  Zap,
} from 'lucide-react';
import { SiteScorecard, CandidateSite, PriorityPreset } from '../types';

interface ScorecardTabProps {
  scorecards: Record<string, SiteScorecard>;
  candidateSites: CandidateSite[];
  selectedSiteCode: 'A' | 'B' | 'C';
  onSelectSiteCode: (code: 'A' | 'B' | 'C') => void;
  priorityPreset: PriorityPreset;
}

export const ScorecardTab: React.FC<ScorecardTabProps> = ({
  scorecards,
  candidateSites,
  selectedSiteCode,
  onSelectSiteCode,
}) => {
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeSite = candidateSites.find((s) => s.code === selectedSiteCode) || candidateSites[0];
  const scorecard = scorecards[activeSite?.id] || Object.values(scorecards)[0];

  if (!scorecard) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <p className="font-bold text-slate-800 text-sm">Extracting ISRO Zonal Grids...</p>
        <p className="text-xs text-slate-500">Click "Run Spatial Screening" to calculate multi-criteria indicators.</p>
      </div>
    );
  }

  // Filter indicators
  const filteredIndicators = scorecard.indicators.filter((ind) => {
    const matchesPillar = selectedPillarFilter === 'all' || ind.pillar === selectedPillarFilter;
    const matchesSearch =
      ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.source.dataset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.source.portal.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPillar && matchesSearch;
  });

  const getPortalBadgeColor = (portal: string) => {
    switch (portal) {
      case 'Bhoonidhi':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Bhuvan':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'MOSDAC':
        return 'bg-cyan-100 text-cyan-900 border-cyan-200';
      case 'VEDAS':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPillarIcon = (name: string) => {
    if (name.includes('Terrain')) return <Mountain className="w-3.5 h-3.5 text-emerald-600" />;
    if (name.includes('Water')) return <Droplets className="w-3.5 h-3.5 text-blue-600" />;
    if (name.includes('Hazard')) return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
    if (name.includes('Environment')) return <Trees className="w-3.5 h-3.5 text-lime-600" />;
    return <Zap className="w-3.5 h-3.5 text-purple-600" />;
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Site Selector Pills Capsule */}
      <div className="bg-slate-100/80 p-1 rounded-full border border-slate-200 flex items-center justify-between gap-1 shadow-xs">
        {candidateSites.map((site) => {
          const isSelected = site.code === selectedSiteCode;
          const siteCard = scorecards[site.id];
          const hasDb = siteCard?.hasDealBreaker;
          return (
            <button
              key={site.id}
              onClick={() => onSelectSiteCode(site.code)}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: hasDb ? '#ef4444' : site.color }}
              ></span>
              <span>Site {site.code}</span>
              {siteCard && (
                <span className={`text-[11px] font-extrabold ${hasDb ? 'text-red-600' : 'text-blue-600'}`}>
                  ({hasDb ? 'Deficit' : `${siteCard.overallScore.toFixed(0)}`})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3 Top Hero Metric Cards (Direct inspiration from screenshot top row) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total MCA Score (Soft Blue) */}
        <div className="bg-sky-50/90 border border-sky-100 rounded-3xl p-4 text-center shadow-xs flex flex-col justify-between">
          <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">MCA Score</div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {scorecard.overallScore.toFixed(1)}
          </div>
          <div className="text-[11px] text-sky-600 font-semibold mt-0.5">Scale: 0 – 100 Index</div>
        </div>

        {/* Card 2: Planning Verdict (Soft Pink / Rose if deficit, soft emerald if suitable) */}
        <div
          className={`border rounded-3xl p-4 text-center shadow-xs flex flex-col justify-between ${
            scorecard.hasDealBreaker
              ? 'bg-rose-50/90 border-rose-100'
              : 'bg-pink-50/90 border-pink-100'
          }`}
        >
          <div className={`text-xs font-bold uppercase tracking-wider ${scorecard.hasDealBreaker ? 'text-rose-800' : 'text-pink-800'}`}>
            Suitability Tier
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
            {scorecard.verdict.split('(')[0].trim()}
          </div>
          <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
            Tier {scorecard.verdictTier} • Rank #{scorecard.rank}
          </div>
        </div>

        {/* Card 3: ISRO Ground-Truth (Clean White / Slate) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 text-center shadow-xs flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">ISRO Confidence</div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {scorecard.confidencePct}%
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ground-Truth
          </div>
        </div>
      </div>

      {/* Deal-Breaker Banner */}
      {scorecard.hasDealBreaker ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-rose-800 font-extrabold text-xs uppercase tracking-wide">
            <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Statutory Spatial Deal-Breaker Triggered</span>
          </div>
          {scorecard.dealBreakers
            .filter((db) => db.triggered)
            .map((db) => (
              <div key={db.id} className="text-xs bg-white p-3 rounded-xl border border-rose-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{db.rule}</span>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-mono font-bold">
                    {db.actualValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{db.description}</p>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center space-x-2.5 text-xs text-emerald-900 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Zero Hard-Stop Dealbreakers:</strong> Parcel clears all Bhuvan flood zones, CartoDEM slope thresholds, and CRZ/wetland boundaries.
          </span>
        </div>
      )}

      {/* 5-Pillar Radar Chart Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>5-Pillar Spatial Balance Profile</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-500">0–100 Normalized</span>
        </div>

        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={scorecard.radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="pillar"
                stroke="#64748b"
                tick={{ fill: '#334155', fontSize: 10, fontWeight: 700 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#cbd5e1"
                tick={{ fill: '#94a3b8', fontSize: 9 }}
              />
              <Radar
                name={scorecard.siteName}
                dataKey="score"
                stroke={scorecard.hasDealBreaker ? '#f43f5e' : '#2563eb'}
                fill={scorecard.hasDealBreaker ? '#f43f5e' : '#3b82f6'}
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 5 Pillar Mini-Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {Object.values(scorecard.pillars).map((p) => {
            const shortName = p.name.includes('Infrastructure') ? 'Infra' : p.name.includes('Environment') ? 'Env' : p.name.split(' ')[0];
            return (
              <div
                key={p.pillar}
                className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 text-center hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-600 font-bold mb-0.5">
                  {getPillarIcon(p.name)}
                  <span>{shortName}</span>
                </div>
                <div className="text-base font-black text-slate-900">{p.rawScore.toFixed(0)}</div>
                <div className="text-[10px] text-slate-500 font-bold">Wt: {p.weight}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extracted Indicators Table (Styled like the screenshot's table) */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {/* Table Header Bar (Inspired by Scheme Name, Invested, Current, P&L bar) */}
        <div className="bg-sky-50 px-4 py-3 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Extracted Indicators & Telemetry
            </span>
          </div>

          {/* Search bar inside header */}
          <div className="relative w-40">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 pl-7 pr-2.5 py-1 text-xs rounded-full outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {filteredIndicators.map((ind) => (
            <div
              key={ind.key}
              className="px-4 py-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">{ind.name}</div>
                <div className="text-[11px] text-slate-500">
                  {ind.source.dataset} ({ind.source.vintage})
                </div>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <div className="font-extrabold text-slate-900">
                  {typeof ind.value === 'number' ? ind.value.toLocaleString() : ind.value} {ind.unit}
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPortalBadgeColor(ind.source.portal)}`}>
                  {ind.source.portal}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
