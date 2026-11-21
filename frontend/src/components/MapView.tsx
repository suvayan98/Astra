import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import {
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  AlertOctagon,
  Flame,
  Info,
  CheckCircle,
  Crosshair,
  Compass,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  CandidateSite,
  Region,
  LayerOverlay,
  SiteScorecard,
} from '../types';
import {
  JEWAR_DEAL_BREAKER_ZONES,
  DHOLERA_DEAL_BREAKER_ZONES,
} from '../data/mockData';

// Fix standard Leaflet default icon paths in bundlers
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

// CARTO Basemap Key & Endpoints
const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY || 'cb1_5djb_1_76786fa00d88e119cfcb6bc4';
const CARTO_VOYAGER_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${CARTO_KEY ? `?key=${CARTO_KEY}` : ''}`;
const CARTO_DARK_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png${CARTO_KEY ? `?key=${CARTO_KEY}` : ''}`;

interface MapViewProps {
  currentRegion: Region;
  candidateSites: CandidateSite[];
  onUpdateCandidateSites: (sites: CandidateSite[]) => void;
  selectedSiteCode: 'A' | 'B' | 'C';
  onSelectSiteCode: (code: 'A' | 'B' | 'C') => void;
  scorecards: Record<string, SiteScorecard>;
  layerOverlays: LayerOverlay[];
  onToggleLayer: (layerId: LayerOverlay['id']) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  currentRegion,
  candidateSites,
  onUpdateCandidateSites,
  selectedSiteCode,
  onSelectSiteCode,
  scorecards,
  layerOverlays,
  onToggleLayer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const sitesLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const dealBreakersLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const overlayLayersGroupRef = useRef<L.FeatureGroup | null>(null);

  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [activeBasemap, setActiveBasemap] = useState<'voyager' | 'carto_dark' | 'osm' | 'satellite'>('voyager');
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Leaflet map and Geoman
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: currentRegion.center,
      zoom: currentRegion.zoom,
      zoomControl: false,
    });

    // Add zoom control top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Default CartoDB Voyager (clean light theme) basemap
    const baseTileLayer = L.tileLayer(
      CARTO_VOYAGER_URL,
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    ).addTo(map);

    (map as any)._baseTileLayer = baseTileLayer;

    // Feature Groups for organization
    sitesLayerGroupRef.current = L.featureGroup().addTo(map);
    dealBreakersLayerGroupRef.current = L.featureGroup().addTo(map);
    overlayLayersGroupRef.current = L.featureGroup().addTo(map);

    // Track mouse coordinates for live HUD
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setLiveCoords({ lat: Number(e.latlng.lat.toFixed(4)), lng: Number(e.latlng.lng.toFixed(4)) });
    });

    // Initialize Leaflet Geoman Controls
    const pm = (map as any).pm;
    if (pm) {
      pm.addControls({
        position: 'topleft',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: false,
        drawText: false,
        editMode: true,
        dragMode: false,
        cutPolygon: false,
        removalMode: true,
      });

      pm.setGlobalOptions({
        snappable: true,
        snapDistance: 20,
        allowSelfIntersection: false,
      });

      // Handle user drawn polygons
      map.on('pm:create', (e: any) => {
        const layer = e.layer;
        const latlngs = layer.getLatLngs();
        const coords: [number, number][] = (Array.isArray(latlngs[0]) ? latlngs[0] : latlngs).map(
          (ll: any) => [ll.lat, ll.lng]
        );

        // Approximate area calculation in km²
        const approxArea = Math.round((coords.length * 5.2) * 10) / 10;

        // Auto-assign code (next available up to 3)
        const existingCodes = candidateSites.map((s) => s.code);
        let nextCode: 'A' | 'B' | 'C' = 'A';
        if (!existingCodes.includes('A')) nextCode = 'A';
        else if (!existingCodes.includes('B')) nextCode = 'B';
        else if (!existingCodes.includes('C')) nextCode = 'C';

        const colorMap = {
          A: '#2563eb', // Blue
          B: '#059669', // Emerald
          C: '#d97706', // Amber
        };

        const newSite: CandidateSite = {
          id: `site_custom_${Date.now()}`,
          code: nextCode,
          name: `Custom Parcel ${nextCode}`,
          regionId: currentRegion.id,
          coordinates: coords,
          areaKm2: approxArea,
          color: colorMap[nextCode],
          description: `User-drawn parcel ${nextCode}`,
          tag: 'Custom',
        };

        const updated = [...candidateSites.filter((s) => s.code !== nextCode), newSite];
        onUpdateCandidateSites(updated);
        onSelectSiteCode(nextCode);

        // Remove temp drawn layer since our React effect re-renders it cleanly
        map.removeLayer(layer);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update basemap when selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if ((map as any)._baseTileLayer) {
      map.removeLayer((map as any)._baseTileLayer);
    }

    let url = CARTO_VOYAGER_URL;
    let attr = '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap';

    if (activeBasemap === 'carto_dark') {
      url = CARTO_DARK_URL;
    } else if (activeBasemap === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attr = '&copy; OpenStreetMap contributors';
    } else if (activeBasemap === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attr = '&copy; Esri, Maxar, Earthstar Geographics';
    }

    const newLayer = L.tileLayer(url, { attribution: attr, maxZoom: 19 }).addTo(map);
    newLayer.bringToBack();
    (map as any)._baseTileLayer = newLayer;
  }, [activeBasemap]);

  // Center / fly to region when region changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo(currentRegion.center, currentRegion.zoom, {
      duration: 1.0,
      easeLinearity: 0.25,
    });
  }, [currentRegion]);

  // Render Candidate Site Polygons
  useEffect(() => {
    const sitesGroup = sitesLayerGroupRef.current;
    if (!sitesGroup) return;

    sitesGroup.clearLayers();

    candidateSites.forEach((site) => {
      const isSelected = site.code === selectedSiteCode;
      const scorecard = scorecards[site.id];
      const hasDealBreaker = scorecard?.hasDealBreaker;

      const polygonColor = hasDealBreaker ? '#ef4444' : site.color;

      const polygon = L.polygon(site.coordinates, {
        color: polygonColor,
        weight: isSelected ? 4 : 2,
        fillColor: polygonColor,
        fillOpacity: isSelected ? 0.38 : 0.22,
        dashArray: hasDealBreaker ? '6, 6' : undefined,
      });

      // Click to select
      polygon.on('click', () => {
        onSelectSiteCode(site.code);
      });

      // Tooltip label
      polygon.bindTooltip(
        `<div class="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${polygonColor}"></span>
            <span>Site ${site.code}: ${site.name.split('(')[0]}</span>
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5">Area: ${site.areaKm2} km² • Score: ${scorecard?.overallScore?.toFixed(1) || 'Pending'}</div>
        </div>`,
        { sticky: true, className: 'leaflet-site-label' }
      );

      sitesGroup.addLayer(polygon);
    });
  }, [candidateSites, selectedSiteCode, scorecards]);

  // Render Statutory Dealbreaker Exclusion Zones
  useEffect(() => {
    const dbGroup = dealBreakersLayerGroupRef.current;
    if (!dbGroup) return;

    dbGroup.clearLayers();

    const zones = currentRegion.id === 'up_jewar' ? JEWAR_DEAL_BREAKER_ZONES : DHOLERA_DEAL_BREAKER_ZONES;

    const geoJsonLayer = L.geoJSON(zones, {
      style: {
        color: '#dc2626',
        weight: 1.5,
        fillColor: '#ef4444',
        fillOpacity: 0.25,
        dashArray: '4, 4',
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || 'Statutory Exclusion Zone';
        layer.bindTooltip(
          `<div class="px-2 py-1 text-xs font-semibold text-red-900 bg-red-50/95 rounded-lg border border-red-300 shadow-md">
            <div class="flex items-center gap-1">
              <span class="text-red-500">⚠️</span>
              <span>${name}</span>
            </div>
            <div class="text-[10px] text-red-600">Statutory Exclusion Zone</div>
          </div>`,
          { sticky: true, className: 'leaflet-site-label' }
        );
      },
    });

    dbGroup.addLayer(geoJsonLayer);
  }, [currentRegion]);

  const handleFlyToSite = (site: CandidateSite) => {
    onSelectSiteCode(site.code);
    const map = mapInstanceRef.current;
    if (!map || !site.coordinates.length) return;
    const bounds = L.latLngBounds(site.coordinates);
    map.fitBounds(bounds, { padding: [60, 60], duration: 0.8 });
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-100 select-none">
      {/* Underlying Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Top-Left Telemetry HUD */}
      <div className="absolute top-3 left-14 z-10 hidden sm:flex items-center space-x-2.5 bg-white/95 backdrop-blur-md border border-slate-200/90 px-3.5 py-1.5 rounded-full text-xs text-slate-800 shadow-md">
        <div className="flex items-center space-x-1.5">
          <Crosshair className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
          <span className="text-blue-700 font-extrabold text-[11px] tracking-tight">
            {liveCoords ? `${liveCoords.lat}°N, ${liveCoords.lng}°E` : `${currentRegion.center[0]}°N, ${currentRegion.center[1]}°E`}
          </span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="text-[11px] text-slate-600 font-medium">
          <span className="text-slate-400">Target:</span> <span className="font-bold text-slate-900">{currentRegion.name.split(' ')[0]}</span>
        </div>
      </div>

      {/* Floating Top-Right Map Controls & Layer Overlays */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end space-y-2">
        <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-md border border-slate-200/90 p-1 rounded-full shadow-md">
          {/* Basemap Switcher Chips */}
          <button
            onClick={() => setActiveBasemap('voyager')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeBasemap === 'voyager'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Voyager
          </button>
          <button
            onClick={() => setActiveBasemap('satellite')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeBasemap === 'satellite'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveBasemap('carto_dark')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeBasemap === 'carto_dark'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Dark Matter
          </button>
          <button
            onClick={() => setActiveBasemap('osm')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeBasemap === 'osm'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Terrain
          </button>

          <span className="w-px h-4 bg-slate-200 mx-1"></span>

          {/* Toggle Layers Menu Button */}
          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              showLayersMenu
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overlays</span>
          </button>
        </div>

        {/* Floating Overlays Drawer Popover */}
        {showLayersMenu && (
          <div className="w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-4 text-xs space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>ISRO Thematic Layers</span>
              </span>
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                {showLegend ? 'Hide Legends' : 'Show Legends'}
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {layerOverlays.map((layer) => (
                <div
                  key={layer.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    layer.visible
                      ? 'bg-sky-50/60 border-blue-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onToggleLayer(layer.id)}
                      className="flex items-center space-x-2 text-left flex-1"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: layer.color }}
                      ></span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{layer.name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{layer.portal}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => onToggleLayer(layer.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 ml-2 rounded hover:bg-slate-200/50"
                    >
                      {layer.visible ? (
                        <Eye className="w-4 h-4 text-blue-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {showLegend && layer.visible && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1">
                      {layer.legend.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-[10px] text-slate-600">
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <span className="truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom-Center Quick Site Selector HUD */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 px-2 py-1.5 rounded-full shadow-lg">
        {candidateSites.map((site) => {
          const isSelected = site.code === selectedSiteCode;
          const card = scorecards[site.id];
          const hasDb = card?.hasDealBreaker;
          return (
            <button
              key={site.id}
              onClick={() => handleFlyToSite(site)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hasDb ? '#ef4444' : site.color }}
              ></span>
              <span>Site {site.code}</span>
              {card && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    hasDb
                      ? 'bg-red-100 text-red-700'
                      : isSelected
                      ? 'bg-blue-700/60 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {hasDb ? 'DEFICIT' : `${card.overallScore.toFixed(1)} pts`}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Bottom-Left Deal-Breaker Warning Banner */}
      <div className="absolute bottom-4 left-4 z-10 max-w-xs pointer-events-none hidden md:block">
        <div className="bg-white/95 backdrop-blur-md border border-red-200 p-3 rounded-2xl shadow-md text-xs space-y-1 pointer-events-auto">
          <div className="flex items-center space-x-1.5 text-red-700 font-bold">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <span>Statutory Deal-Breaker Layer</span>
          </div>
          <p className="text-[10px] text-slate-600 leading-tight">
            Hazard zones shaded in <strong className="text-red-600">red dashes</strong> denote active floodways and high-slope exclusion polygons.
          </p>
        </div>
      </div>
    </div>
  );
};
