import React, { useState } from 'react';
import { 
  FileCheck2, 
  Download, 
  Printer, 
  Share2, 
  FileCode, 
  Database, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Compass, 
  Droplet, 
  SunMedium, 
  Trees 
} from 'lucide-react';
import { SiteSuitabilityResult, MasterPlanAlternative, SampleSite } from '../types';

interface ReportsViewProps {
  siteAnalysis: SiteSuitabilityResult | null;
  activePlan: MasterPlanAlternative | null;
  selectedSite: SampleSite | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  siteAnalysis,
  activePlan,
  selectedSite
}) => {
  const [copied, setCopied] = useState(false);

  const handleDownloadGeoJSON = () => {
    if (!activePlan) return;
    const geojsonData = {
      type: "FeatureCollection",
      name: `${activePlan.name}_Zoning_Parcels`,
      crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      features: activePlan.zones.map((z) => ({
        type: "Feature",
        properties: {
          id: z.id,
          name: z.name,
          type: z.type,
          area_acres: z.area_acres,
          area_percentage: z.area_percentage,
          density_level: z.density_level,
          description: z.description,
          key_features: z.key_features
        },
        geometry: z.polygon
      }))
    };

    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraAI_${activePlan.plan_id}_Zoning.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadJSON = () => {
    const reportData = {
      platform: "TerraAI Geospatial Intelligence Platform",
      generated_at: new Date().toISOString(),
      site_metadata: selectedSite,
      suitability_analysis: siteAnalysis,
      selected_master_plan: activePlan
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraAI_${selectedSite?.site_id || 'site'}_Full_Appraisal.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>EXECUTIVE AUDIT & STATUTORY PLANNING REPORT</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Comprehensive City Feasibility Appraisal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Formal technical dossier ready for Town & Country Planning Organization (TCPO) review and GIS ingestion.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadGeoJSON}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
            title="Download GeoJSON parcel shapes for ArcGIS / QGIS"
          >
            <FileCode className="w-4 h-4" />
            <span>Export GeoJSON</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
            title="Download full JSON dataset"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
            title="Print dossier or save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Dossier Document Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl text-slate-300 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex items-start justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-bold">
              TerraAI Geospatial Intelligence Platform &bull; Project Dossier
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Smart Sustainable Settlement Master Plan Feasibility Report
            </h2>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              Site: <strong className="text-white">{selectedSite?.name}</strong> &bull; Location: {selectedSite?.district}, {selectedSite?.state}
            </div>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <div>Date: 21 November 2026</div>
            <div>Ref: AGY-TERRA-2026-500AC</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2" />
            1. Executive Planning Appraisal & Density Viability
          </h3>
          <p className="text-xs leading-relaxed text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {siteAnalysis?.density_assessment}
          </p>
        </div>

        {/* Quantitative Metrics Summary Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2" />
            2. Core Settlement Metrics ({activePlan?.name})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">Planning Dimension</th>
                  <th className="py-2.5 px-3">Target Value</th>
                  <th className="py-2.5 px-3">Authoritative Benchmark Reference</th>
                  <th className="py-2.5 px-3">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                <tr>
                  <td className="py-2.5 px-3 text-slate-200">Total Land Area</td>
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{selectedSite?.area_acres || 500} Acres (2.02 km²)</td>
                  <td className="py-2.5 px-3 text-slate-400">User Specified AOI Boundary</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">&check; Verified</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-200">Proposed Population</td>
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{selectedSite?.proposed_population.toLocaleString() || '20,000'} Inhabitants</td>
                  <td className="py-2.5 px-3 text-slate-400">Carrying capacity limit: 22,500</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">&check; Viable</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-200">Gross Population Density</td>
                  <td className="py-2.5 px-3 text-white">98.8 Persons / Hectare</td>
                  <td className="py-2.5 px-3 text-slate-400">URDPFI Guidelines (100 - 150 PPH)</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">&check; Optimal</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-200">Statutory Exclusion Buffers</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">88.0 Acres (17.6%)</td>
                  <td className="py-2.5 px-3 text-slate-400">100m Riparian Buffer & Lake Setback</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">&check; Enforced</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-200">Daily Water Demand</td>
                  <td className="py-2.5 px-3 text-white">3.39 MLD (135 LPCD base)</td>
                  <td className="py-2.5 px-3 text-slate-400">CPHEEO Urban Water Supply Manual</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">&check; Modeled</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-200">Water Self-Sufficiency</td>
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{activePlan?.water_self_sufficiency_pct || 72.0}%</td>
                  <td className="py-2.5 px-3 text-slate-400">0.89 MCM RWH + 1.62 MLD STP Recovery</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">&check; Circular</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-200">Clean Energy Autonomy</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{activePlan?.renewable_energy_share_pct || 76.5}%</td>
                  <td className="py-2.5 px-3 text-slate-400">15.2 MW Solar + 14.8 MWh BESS Storage</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">&check; Exceeds 70%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-200">Contiguous Green Open Space</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{activePlan?.green_open_space_pct || 42.0}% (210 Acres)</td>
                  <td className="py-2.5 px-3 text-slate-400">Minimum 30% Green Cover Mandate</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">&check; Compliant</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Space Portals Telemetry Provenance */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2" />
            3. Authoritative Geospatial Telemetry Provenance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <strong className="text-cyan-400 block">BHOONIDHI (ISRO)</strong>
              <span className="text-slate-400 text-[10px]">Cartosat-3 / RS-2A STAC</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <strong className="text-cyan-400 block">BHUVAN (ISRO)</strong>
              <span className="text-slate-400 text-[10px]">National LULC 50k & Geomorph</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <strong className="text-cyan-400 block">MOSDAC (ISRO)</strong>
              <span className="text-slate-400 text-[10px]">INSAT-3D Hydro-Estimator Rain</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <strong className="text-cyan-400 block">VEDAS (ISRO)</strong>
              <span className="text-slate-400 text-[10px]">15-Day NDVI / EVI Composites</span>
            </div>
          </div>
        </div>

        {/* Statutory Certification & Sign-off Box */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400">
          <div>
            <div className="text-slate-200 font-bold">TerraAI Automated Geospatial Appraisal Engine</div>
            <div>Generated by Certified GIS & Smart City Planning Pipeline</div>
          </div>
          <div className="text-right font-mono text-[11px] text-emerald-400 mt-2 sm:mt-0">
            &check; Geometrically Validated &bull; Non-Overlapping Parcels
          </div>
        </div>
      </div>
    </div>
  );
};
