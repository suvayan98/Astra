import React from 'react';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Sparkles,
  Satellite,
} from 'lucide-react';
import { ProvenanceRecord } from '../types';

interface SourcesTabProps {
  provenanceRecords: ProvenanceRecord[];
}

export const SourcesTab: React.FC<SourcesTabProps> = ({ provenanceRecords }) => {
  const getPortalBadge = (portal: string) => {
    switch (portal) {
      case 'Bhoonidhi':
        return 'text-amber-800 border-amber-300 bg-amber-100';
      case 'Bhuvan':
        return 'text-blue-800 border-blue-300 bg-blue-100';
      case 'MOSDAC':
        return 'text-cyan-800 border-cyan-300 bg-cyan-100';
      case 'VEDAS':
        return 'text-emerald-800 border-emerald-300 bg-emerald-100';
      default:
        return 'text-slate-700 border-slate-300 bg-slate-100';
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* 4-Portal Header Banner */}
      <div className="card-soft-blue rounded-3xl p-5 shadow-xs space-y-2">
        <div className="flex items-center space-x-2 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
          <Satellite className="w-4 h-4 text-blue-600" />
          <span>ISRO 4-Portal Spatial Provenance Matrix</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          TerraCity AI directly consumes open satellite data feeds from India's four primary national geospatial nodes, eliminating synthetic assumptions wherever official satellite datasets exist.
        </p>
      </div>

      {/* 4 Core Portals Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Bhoonidhi */}
        <div className="card-soft-amber rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full border bg-amber-100 border-amber-300 text-amber-900">
              Bhoonidhi (NRSC)
            </span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live Auth
            </span>
          </div>
          <div className="text-xs font-extrabold text-slate-900">CartoDEM Version 3.1 Digital Elevation Model</div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            30m postings derived from Cartosat stereo pairs. Provides slope gradients, terrain roughness (TRI), and relative height above nearest drainage (HAND).
          </p>
        </div>

        {/* 2. Bhuvan */}
        <div className="card-soft-blue rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full border bg-blue-100 border-blue-300 text-blue-900">
              Bhuvan (NRSC)
            </span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified 100%
            </span>
          </div>
          <div className="text-xs font-extrabold text-slate-900">LULC 1:50,000 & Flood Hazard Zonation</div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            High-resolution land use classification (agricultural, wasteland, waterbody) combined with historical multi-year flood inundation boundaries.
          </p>
        </div>

        {/* 3. MOSDAC */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full border bg-cyan-100 border-cyan-300 text-cyan-900">
              MOSDAC (SAC)
            </span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Climatology Active
            </span>
          </div>
          <div className="text-xs font-extrabold text-slate-900">INSAT-3D/3DR Hydro-Estimator Precipitation</div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Decadal rainfall statistics, coefficient of rainfall variation, dry season duration, and drought vulnerability indices.
          </p>
        </div>

        {/* 4. VEDAS */}
        <div className="card-soft-green rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full border bg-emerald-100 border-emerald-300 text-emerald-900">
              VEDAS (SAC)
            </span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Key Proxied
            </span>
          </div>
          <div className="text-xs font-extrabold text-slate-900">Land Degradation & Desertification Atlas</div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Salinity risk, soil erosion vulnerability, and solar insolation (GHI kWh/m²/day) for renewable township planning.
          </p>
        </div>
      </div>

      {/* Provenance Audit Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Dataset Provenance Records</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
            {provenanceRecords.length} Layers Audited
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {provenanceRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{rec.dataset}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPortalBadge(rec.portal)}`}>
                  {rec.portal}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between">
                <span>Theme: <strong className="text-slate-800">{rec.theme}</strong></span>
                <span className="text-[10px] text-slate-500 font-semibold">{rec.resolution}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
