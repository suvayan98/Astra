import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Printer, X, CheckCircle,
  Layers, Droplets, SunMedium, ShieldCheck, Globe
} from 'lucide-react';
import { generateFullReport } from '../api';
import { MasterPlanAlternative } from '../types';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  population: number;
  areaAcres: number;
  activePlan: MasterPlanAlternative | null;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  siteId,
  population,
  areaAcres,
  activePlan
}) => {
  if (!isOpen) return null;

  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await generateFullReport({
          site_id: siteId,
          population: population,
          area_acres: areaAcres
        });
        setReportData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [siteId, population, areaAcres]);

  const handlePrint = () => {
    window.print();
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadGeoJSON = () => {
    if (!activePlan) return;
    const featureCollection = {
      type: "FeatureCollection",
      site_name: reportData?.site_metadata?.name,
      plan_name: activePlan.name,
      features: activePlan.zones.map((z) => ({
        type: "Feature",
        id: z.id,
        properties: {
          name: z.name,
          zone_type: z.zone_type,
          area_acres: z.area_acres,
          area_percentage: z.area_percentage,
          far_ratio: z.far_ratio,
          color: z.color,
          description: z.description
        },
        geometry: z.geometry
      }))
    };
    downloadFile(JSON.stringify(featureCollection, null, 2), `${siteId}_${activePlan.plan_code}_zones.geojson`, 'application/geo+json');
  };

  const handleDownloadJSON = () => {
    if (!reportData) return;
    downloadFile(JSON.stringify(reportData, null, 2), `${siteId}_terra_ai_feasibility_report.json`, 'application/json');
  };

  const handleDownloadMarkdown = () => {
    if (!reportData || !activePlan) return;
    const md = `# TerraAI Executive Master Plan & Geospatial Feasibility Report
**Site:** ${reportData.site_metadata.name} (${reportData.site_metadata.district}, ${reportData.site_metadata.state})
**Area:** ${areaAcres} Acres (${(areaAcres * 0.00404686).toFixed(2)} km²)
**Target Population:** ${population.toLocaleString()} Inhabitants
**Overall Suitability Score:** ${reportData.suitability_assessment.overall_suitability_score} / 100 (${reportData.suitability_assessment.suitability_class})

---

## 1. Executive Demographic & Zoning Summary
- **Master Plan Selected:** ${activePlan.name} (${activePlan.paradigm})
- **Gross Population Density:** ${activePlan.gross_population_density_per_sqkm.toLocaleString()} people/km² (${activePlan.gross_density_per_acre} people/acre)
- **Walkability Score:** ${activePlan.walkability_score} / 100
- **Public Green Space:** ${activePlan.green_space_per_capita_sqm} m² per person
- **Estimated Infrastructure Capex:** ₹${activePlan.estimated_infrastructure_capex_cr_inr} Crores

---

## 2. Water Security & CGWB Assessment (CPHEEO Standard)
- **Daily Municipal Demand:** ${reportData.water_intelligence.daily_total_demand_mld} MLD (${reportData.water_intelligence.annual_water_demand_mcm} MCM/year)
- **Rainwater Harvesting Yield:** ${reportData.water_intelligence.rainwater_harvesting_potential_mld} MLD
- **DEWATS Wastewater Recovery:** ${reportData.water_intelligence.treated_wastewater_reuse_potential_mld} MLD
- **CGWB Assessment Stage:** ${reportData.water_intelligence.cgwb_data.category} (${reportData.water_intelligence.cgwb_data.stage_of_groundwater_extraction_pct}%)

---

## 3. Clean Energy & Microgrid Sizing
- **Solar GHI:** ${reportData.renewable_energy.solar_ghi_kwh_m2_day} kWh/m²/day
- **Total Solar Capacity:** ${reportData.renewable_energy.total_solar_installed_mwp} MWp
- **Annual Clean Generation:** ${reportData.renewable_energy.total_renewable_generation_gwh} GWh (Demand: ${reportData.renewable_energy.annual_settlement_electricity_demand_gwh} GWh/yr)
- **Renewable Energy Share:** ${reportData.renewable_energy.renewable_energy_share_pct}%
- **BESS Storage Battery:** ${reportData.renewable_energy.recommended_bess_capacity_mwh} MWh

---

## 4. Indian Space Data Hub Audit Trail
- **BHOONIDHI Scene ID:** ${reportData.isro_audit_trail.bhoonidhi_scene}
- **BHUVAN Thematic LULC:** ${reportData.isro_audit_trail.bhuvan_lulc_classification}
- **MOSDAC Radar / Station:** ${reportData.isro_audit_trail.mosdac_weather_radar}
- **VEDAS NDVI Composite:** ${reportData.isro_audit_trail.vedas_ndvi_composite}

---
*Report Generated by TerraAI Geospatial Intelligence Platform.*
`;
    downloadFile(md, `${siteId}_executive_summary.md`, 'text/markdown');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              Executive Master Plan & Geospatial Feasibility Report
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadGeoJSON}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Download Master Plan Zones as GeoJSON Polygon Features"
            >
              <Download className="w-3.5 h-3.5" />
              <span>GeoJSON</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Download Executive Summary as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Download Full Analysis Data as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin text-xs text-slate-200">
          {loading ? (
            <div className="text-center py-16 text-cyan-400">
              Generating consolidated master plan audit report...
            </div>
          ) : reportData ? (
            <div className="space-y-6" id="printable-report">
              {/* Document Header */}
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block mb-1">
                  OFFICIAL SMART CITY MASTER PLAN DOSSIER
                </span>
                <h1 className="text-xl font-black text-slate-100">{reportData.title}</h1>
                <p className="text-slate-400 mt-1">
                  Location: {reportData.site_metadata.district}, {reportData.site_metadata.state} • Area: {areaAcres} Acres ({(areaAcres * 0.00404686).toFixed(2)} km²) • Population: {population.toLocaleString()}
                </p>
              </div>

              {/* Suitability Score Summary */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold block">AHP Suitability Grade</span>
                  <span className="text-sm font-bold text-cyan-300">{reportData.suitability_assessment.suitability_class}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">
                    {reportData.suitability_assessment.overall_suitability_score} / 100
                  </span>
                </div>
              </div>

              {/* Master Plan Zones Table */}
              {activePlan && (
                <div>
                  <h3 className="text-sm font-bold text-slate-100 mb-2">Master Plan Zoning Partition ({activePlan.name})</h3>
                  <table className="w-full text-left border-collapse border border-slate-800">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                        <th className="p-2 border border-slate-800">Zone</th>
                        <th className="p-2 border border-slate-800 text-right">Acres</th>
                        <th className="p-2 border border-slate-800 text-right">Share (%)</th>
                        <th className="p-2 border border-slate-800 text-right">FAR</th>
                        <th className="p-2 border border-slate-800">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {activePlan.zones.map((z: any) => (
                        <tr key={z.id}>
                          <td className="p-2 border border-slate-800 font-semibold">{z.name}</td>
                          <td className="p-2 border border-slate-800 text-right text-cyan-400 font-bold">{z.area_acres}</td>
                          <td className="p-2 border border-slate-800 text-right text-emerald-400">{z.area_percentage}%</td>
                          <td className="p-2 border border-slate-800 text-right font-mono">{z.far_ratio}</td>
                          <td className="p-2 border border-slate-800 text-slate-300">{z.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Space Data Hub Audit Trail */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  ISRO Space Data Hub Integration Audit Records
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong className="text-slate-400">BHOONIDHI STAC:</strong> {reportData.isro_audit_trail.bhoonidhi_scene}</div>
                  <div><strong className="text-slate-400">BHUVAN LULC:</strong> {reportData.isro_audit_trail.bhuvan_lulc_classification}</div>
                  <div><strong className="text-slate-400">MOSDAC METEOROLOGY:</strong> {reportData.isro_audit_trail.mosdac_weather_radar}</div>
                  <div><strong className="text-slate-400">VEDAS NDVI COMPOSITE:</strong> {reportData.isro_audit_trail.vedas_ndvi_composite}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
