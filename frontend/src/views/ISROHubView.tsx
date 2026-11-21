import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  Database, 
  ExternalLink, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Layers, 
  Sliders,
  Check,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { ISROPortal } from '../types';
import { fetchISROHubStatus, searchBhoonidhiSTAC, updateSourceConfig } from '../services/api';

interface ISROHubViewProps {
  demoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
}

export const ISROHubView: React.FC<ISROHubViewProps> = ({ demoMode, onToggleDemoMode }) => {
  const [portals, setPortals] = useState<ISROPortal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState<ISROPortal | null>(null);

  // STAC Query State
  const [stacResults, setStacResults] = useState<any[]>([]);
  const [isSearchingSTAC, setIsSearchingSTAC] = useState(false);
  const [stacCollection, setStacCollection] = useState<string>('CARTOSAT-3');

  // Config Modal State
  const [configPortalId, setConfigPortalId] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [inputApiKey, setInputApiKey] = useState('');
  const [configMsg, setConfigMsg] = useState<string | null>(null);

  const loadHubStatus = async () => {
    setIsLoading(true);
    try {
      const data = await fetchISROHubStatus();
      setPortals(data.portals || []);
      if (!selectedPortal && data.portals?.length > 0) {
        setSelectedPortal(data.portals[0]);
      }
    } catch (err) {
      console.error('Failed to load ISRO hub status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHubStatus();
  }, []);

  const handleRunSTACSearch = async () => {
    setIsSearchingSTAC(true);
    try {
      const res = await searchBhoonidhiSTAC({
        bbox: [80.505, 16.533, 80.528, 16.551],
        collection: stacCollection
      });
      setStacResults(res.features || []);
    } catch (err) {
      console.error('STAC search error:', err);
    } finally {
      setIsSearchingSTAC(false);
    }
  };

  const handleSaveConfig = async (portalId: string) => {
    try {
      await updateSourceConfig(portalId, {
        api_key: inputApiKey || undefined,
        token: inputToken || undefined
      });
      setConfigMsg(`Credentials updated for ${portalId.toUpperCase()}.`);
      setTimeout(() => {
        setConfigMsg(null);
        setConfigPortalId(null);
        loadHubStatus();
      }, 2000);
    } catch (err) {
      setConfigMsg('Update failed. Check parameters.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-orange-400 mb-1">
            <Satellite className="w-4 h-4" />
            <span>INDIAN SPACE RESEARCH ORGANISATION &bull; SAC / NRSC</span>
          </div>
          <h1 className="text-2xl font-bold text-white">ISRO Space Data Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Earth observation satellite integration status for BHOONIDHI, BHUVAN, MOSDAC, and VEDAS.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggleDemoMode(!demoMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
              demoMode
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-cyan-500 text-slate-950 border-cyan-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-950'}`} />
            <span>{demoMode ? 'Demo Mode (Calibrated Cache)' : 'Live Authenticated Mode'}</span>
          </button>

          <button
            onClick={loadHubStatus}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Portals Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Portals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {portals.map((portal) => {
          const isConnected = portal.status === 'Connected';
          return (
            <div
              key={portal.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
                    {portal.logo_badge}
                  </span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                    isConnected ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {portal.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white">{portal.name}</h3>
                  <span className="text-xs text-slate-400 font-medium block">{portal.agency}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Dataset Used:</span>
                    <strong className="text-white text-[11px]">{portal.datasets_used.join(', ')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Spatial Resolution:</span>
                    <span className="font-mono text-cyan-300 text-[11px]">{portal.resolution}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Coverage:</span>
                    <span className="text-slate-300 text-[11px]">{portal.coverage}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  <strong className="text-slate-300">Role:</strong> {portal.contribution_to_analysis}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      setConfigPortalId(portal.id);
                      setInputApiKey('');
                      setInputToken('');
                      setConfigMsg(null);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center space-x-1"
                  >
                    <Key className="w-3 h-3 text-cyan-400" />
                    <span>Config API</span>
                  </button>

                  <a
                    href={portal.portal_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Tool: Bhoonidhi STAC Catalog Search Query */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center">
              <Search className="w-4 h-4 text-cyan-400 mr-2" />
              Live BHOONIDHI STAC API Catalog Query Tool
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Query ISRO / NRSC Earth Observation imagery over the current site bounding box using SpatioTemporal Asset Catalog (STAC v1.0.0)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={stacCollection}
              onChange={(e) => setStacCollection(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="CARTOSAT-3">CARTOSAT-3 (0.28m PAN / 1.12m MX)</option>
              <option value="RESOURCESAT-2A">RESOURCESAT-2A (LISS-IV 5.8m)</option>
              <option value="EOS-04">EOS-04 / RISAT-1A (C-Band SAR)</option>
            </select>

            <button
              onClick={handleRunSTACSearch}
              disabled={isSearchingSTAC}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <Search className={`w-3.5 h-3.5 ${isSearchingSTAC ? 'animate-spin' : ''}`} />
              <span>{isSearchingSTAC ? 'Searching STAC...' : 'Query Catalog'}</span>
            </button>
          </div>
        </div>

        {/* STAC Results Grid */}
        {stacResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stacResults.map((feat: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-300">{feat.collection}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                    {feat.properties?.resolution_m}m GSD
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate" title={feat.id}>
                  ID: {feat.id}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                  <div>
                    <span>Acquired:</span>
                    <strong className="text-white block">{feat.properties?.datetime?.split('T')[0]}</strong>
                  </div>
                  <div>
                    <span>Cloud Cover:</span>
                    <strong className="text-emerald-400 block">{feat.properties?.['eo:cloud_cover']}%</strong>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 pt-1">
                  Processing: {feat.properties?.processing_level || 'L2G Standard Ortho'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-2xl space-y-2">
            <Globe2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p>Click "Query Catalog" above to discover available Cartosat-3, Resourcesat-2A, and EOS-04 satellite scenes over the 500-acre AOI.</p>
          </div>
        )}
      </div>

      {/* Configuration Drawer / Modal */}
      {configPortalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Configure {configPortalId.toUpperCase()} API</h3>
              <button 
                onClick={() => setConfigPortalId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter your official authentication credentials from the Indian space data portal. When left empty, TerraAI operates in high-fidelity calibrated demo mode.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">API Key / User ID</label>
                <input
                  type="text"
                  placeholder="e.g. NRSC_API_KEY_xxx"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OAuth2 Bearer Token</label>
                <input
                  type="password"
                  placeholder="e.g. eyJhbGciOi..."
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {configMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{configMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfigPortalId(null)}
                className="px-4 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveConfig(configPortalId)}
                className="px-4 py-2 text-xs rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
