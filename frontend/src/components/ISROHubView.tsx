import React, { useState, useEffect } from 'react';
import {
  Cpu, Globe, Satellite, ExternalLink, Key, CheckCircle,
  AlertCircle, RefreshCw, Database, Radio, Search, Filter, Layers, Clock
} from 'lucide-react';
import { ISROHubOverview, ISROPortalStatus } from '../types';
import { getISROStatus, fetchISROSource, updateISROCredentials } from '../api';

interface ISROHubViewProps {
  onOpenCredentialsModal: () => void;
  siteName: string;
}

export const ISROHubView: React.FC<ISROHubViewProps> = ({ onOpenCredentialsModal, siteName }) => {
  const [hubOverview, setHubOverview] = useState<ISROHubOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // STAC Search Tester State
  const [stacCollection, setStacCollection] = useState<string>('RESOURCESAT-2A-LISS4');
  const [stacResults, setStacResults] = useState<any | null>(null);
  const [stacLoading, setStacLoading] = useState<boolean>(false);

  // Active Selected Portal
  const [selectedPortal, setSelectedPortal] = useState<string>('bhoonidhi');

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await getISROStatus();
      setHubOverview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRunSTACQuery = async () => {
    setStacLoading(true);
    try {
      const res = await fetchISROSource('bhoonidhi', {
        bbox: [72.18, 22.24, 72.20, 22.26],
        collection: stacCollection
      });
      setStacResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setStacLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Connecting to Indian Space Portals (Bhoonidhi, Bhuvan, MOSDAC, VEDAS)...</p>
      </div>
    );
  }

  if (!hubOverview) {
    return <div className="p-8 text-center text-slate-400">Failed to load ISRO hub status.</div>;
  }

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-700/60 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100">
              ISRO Space Data Hub — Indian Earth Observation & Thematic Network
            </h2>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">
              ASTRA Special Feature
            </span>
          </div>
          <p className="text-sm text-slate-300">
            Real integration adapters for Bhoonidhi (STAC), Bhuvan (WMS), MOSDAC (INSAT meteorology), and VEDAS (vegetation temporal dynamics).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Integration Mode</span>
            <span className={`text-xs font-bold ${hubOverview.demo_mode_active ? 'text-cyan-400' : 'text-emerald-400'}`}>
              {hubOverview.demo_mode_active ? 'Verified Demo Cache Active' : 'Live Space Portals Active'}
            </span>
          </div>

          <button
            onClick={onOpenCredentialsModal}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>Configure Credentials</span>
          </button>
        </div>
      </div>

      {/* 4 Portals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hubOverview.portals.map((portal) => {
          const isSelected = selectedPortal === portal.portal_id;
          return (
            <div
              key={portal.portal_id}
              onClick={() => setSelectedPortal(portal.portal_id)}
              className={`rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between shadow-lg ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                    {portal.agency}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="w-2 h-2 -ml-3.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-emerald-400">{portal.connection_status.includes('Live') ? 'Live' : 'Cached'}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1">{portal.name}</h3>
                <a
                  href={portal.official_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mb-3"
                >
                  <span>{portal.official_url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolution:</span>
                    <span className="font-semibold text-slate-200">{portal.spatial_resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Acquisition:</span>
                    <span className="font-semibold text-slate-200">{portal.acquisition_dates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auth Standard:</span>
                    <span className="font-semibold text-indigo-300">{portal.auth_type}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">City Role: </strong>
                  {portal.contribution_to_analysis}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
                <span>Last Sync: {portal.last_retrieval_timestamp.substring(0, 10)}</span>
                <span className="text-indigo-400 font-semibold">Inspect Service →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Portal Deep-Dive Console */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              Interactive Service Explorer: {selectedPortal.toUpperCase()}
            </h3>
          </div>
          <span className="text-xs text-slate-400">Target AOI: {siteName}</span>
        </div>

        {/* Bhoonidhi STAC Console */}
        {selectedPortal === 'bhoonidhi' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-300 font-semibold">Select STAC Satellite Collection:</span>
              <select
                value={stacCollection}
                onChange={(e) => setStacCollection(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="RESOURCESAT-2A-LISS4">RESOURCESAT-2A LISS-IV (5.8m Multi-Spectral)</option>
                <option value="CARTOSAT-3">CARTOSAT-3 (0.28m Panchromatic High-Res)</option>
                <option value="SENTINEL-2">SENTINEL-2A (10m Multi-Spectral Optical)</option>
                <option value="RISAT-1A">RISAT-1A (EOS-04 C-Band Radar SAR)</option>
              </select>

              <button
                onClick={handleRunSTACQuery}
                disabled={stacLoading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{stacLoading ? 'Querying STAC...' : 'Execute Bhoonidhi STAC Search'}</span>
              </button>
            </div>

            {/* STAC Results Viewer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400 mb-2 font-sans font-semibold">
                <span>STAC API Response (GeoJSON FeatureCollection)</span>
                <span className="text-emerald-400">Endpoint: https://bhoonidhi.nrsc.gov.in/bhoonidhi-api/stac/search</span>
              </div>
              <pre className="text-slate-300 max-h-64 overflow-y-auto scrollbar-thin text-[11px] leading-relaxed">
                {JSON.stringify(stacResults || {
                  info: "Click 'Execute Bhoonidhi STAC Search' above to query live or verified sample satellite products for the selected 500-acre AOI.",
                  collections_supported: ["CARTOSAT-3", "RESOURCESAT-2A-LISS4", "SENTINEL-2", "RISAT-1A"],
                  auth_mechanism: "Bearer STAC Token + OGC API Features"
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Bhuvan Thematic Layers Console */}
        {selectedPortal === 'bhuvan' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              ISRO Bhuvan supplies OGC WMS/WMTS map services for pan-India thematic layers. Below are the official layers active in TerraAI:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-1">bhuvan:lulc_50k</span>
                <span className="text-slate-300">National Land Use Land Cover (1:50,000) Cycle 3 dataset categorizing built-up, agriculture, wastelands, and water bodies.</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-indigo-400 block mb-1">bhuvan:geomorphology</span>
                <span className="text-slate-300">National Geomorphological and Lithological mapping detailing alluvial landforms, pediplains, and surface weathering depths.</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">bhuvan:waterbodies</span>
                <span className="text-slate-300">National Wetland & Perennial Water Body Inventory updated 2023 for flood buffer and RWH zone enforcement.</span>
              </div>
            </div>
          </div>
        )}

        {/* MOSDAC Meteorological Console */}
        {selectedPortal === 'mosdac' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              ISRO / SAC MOSDAC delivers real-time weather and climatic products derived from geostationary payloads (INSAT-3D and INSAT-3DR):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-rose-400 block mb-1">Hydro-Estimator (HE) Rainfall</span>
                <span className="text-slate-300">Half-hourly satellite precipitation estimates in mm/hr for peak flood runoff and stormwater drainage sizing.</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">Thermal IR Brightness Temp (TIR1)</span>
                <span className="text-slate-300">10.8 µm surface skin temperature tracking for heatwave exposure and urban heat island mitigation.</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-1">Atmospheric Motion Vectors (AMV)</span>
                <span className="text-slate-300">850 hPa regional wind field vectors informing microclimate cooling corridors and wind turbine screening.</span>
              </div>
            </div>
          </div>
        )}

        {/* VEDAS Vegetation Console */}
        {selectedPortal === 'vedas' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              ISRO / SAC VEDAS (Visualisation of Earth Data and Archival System) supplies multi-temporal vegetation indices and land degradation mapping:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">AWiFS 15-Day NDVI MVC</span>
                <span className="text-slate-300">56m multi-temporal Normalized Difference Vegetation Index tracking pre-monsoon vs post-monsoon greening cycles.</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-1">Enhanced Vegetation Index (EVI)</span>
                <span className="text-slate-300">Atmospherically corrected canopy density index mitigating atmospheric aerosol and soil background noise.</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-yellow-400 block mb-1">Desertification Atlas of India</span>
                <span className="text-slate-300">Soil degradation and vegetative loss indicators guiding ecological restoration buffers and Miyawaki pockets.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
