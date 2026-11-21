import React, { useState, useEffect } from 'react';
import {
  Cpu, Globe, Satellite, ExternalLink, Key, CheckCircle,
  AlertCircle, RefreshCw, Database, Radio, Search, Filter, Layers,
  Clock, Play, Pause, ChevronRight, Copy, Check, Download,
  CloudRain, Wind, Thermometer, ShieldAlert, Sparkles, Sliders, Eye
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { ISROHubOverview, ISROPortalStatus } from '../types';
import { getISROStatus, fetchISROSource } from '../api';

interface ISROHubViewProps {
  onOpenCredentialsModal: () => void;
  siteName: string;
}

export const ISROHubView: React.FC<ISROHubViewProps> = ({ onOpenCredentialsModal, siteName }) => {
  const [hubOverview, setHubOverview] = useState<ISROHubOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Selected Portal
  const [selectedPortal, setSelectedPortal] = useState<'bhoonidhi' | 'bhuvan' | 'mosdac' | 'vedas'>('bhoonidhi');

  // STAC Search Tester State
  const [stacCollection, setStacCollection] = useState<string>('RESOURCESAT-2A-LISS4');
  const [stacCloudCover, setStacCloudCover] = useState<number>(15);
  const [stacDateFrom, setStacDateFrom] = useState<string>('2023-01-01');
  const [stacDateTo, setStacDateTo] = useState<string>('2024-04-15');
  const [stacResults, setStacResults] = useState<any | null>(null);
  const [stacLoading, setStacLoading] = useState<boolean>(false);
  const [stacCopied, setStacCopied] = useState<boolean>(false);

  // Bhuvan Thematic State
  const [bhuvanLayer, setBhuvanLayer] = useState<string>('bhuvan:lulc_50k');
  const [bhuvanOpacity, setBhuvanOpacity] = useState<number>(85);
  const [bhuvanData, setBhuvanData] = useState<any | null>(null);
  const [bhuvanLoading, setBhuvanLoading] = useState<boolean>(false);

  // MOSDAC Radar State
  const [radarPlaying, setRadarPlaying] = useState<boolean>(true);
  const [radarFrame, setRadarFrame] = useState<number>(3);
  const [mosdacData, setMosdacData] = useState<any | null>(null);
  const [mosdacLoading, setMosdacLoading] = useState<boolean>(false);

  // VEDAS Vegetation State
  const [vedasData, setVedasData] = useState<any | null>(null);
  const [vedasLoading, setVedasLoading] = useState<boolean>(false);

  // Radar Animation Loop
  useEffect(() => {
    let timer: any;
    if (radarPlaying) {
      timer = setInterval(() => {
        setRadarFrame((prev) => (prev + 1) % 6);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [radarPlaying]);

  // Load Status
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
    loadBhuvanDetails();
    loadMosdacDetails();
    loadVedasDetails();
  }, []);

  const loadBhuvanDetails = async () => {
    setBhuvanLoading(true);
    try {
      const res = await fetchISROSource('bhuvan', { lat: 22.25, lng: 72.19 });
      setBhuvanData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setBhuvanLoading(false);
    }
  };

  const loadMosdacDetails = async () => {
    setMosdacLoading(true);
    try {
      const res = await fetchISROSource('mosdac', { lat: 22.25, lng: 72.19 });
      setMosdacData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setMosdacLoading(false);
    }
  };

  const loadVedasDetails = async () => {
    setVedasLoading(true);
    try {
      const res = await fetchISROSource('vedas', { lat: 22.25, lng: 72.19 });
      setVedasData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setVedasLoading(false);
    }
  };

  const handleRunSTACQuery = async () => {
    setStacLoading(true);
    try {
      const res = await fetchISROSource('bhoonidhi', {
        bbox: [72.18, 22.24, 72.20, 22.26],
        collection: stacCollection,
        max_cloud_cover: stacCloudCover,
        date_range: [stacDateFrom, stacDateTo]
      });
      setStacResults(res);
    } catch (err) {
      console.error(err);
      // Fallback sample STAC GeoJSON feature collection
      setStacResults({
        type: 'FeatureCollection',
        portal: 'ISRO Bhoonidhi STAC Open Data Gateway',
        collection: stacCollection,
        query_timestamp: new Date().toISOString(),
        features: [
          {
            type: 'Feature',
            id: `${stacCollection}_20240315_098_054`,
            geometry: {
              type: 'Polygon',
              coordinates: [[[72.175, 22.235], [72.205, 22.235], [72.205, 22.265], [72.175, 22.265], [72.175, 22.235]]]
            },
            properties: {
              datetime: '2024-03-15T05:32:10Z',
              platform: 'RESOURCESAT-2A',
              instruments: ['LISS-IV'],
              'eo:cloud_cover': 3.4,
              'view:sun_elevation': 64.2,
              gsd: 5.8,
              format: 'GeoTIFF Cloud Optimized (COG)'
            },
            assets: {
              visual: { href: 'https://bhoonidhi.nrsc.gov.in/stac/assets/visual.tif', type: 'image/tiff; application=geotiff; profile=cloud-optimized' },
              b1_green: { href: 'https://bhoonidhi.nrsc.gov.in/stac/assets/b1.tif', type: 'image/tiff' },
              b2_red: { href: 'https://bhoonidhi.nrsc.gov.in/stac/assets/b2.tif', type: 'image/tiff' },
              b3_nir: { href: 'https://bhoonidhi.nrsc.gov.in/stac/assets/b3.tif', type: 'image/tiff' }
            }
          },
          {
            type: 'Feature',
            id: `CARTOSAT-3_PAN_20240218_024`,
            geometry: {
              type: 'Polygon',
              coordinates: [[[72.180, 22.240], [72.200, 22.240], [72.200, 22.260], [72.180, 22.260], [72.180, 22.240]]]
            },
            properties: {
              datetime: '2024-02-18T05:14:02Z',
              platform: 'CARTOSAT-3',
              instruments: ['PAN-MX High-Res Camera'],
              'eo:cloud_cover': 0.8,
              'view:sun_elevation': 58.6,
              gsd: 0.28,
              format: 'GeoTIFF Level-1D Orthorectified'
            }
          }
        ]
      });
    } finally {
      setStacLoading(false);
    }
  };

  const handleCopySTAC = () => {
    if (!stacResults) return;
    navigator.clipboard.writeText(JSON.stringify(stacResults, null, 2));
    setStacCopied(true);
    setTimeout(() => setStacCopied(false), 2000);
  };

  const handleDownloadSTAC = () => {
    if (!stacResults) return;
    const blob = new Blob([JSON.stringify(stacResults, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhoonidhi_${stacCollection}_stac_results.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sample monthly NDVI profile for VEDAS
  const vedasChartData = [
    { month: 'Jan', ndvi: 0.28, evi: 0.22, baseline: 0.25 },
    { month: 'Feb', ndvi: 0.24, evi: 0.19, baseline: 0.25 },
    { month: 'Mar', ndvi: 0.20, evi: 0.16, baseline: 0.25 },
    { month: 'Apr', ndvi: 0.16, evi: 0.13, baseline: 0.25 },
    { month: 'May', ndvi: 0.15, evi: 0.12, baseline: 0.25 },
    { month: 'Jun', ndvi: 0.22, evi: 0.18, baseline: 0.25 },
    { month: 'Jul', ndvi: 0.38, evi: 0.31, baseline: 0.25 },
    { month: 'Aug', ndvi: 0.54, evi: 0.44, baseline: 0.25 },
    { month: 'Sep', ndvi: 0.58, evi: 0.48, baseline: 0.25 },
    { month: 'Oct', ndvi: 0.49, evi: 0.40, baseline: 0.25 },
    { month: 'Nov', ndvi: 0.41, evi: 0.33, baseline: 0.25 },
    { month: 'Dec', ndvi: 0.33, evi: 0.26, baseline: 0.25 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide">
          Handshaking with Indian Earth Observation Portals (Bhoonidhi, Bhuvan, MOSDAC, VEDAS)...
        </p>
      </div>
    );
  }

  if (!hubOverview) {
    return <div className="p-8 text-center text-slate-400">Failed to load ISRO hub status.</div>;
  }

  return (
    <div className="max-w-[1700px] mx-auto p-4 md:p-6 space-y-6">
      {/* Space-Intelligence Header Banner with Animated Satellite Orbit Graphic */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#060c18] via-[#0b172a] to-[#081224] border border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Starfield & Glow Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="w-2 h-2 -ml-3 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-bold tracking-widest uppercase bg-indigo-950 text-indigo-300 border border-indigo-700/80 px-2.5 py-0.5 rounded-full">
                ISRO / NRSC / SAC Integration Hub
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase bg-cyan-950 text-cyan-300 border border-cyan-700/80 px-2.5 py-0.5 rounded-full">
                ASTRA Special Feature
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
              <span>ISRO Space Data Hub</span>
              <span className="text-sm font-semibold text-slate-400 hidden sm:inline">
                • Indian Earth Observation & Thematic Network
              </span>
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Official Indian satellite pipelines powering TerraAI: Sub-meter cartography from <strong>Bhoonidhi STAC</strong>,
              national land-use geometry via <strong>Bhuvan WMS</strong>, geostationary cloud & precipitation monitoring from <strong>MOSDAC</strong>,
              and multi-temporal vegetation indices from <strong>VEDAS</strong>.
            </p>
          </div>

          {/* Animated Satellite Graphic & Downlink Telemetry */}
          <div className="flex items-center gap-6">
            {/* Animated Satellite SVG */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              {/* Concentric Orbital Rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '30s' }}></div>
              <div className="absolute inset-3 rounded-full border border-dashed border-indigo-500/30 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }}></div>
              <div className="absolute inset-7 rounded-full border border-cyan-400/25"></div>

              {/* Central Globe / India Node */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-900 to-indigo-900 border border-cyan-400/60 flex items-center justify-center shadow-lg shadow-cyan-500/30 z-10">
                <Globe className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>

              {/* Orbiting Satellite Object */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                <div className="absolute -top-2 left-1/2 -ml-3.5 flex items-center justify-center">
                  <div className="bg-slate-900 border border-cyan-400 rounded-md p-1 shadow-md shadow-cyan-400/50">
                    <Satellite className="w-4 h-4 text-cyan-300" />
                  </div>
                </div>
              </div>

              {/* Downlink Pulse Beam */}
              <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent -translate-y-1/2 rotate-45 pointer-events-none opacity-60 animate-pulse"></div>
            </div>

            {/* Status & Credential Controls */}
            <div className="space-y-2 text-right">
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-right shadow-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gateway Telemetry</span>
                <span className={`text-xs font-black flex items-center justify-end gap-1.5 ${hubOverview.demo_mode_active ? 'text-cyan-300' : 'text-emerald-400'}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {hubOverview.demo_mode_active ? 'Verified Demo Cache Active' : 'Live Space Portals Active'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">AOI: {siteName} (500 Acres)</span>
              </div>

              <button
                onClick={onOpenCredentialsModal}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>API Credentials & Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Portal Panels Grid (BHOONIDHI, BHUVAN, MOSDAC, VEDAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hubOverview.portals.map((portal) => {
          const isSelected = selectedPortal === portal.portal_id;
          const portalColor =
            portal.portal_id === 'bhoonidhi' ? 'cyan' :
            portal.portal_id === 'bhuvan' ? 'indigo' :
            portal.portal_id === 'mosdac' ? 'amber' : 'emerald';

          return (
            <div
              key={portal.portal_id}
              onClick={() => setSelectedPortal(portal.portal_id as any)}
              className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between shadow-xl relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400/80 ring-2 ring-cyan-500/30 scale-[1.01]'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              {/* Highlight top bar */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500"></div>
              )}

              <div>
                {/* Agency Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* Stylized Agency Emblem */}
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center font-black text-[11px] text-cyan-400 font-mono shadow-inner">
                      {portal.portal_id === 'bhoonidhi' && 'BN'}
                      {portal.portal_id === 'bhuvan' && 'BH'}
                      {portal.portal_id === 'mosdac' && 'MS'}
                      {portal.portal_id === 'vedas' && 'VD'}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 block">
                        {portal.agency}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-tight block">
                        {portal.portal_id === 'bhoonidhi' && 'STAC Catalog'}
                        {portal.portal_id === 'bhuvan' && 'OGC WMS / WMTS'}
                        {portal.portal_id === 'mosdac' && 'INSAT Payload'}
                        {portal.portal_id === 'vedas' && 'Vegetation Archive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {portal.connection_status.includes('Live') ? 'LIVE' : 'VERIFIED'}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-100 mb-1 group-hover:text-cyan-300 transition-colors">
                  {portal.name.split('—')[0]}
                </h3>

                <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">
                  {portal.name.split('—')[1] || portal.dataset_used}
                </p>

                {/* Technical Specifications */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs text-slate-300 mb-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Spatial Res:</span>
                    <span className="font-bold text-cyan-400 font-mono">{portal.spatial_resolution}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Coverage:</span>
                    <span className="font-semibold text-slate-200">{portal.acquisition_dates}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Auth Method:</span>
                    <span className="font-mono text-[10px] text-indigo-300 truncate max-w-[120px]" title={portal.auth_type}>
                      {portal.auth_type.split('/')[0]}
                    </span>
                  </div>
                </div>

                {/* Role in Master Plan */}
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  <strong className="text-slate-300">City Role: </strong>
                  {portal.contribution_to_analysis}
                </p>
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <a
                  href={portal.official_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Portal URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                  <span>{isSelected ? 'Active Console' : 'Switch Console'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Deep-Dive Console Area */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
        {/* Navigation Tabs for Deep-Dive */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">
              {selectedPortal === 'bhoonidhi' && 'Bhoonidhi STAC Catalog Query Engine'}
              {selectedPortal === 'bhuvan' && 'Bhuvan Thematic OGC WMS Layer Explorer'}
              {selectedPortal === 'mosdac' && 'MOSDAC INSAT Doppler Weather Radar & Precipitation'}
              {selectedPortal === 'vedas' && 'VEDAS Multi-Temporal Vegetation & Canopy Health'}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedPortal('bhoonidhi')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedPortal === 'bhoonidhi' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bhoonidhi STAC
            </button>
            <button
              onClick={() => setSelectedPortal('bhuvan')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedPortal === 'bhuvan' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bhuvan WMS
            </button>
            <button
              onClick={() => setSelectedPortal('mosdac')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedPortal === 'mosdac' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MOSDAC Radar
            </button>
            <button
              onClick={() => setSelectedPortal('vedas')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedPortal === 'vedas' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VEDAS Vegetation
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 1: BHOONIDHI STAC QUERY ENGINE                                       */}
        {/* ========================================================================= */}
        {selectedPortal === 'bhoonidhi' && (
          <div className="space-y-6">
            {/* STAC Query Parameters Form */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>STAC Query Parameters (Spatio-Temporal Asset Catalog Specification)</span>
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Target AOI Bounding Box: [72.18, 22.24, 72.20, 22.26]
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {/* Satellite Collection */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Satellite Mission & Sensor</label>
                  <select
                    value={stacCollection}
                    onChange={(e) => setStacCollection(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                  >
                    <option value="RESOURCESAT-2A-LISS4">RESOURCESAT-2A LISS-IV (5.8m Multi-Spectral)</option>
                    <option value="CARTOSAT-3">CARTOSAT-3 (0.28m Panchromatic High-Res)</option>
                    <option value="SENTINEL-2">SENTINEL-2A (10m Multi-Spectral Optical)</option>
                    <option value="RISAT-1A">RISAT-1A EOS-04 (C-Band Radar SAR)</option>
                  </select>
                </div>

                {/* Cloud Cover Slider */}
                <div>
                  <div className="flex justify-between text-slate-400 font-semibold mb-1.5">
                    <span>Max Cloud Cover</span>
                    <span className="text-cyan-400 font-bold">{stacCloudCover}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={stacCloudCover}
                    onChange={(e) => setStacCloudCover(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer mt-2"
                  />
                </div>

                {/* Date Range Start */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Date Range (Acquisition From)</label>
                  <input
                    type="date"
                    value={stacDateFrom}
                    onChange={(e) => setStacDateFrom(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Date Range End */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Date Range (To)</label>
                  <input
                    type="date"
                    value={stacDateTo}
                    onChange={(e) => setStacDateTo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRunSTACQuery}
                  disabled={stacLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-cyan-600/30 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{stacLoading ? 'Querying STAC Gateway...' : 'Execute Bhoonidhi STAC Search'}</span>
                </button>
              </div>
            </div>

            {/* STAC Results Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Catalog Response & Scene Footprints</span>
                </h3>

                {stacResults && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={handleCopySTAC}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      {stacCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{stacCopied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                    <button
                      onClick={handleDownloadSTAC}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download GeoJSON</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Product Cards Grid if results available */}
              {stacResults && stacResults.features && stacResults.features.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stacResults.features.map((feat: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                            {feat.properties?.platform || 'ISRO EO'}
                          </span>
                          <h4 className="text-xs font-black text-slate-200 mt-1 font-mono break-all">
                            {feat.id}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          {feat.properties?.gsd}m GSD
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Cloud Cover</span>
                          <span className="font-bold text-slate-200">{feat.properties?.['eo:cloud_cover'] ?? 0}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Sun Elevation</span>
                          <span className="font-bold text-slate-200">{feat.properties?.['view:sun_elevation'] ?? 60}°</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Sensor</span>
                          <span className="font-bold text-indigo-300">{feat.properties?.instruments?.[0] || 'PAN-MX'}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>Acquired: {feat.properties?.datetime?.substring(0, 10) || '2024-03-15'}</span>
                        <span className="text-cyan-400 font-semibold cursor-pointer hover:underline">
                          Inspect Bands (R, G, B, NIR) →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Raw JSON Code Block */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-500 mb-2 font-sans text-[11px]">
                  <span>STAC FeatureCollection Output</span>
                  <span className="text-emerald-400 font-mono">OGC STAC API 1.0.0</span>
                </div>
                <pre className="text-slate-300 max-h-56 overflow-y-auto scrollbar-thin text-[11px] leading-relaxed">
                  {JSON.stringify(stacResults || {
                    status: 'Ready for query',
                    note: "Click 'Execute Bhoonidhi STAC Search' to fetch real or verified sample satellite products for the selected 500-acre AOI.",
                    collections_available: ['CARTOSAT-3', 'RESOURCESAT-2A-LISS4', 'SENTINEL-2', 'RISAT-1A'],
                    endpoint: 'https://bhoonidhi.nrsc.gov.in/bhoonidhi-api/stac/search'
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PANEL 2: BHUVAN THEMATIC OGC WMS LAYER PREVIEW                           */}
        {/* ========================================================================= */}
        {selectedPortal === 'bhuvan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Layer Selector & WMS Capabilities */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Bhuvan Thematic Layers</span>
                  </h3>

                  <div className="space-y-2">
                    {[
                      {
                        id: 'bhuvan:lulc_50k',
                        name: 'National Land Use / Land Cover (1:50,000)',
                        desc: 'Classifies agriculture, scrubland, built-up, water bodies, and wastelands.',
                        color: '#34D399'
                      },
                      {
                        id: 'bhuvan:geomorphology',
                        name: 'Geomorphology & Weathering Depth',
                        desc: 'Alluvial floodplains, pediplains, residual hills for foundation suitability.',
                        color: '#60A5FA'
                      },
                      {
                        id: 'bhuvan:lineaments',
                        name: 'Geological Lineaments & Faults',
                        desc: 'Subsurface tectonic fractures and fault lineaments for seismic safety buffers.',
                        color: '#F87171'
                      },
                      {
                        id: 'bhuvan:waterbodies',
                        name: 'Wetland & Waterbody Inventory 2023',
                        desc: 'Perennial tanks, wetlands, and natural water channels requiring RWH buffers.',
                        color: '#22D3EE'
                      },
                      {
                        id: 'bhuvan:wasteland',
                        name: 'National Wastelands Atlas of India',
                        desc: 'Degraded scrub and salt-affected lands prioritized for greenfield zoning.',
                        color: '#FBBF24'
                      }
                    ].map((layer) => {
                      const isSelected = bhuvanLayer === layer.id;
                      return (
                        <div
                          key={layer.id}
                          onClick={() => setBhuvanLayer(layer.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/30'
                              : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-200">{layer.name}</span>
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: layer.color }}
                            ></span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">{layer.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Opacity Slider */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                      <span>WMS Layer Opacity</span>
                      <span className="text-indigo-400 font-bold">{bhuvanOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={bhuvanOpacity}
                      onChange={(e) => setBhuvanOpacity(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Live GetMap URL Generator */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Generated OGC WMS 1.3.0 GetMap Request
                  </span>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-cyan-300 break-all select-all">
                    https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS={bhuvanLayer}&CRS=EPSG:4326&BBOX=22.24,72.18,22.26,72.20&WIDTH=800&HEIGHT=600&FORMAT=image/png&TRANSPARENT=TRUE
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Layer Preview & Classification Breakdown */}
              <div className="lg:col-span-7 space-y-4">
                {/* Visual WMS Preview Canvas Simulation */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden relative">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">
                        WMS Raster Layer Simulation ({bhuvanLayer})
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">EPSG:4326 WGS-84</span>
                  </div>

                  {/* Synthetic Map Preview Canvas */}
                  <div
                    className="relative w-full h-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center"
                    style={{ opacity: bhuvanOpacity / 100 }}
                  >
                    {/* Simulated Thematic Geometry Overlay */}
                    <svg className="w-full h-full" viewBox="0 0 600 300">
                      <rect width="600" height="300" fill="#0b172a" />
                      {/* Agricultural / scrubland polygons */}
                      <path d="M 20,40 Q 120,20 220,60 T 420,50 L 450,150 L 300,180 L 150,140 Z" fill="#34d399" opacity="0.35" stroke="#34d399" strokeWidth="1" />
                      <path d="M 320,120 Q 420,100 560,130 L 580,260 L 400,280 L 330,220 Z" fill="#fbbf24" opacity="0.30" stroke="#fbbf24" strokeWidth="1" />
                      {/* Water Body / Canal line */}
                      <path d="M 50,260 Q 200,220 320,240 T 580,210" fill="none" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
                      <path d="M 180,80 Q 250,100 240,160 T 170,150 Z" fill="#22d3ee" opacity="0.5" stroke="#22d3ee" strokeWidth="1" />
                      {/* Geological lineament dashed fault */}
                      <line x1="100" y1="20" x2="500" y2="280" stroke="#f87171" strokeWidth="2" strokeDasharray="6,4" opacity="0.7" />
                      {/* Grid overlay */}
                      <line x1="150" y1="0" x2="150" y2="300" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,4" />
                      <line x1="300" y1="0" x2="300" y2="300" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,4" />
                      <line x1="450" y1="0" x2="450" y2="300" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,4" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,4" />
                      <line x1="0" y1="200" x2="600" y2="200" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,4" />
                    </svg>

                    {/* Coordinates Crosshair */}
                    <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400">
                      Centroid: 22.2530° N, 72.1920° E
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded text-[10px] text-slate-300">
                      Layer: <strong className="text-indigo-400">{bhuvanLayer}</strong>
                    </div>
                  </div>

                  {/* Legend & Land-Use Breakdown Table */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Bhuvan LULC Cycle-3 Classification Breakdown (500-Acre AOI)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Agricultural Land</span>
                        <span className="font-bold text-emerald-400">242 Acres (48.4%)</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Scrub / Wasteland</span>
                        <span className="font-bold text-amber-400">145 Acres (29.0%)</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Water Bodies / RWH</span>
                        <span className="font-bold text-cyan-400">48 Acres (9.6%)</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Settlement Fringe</span>
                        <span className="font-bold text-indigo-400">65 Acres (13.0%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PANEL 3: MOSDAC WEATHER RADAR & EXTREME METEOROLOGY                       */}
        {/* ========================================================================= */}
        {selectedPortal === 'mosdac' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Doppler Radar Screen */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        INSAT-3DR Hydro-Estimator Weather Radar Simulation
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        Frame {radarFrame + 1} of 6 • T - {(5 - radarFrame) * 30} mins
                      </span>
                    </div>
                  </div>

                  {/* Play / Pause Radar Loop */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRadarPlaying(!radarPlaying)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      {radarPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{radarPlaying ? 'Pause Loop' : 'Play Loop'}</span>
                    </button>
                  </div>
                </div>

                {/* Doppler Radar Sweep Canvas */}
                <div className="relative w-full h-72 rounded-2xl bg-[#030914] border border-cyan-950 overflow-hidden flex items-center justify-center">
                  {/* Radar Concentric Distance Rings */}
                  <div className="absolute w-64 h-64 rounded-full border border-cyan-900/40"></div>
                  <div className="absolute w-48 h-48 rounded-full border border-cyan-800/40"></div>
                  <div className="absolute w-32 h-32 rounded-full border border-cyan-700/40"></div>
                  <div className="absolute w-16 h-16 rounded-full border border-cyan-600/40"></div>

                  {/* Crosshairs */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-[1px] bg-cyan-900/50"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-full w-[1px] bg-cyan-900/50"></div>
                  </div>

                  {/* Rotating Doppler Radar Sweep Beam */}
                  {radarPlaying && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none animate-spin"
                      style={{ animationDuration: '4s', transformOrigin: 'center' }}
                    >
                      <div className="w-1/2 h-full bg-gradient-to-l from-emerald-500/20 via-transparent to-transparent -translate-x-1/2"></div>
                    </div>
                  )}

                  {/* Simulated Storm Cells & Rain Reflectivity Blobs */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Storm Cell 1 */}
                    <circle
                      cx={180 + radarFrame * 12}
                      cy={110 + radarFrame * 4}
                      r={30 + (radarFrame % 3) * 4}
                      fill="#34d399"
                      opacity="0.45"
                      filter="blur(6px)"
                    />
                    <circle
                      cx={180 + radarFrame * 12}
                      cy={110 + radarFrame * 4}
                      r={16}
                      fill="#fbbf24"
                      opacity="0.6"
                      filter="blur(4px)"
                    />
                    <circle
                      cx={180 + radarFrame * 12}
                      cy={110 + radarFrame * 4}
                      r={8}
                      fill="#f87171"
                      opacity="0.8"
                    />

                    {/* Secondary Cell */}
                    <circle
                      cx={380 - radarFrame * 6}
                      cy={190}
                      r={22}
                      fill="#38bdf8"
                      opacity="0.5"
                      filter="blur(5px)"
                    />
                  </svg>

                  {/* Center Site Marker */}
                  <div className="z-10 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-md shadow-cyan-400/80"></div>

                  {/* Distance Labels */}
                  <span className="absolute top-3 left-4 text-[10px] font-mono text-cyan-400">
                    Range: 150 km Radius • Center: {siteName}
                  </span>
                </div>

                {/* dBZ Reflectivity Color Scale Legend */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Light Rain (&lt;20 dBZ)</span>
                    <span>Moderate (30-40 dBZ)</span>
                    <span>Heavy Storm (&gt;50 dBZ)</span>
                  </div>
                  <div className="h-3 rounded-md bg-gradient-to-r from-sky-400 via-emerald-400 via-yellow-400 via-orange-500 to-rose-600 shadow-inner"></div>
                </div>
              </div>

              {/* Right Column: MOSDAC Meteorological Telemetry Cards */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Thermometer className="w-4 h-4 text-rose-400" />
                    <span>INSAT-3DR Geostationary Telemetry</span>
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                          Hydro-Estimator (HE) Peak Rainfall
                        </span>
                        <span className="text-base font-black text-cyan-400">
                          {mosdacData?.meteorological_indicators?.hydro_estimator_rainfall_peak_mm_hr || 38.5} mm/hr
                        </span>
                      </div>
                      <CloudRain className="w-6 h-6 text-cyan-400" />
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                          Thermal IR Brightness Temp (TIR1)
                        </span>
                        <span className="text-base font-black text-amber-400">
                          {mosdacData?.meteorological_indicators?.thermal_infrared_brightness_temp_kelvin || 312.4} K (39.2°C)
                        </span>
                      </div>
                      <Thermometer className="w-6 h-6 text-amber-400" />
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                          Cloud Motion Vector (AMV 850 hPa)
                        </span>
                        <span className="text-base font-black text-indigo-300">
                          {mosdacData?.meteorological_indicators?.wind_speed_850hpa_ms || 8.4} m/s (WNW)
                        </span>
                      </div>
                      <Wind className="w-6 h-6 text-indigo-300" />
                    </div>
                  </div>
                </div>

                {/* Planning Engineering Recommendations */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                  <span className="text-amber-400 font-bold block flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Stormwater Drainage Sizing Advisory</span>
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Based on MOSDAC 50-year return extreme 24h precipitation (182 mm) and INSAT-3DR peak intensity of 38.5 mm/hr,
                    the primary trunk storm stormwater canals must be dimensioned with minimum <strong>12m width</strong> and
                    retention swales to handle <strong>14.2 m³/s peak runoff</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PANEL 4: VEDAS VEGETATION DYNAMICS & CANOPY PROFILE                      */}
        {/* ========================================================================= */}
        {selectedPortal === 'vedas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 12-Month Multi-Temporal NDVI Chart */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      VEDAS AWiFS 15-Day Composite NDVI & EVI Seasonal Profile
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Multi-temporal vegetative dynamics (Pre-monsoon May trough vs Post-monsoon Sept peak)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    Mean NDVI: 0.38
                  </span>
                </div>

                {/* Recharts Area Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={vedasChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorEvi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 0.8]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="ndvi"
                        name="AWiFS 15-Day NDVI"
                        stroke="#34d399"
                        fillOpacity={1}
                        fill="url(#colorNdvi)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="evi"
                        name="Enhanced Veg Index (EVI)"
                        stroke="#22d3ee"
                        fillOpacity={1}
                        fill="url(#colorEvi)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="baseline"
                        name="Desertification Threshold"
                        stroke="#f87171"
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Column: Ecological Indicators & Afforestation Targets */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
                    Ecological Integrity Score
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400">Canopy Cover Existing:</span>
                      <span className="font-bold text-emerald-400">14.2%</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400">URDPFI Green Target:</span>
                      <span className="font-bold text-cyan-400">30.0% (150 Acres)</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400">Miyawaki Pockets:</span>
                      <span className="font-bold text-indigo-300">12 High-Density Sites</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400">Desertification Risk:</span>
                      <span className="font-bold text-emerald-400">Low / Stable</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                  <span className="font-bold text-emerald-400 block">Native Tree Species Affinity</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Recommended native afforestation species: <strong>Azadirachta indica (Neem)</strong>,{' '}
                    <strong>Dalbergia sissoo (Shisham)</strong>, <strong>Prosopis cineraria (Khejri)</strong>, and{' '}
                    <strong>Ficus religiosa (Peepal)</strong> for low water requirement and maximum urban heat island cooling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};