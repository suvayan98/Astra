import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Droplets,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Info,
  Waves,
  Sparkles,
} from 'lucide-react';
import { StressTestResponse } from '../types';

interface StressTestTabProps {
  stressData: StressTestResponse;
}

export const StressTestTab: React.FC<StressTestTabProps> = ({ stressData }) => {
  const {
    horizon,
    targetPopulation,
    currentDemandMLD,
    horizonDemandMLD,
    horizonBaseSupplyMLD,
    stressIndex,
    stressCategory,
    floodStressBadge,
    timeseries,
    recommendation,
  } = stressData;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Sustainable':
        return 'bg-emerald-100 border-emerald-300 text-emerald-800';
      case 'Stressed':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'Critical Deficit':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Top Banner: Water Stress Index Gauge */}
      <div className="card-soft-blue rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>Horizon {horizon} Water Balance Stress Index</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Physical water balance model based on MOSDAC INSAT-3D rainfall, calibrated catchment yield & 135 lpcd consumption.
          </p>
        </div>

        {/* Index Pill & Status */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right">
            <div className="text-3xl font-black text-slate-900 leading-none">
              {stressIndex.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Demand / Supply
            </span>
          </div>
          <span
            className={`px-3.5 py-1.5 text-xs font-black rounded-full uppercase tracking-wider border shadow-xs ${getCategoryColor(
              stressCategory
            )}`}
          >
            {stressCategory}
          </span>
        </div>
      </div>

      {/* Flood Stress Badge Callout */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <Waves className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-xs font-extrabold text-slate-900">100-Year Climate Flood Hazard Exposure</div>
            <div className="text-[11px] text-slate-500">Based on Bhuvan flood zonation & 30m HAND terrain elevation</div>
          </div>
        </div>
        <span className="px-3.5 py-1 text-xs font-bold bg-sky-100 border border-blue-200 text-blue-800 rounded-full">
          {floodStressBadge?.label || floodStressBadge?.category || 'Low Exposure'}
        </span>
      </div>

      {/* 2026-2050 Water Demand vs Sustainable Supply Timeseries Chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>2026–{horizon} Physical Supply vs Demand Trajectory (MLD)</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
            CPHEEO 135 lpcd
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeseries} margin={{ top: 10, right: 15, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                  fontSize: '11px',
                  color: '#0f172a',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="baseSupplyMLD"
                name="Catchment + External Supply"
                fill="#3b82f6"
                fillOpacity={0.15}
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="demandMLD"
                name="Municipal Demand"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#ef4444' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed font-medium">
          {recommendation}
        </div>
      </div>
    </div>
  );
};
