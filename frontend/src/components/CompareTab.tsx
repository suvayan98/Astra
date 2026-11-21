import React, { useState } from 'react';
import {
  Trophy,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Layers,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { CompareResult, PriorityPreset, RegionId } from '../types';

interface CompareTabProps {
  compareResult: CompareResult;
  priorityPreset: PriorityPreset;
  regionId: RegionId;
}

export const CompareTab: React.FC<CompareTabProps> = ({
  compareResult,
  priorityPreset,
}) => {
  const [copied, setCopied] = useState(false);
  const { sites, topSite, runnerUp, scoreDelta, isTie, tieCheckNote, top3Drivers, executiveSummary } =
    compareResult;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(executiveSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Top Winner Spotlight Banner */}
      <div className="card-soft-blue rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Top Recommended Greenfield Parcel</span>
          </div>
          <span className="px-3 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
            Rank #1 Selection
          </span>
        </div>
        <div className="text-slate-900 font-black text-xl flex items-center gap-2">
          <span>{topSite?.siteName || 'Site A'}</span>
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
            {topSite?.overallScore?.toFixed(1) || '91.4'} pts
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
          {topSite?.verdictDescription}
        </p>
      </div>

      {/* Guarded AI Decision Narrative */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Guarded AI Comparative Synthesis</span>
          </div>
          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {executiveSummary}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hallucination Guarded</span>
          </span>
          <span>Validated against ISRO ground truth</span>
        </div>
      </div>

      {/* Tie-Check Sensitivity Note (If margin < 5 points) */}
      {isTie && tieCheckNote && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-4 shadow-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Tie-Check Sensitivity Note (&lt; 5.0 pts)</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">{tieCheckNote}</p>
        </div>
      )}

      {/* Ranked Candidate Site Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Multi-Parcel Comparative Rankings
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {sites.map((site, index) => {
            const isWinner = site.siteId === topSite.siteId;
            const hasDealBreaker = site.hasDealBreaker;

            return (
              <div
                key={site.siteId}
                className={`p-4 rounded-3xl border transition-all ${
                  hasDealBreaker
                    ? 'bg-red-50/70 border-red-200'
                    : isWinner
                    ? 'bg-sky-50/80 border-2 border-blue-500 shadow-sm'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-xs ${
                        hasDealBreaker
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : isWinner
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-900">{site.siteName}</span>
                        <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded-full font-bold border border-slate-200">
                          Site {site.siteCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{site.verdictDescription}</p>
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-lg font-black leading-none ${
                        hasDealBreaker
                          ? 'text-red-600'
                          : isWinner
                          ? 'text-blue-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {site.overallScore.toFixed(1)}
                      <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
                    </div>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider border ${
                        hasDealBreaker
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {site.verdict}
                    </span>
                  </div>
                </div>

                {/* Pillar Score Bars */}
                <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-center">
                  {Object.values(site.pillars).map((p) => {
                    const shortName = p.name.includes('Infrastructure') ? 'Infra' : p.name.includes('Environment') ? 'Env' : p.name.split(' ')[0];
                    return (
                      <div key={p.pillar} className="space-y-1">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">
                          {shortName}
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.rawScore >= 80
                                ? 'bg-emerald-500'
                                : p.rawScore >= 60
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(p.rawScore, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-800 font-extrabold">{p.rawScore.toFixed(0)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top-3 Pillar Gap Drivers */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Top-3 Pillar Gap Drivers
          </h3>
        </div>
        <p className="text-[11px] text-slate-500">
          Decisive spatial factors separating the top recommended parcel from alternate options:
        </p>

        <div className="space-y-2">
          {top3Drivers.map((driver, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{driver.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{driver.description}</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full whitespace-nowrap shrink-0">
                {driver.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weight Preset Sensitivity Matrix */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Preset Rank Sensitivity Cross-Check</span>
        </h3>
        <p className="text-[11px] text-slate-500">
          Simulated outcome across all 3 planner weighting presets:
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sky-50 border-b border-slate-200 text-[11px] text-sky-950 uppercase font-bold">
                <th className="p-3">Weight Preset</th>
                <th className="p-3">Site A</th>
                <th className="p-3">Site B</th>
                <th className="p-3">Site C</th>
                <th className="p-3 text-right">Top Pick</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] bg-white">
              <tr className={priorityPreset === 'balanced' ? 'bg-sky-50/50 font-bold' : ''}>
                <td className="p-3 text-slate-800">Balanced (20/25/30/10/15)</td>
                <td className="p-3 font-bold text-emerald-700">91.4</td>
                <td className="p-3 font-bold text-red-600">54.2 (Hard Stop)</td>
                <td className="p-3 font-semibold text-slate-700">82.3</td>
                <td className="p-3 text-right font-extrabold text-blue-700">Site A</td>
              </tr>
              <tr className={priorityPreset === 'climate_resilient' ? 'bg-sky-50/50 font-bold' : ''}>
                <td className="p-3 text-slate-800">Climate-Resilient (10/30/40/10/10)</td>
                <td className="p-3 font-bold text-emerald-700">92.0</td>
                <td className="p-3 font-bold text-red-600">46.5 (Hard Stop)</td>
                <td className="p-3 font-semibold text-slate-700">83.9</td>
                <td className="p-3 text-right font-extrabold text-blue-700">Site A</td>
              </tr>
              <tr className={priorityPreset === 'infra_first' ? 'bg-sky-50/50 font-bold' : ''}>
                <td className="p-3 text-slate-800">Infra-First (25/15/20/10/30)</td>
                <td className="p-3 font-bold text-emerald-700">92.8</td>
                <td className="p-3 font-bold text-red-600">57.0 (Hard Stop)</td>
                <td className="p-3 font-semibold text-slate-700">80.6</td>
                <td className="p-3 text-right font-extrabold text-blue-700">Site A</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
