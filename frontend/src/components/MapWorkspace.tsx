import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers, MapPin, Eye, EyeOff, Sparkles, AlertTriangle,
  ZoomIn, ZoomOut, Compass, RefreshCw, PenTool, CheckCircle, Info
} from 'lucide-react';
import { MasterPlanAlternative, MasterPlanZone } from '../types';

interface MapWorkspaceProps {
  center: { lat: number; lng: number };
  boundary: any;
  activePlan: MasterPlanAlternative | null;
  onEditZone: (zone: MasterPlanZone) => void;
  onBoundaryDrawn: (polygon: number[][][], areaAcres: number) => void;
  siteName: string;
}

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  center,
  boundary,
  activePlan,
  onEditZone,
  onBoundaryDrawn,
  siteName
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);
  const zonesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  const [baseMap, setBaseMap] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showFloodHazard, setShowFloodHazard] = useState<boolean>(false);
  const [showBhuvanWMS, setShowBhuvanWMS] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<MasterPlanZone | null>(null);

  // Drawing mode state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const drawingLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: false
    });

    // Default Dark Matter base tile
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    baseTileLayerRef.current = tileLayer;
    zonesLayerGroupRef.current = L.layerGroup().addTo(map);
    drawingLayerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Center change handler
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
  }, [center]);

  // 3. Switch Base Map Tiles
  useEffect(() => {
    if (!mapRef.current || !baseTileLayerRef.current) return;

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attr = '&copy; OpenStreetMap &copy; CARTO';

    if (baseMap === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attr = '&copy; Esri World Imagery & ISRO Satellite';
    } else if (baseMap === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attr = '&copy; OpenStreetMap contributors';
    }

    baseTileLayerRef.current.setUrl(url);
  }, [baseMap]);

  // 4. Render Boundary Polygon
  useEffect(() => {
    if (!mapRef.current || !boundary || !boundary.coordinates) return;

    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.remove();
    }

    const latLngs: [number, number][] = boundary.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);

    const poly = L.polygon(latLngs, {
      color: '#06b6d4',
      weight: 3,
      dashArray: '6, 6',
      fillColor: '#06b6d4',
      fillOpacity: 0.05
    }).addTo(mapRef.current);

    boundaryLayerRef.current = poly;

    // Fit map bounds if not user-drawing
    if (!isDrawing && latLngs.length > 2) {
      mapRef.current.fitBounds(poly.getBounds(), { padding: [50, 50] });
    }
  }, [boundary]);

  // 5. Render Master Plan Zones
  useEffect(() => {
    if (!mapRef.current || !zonesLayerGroupRef.current) return;
    zonesLayerGroupRef.current.clearLayers();

    if (!showZones || !activePlan) return;

    activePlan.zones.forEach((zone) => {
      if (!zone.geometry || !zone.geometry.coordinates) return;
      const latLngs: [number, number][] = zone.geometry.coordinates[0].map((c: number[]) => [c[1], c[0]]);

      const zonePoly = L.polygon(latLngs, {
        color: zone.color,
        weight: 1.5,
        fillColor: zone.color,
        fillOpacity: 0.45
      });

      zonePoly.on('click', () => {
        setSelectedZone(zone);
      });

      zonePoly.bindTooltip(`<b>${zone.name}</b><br/>${zone.area_acres} Acres (${zone.area_percentage}%)`, {
        permanent: false,
        direction: 'center',
        className: 'bg-slate-900 text-slate-100 text-xs border border-slate-700 rounded px-2 py-1'
      });

      zonesLayerGroupRef.current?.addLayer(zonePoly);
    });
  }, [activePlan, showZones]);

  // 6. Interactive Drawing Handler
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawing) return;
      const newPt: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDrawnPoints((prev) => {
        const updated = [...prev, newPt];
        redrawDrawing(updated);
        return updated;
      });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawing]);

  const redrawDrawing = (points: [number, number][]) => {
    if (!drawingLayerGroupRef.current) return;
    drawingLayerGroupRef.current.clearLayers();

    points.forEach((pt) => {
      const marker = L.circleMarker(pt, { radius: 5, color: '#10b981', fillColor: '#10b981', fillOpacity: 0.9 });
      drawingLayerGroupRef.current?.addLayer(marker);
    });

    if (points.length >= 2) {
      const line = L.polyline(points, { color: '#10b981', weight: 2, dashArray: '4, 4' });
      drawingLayerGroupRef.current.addLayer(line);
    }
  };

  const finishDrawing = () => {
    if (drawnPoints.length < 3) {
      alert('Please click at least 3 points on the map to define a valid polygon boundary.');
      return;
    }
    // Close polygon
    const closed = [...drawnPoints, drawnPoints[0]];
    const geojsonCoords = [closed.map((p) => [p[1], p[0]])];

    // Compute approximate acreage
    let areaSqMeters = 0;
    const numPts = closed.length - 1;
    for (let i = 0; i < numPts; i++) {
      const p1 = closed[i];
      const p2 = closed[i + 1];
      areaSqMeters += (p2[1] - p1[1]) * (2 + Math.sin(p1[0] * Math.PI / 180) + Math.sin(p2[0] * Math.PI / 180));
    }
    areaSqMeters = Math.abs(areaSqMeters * 6378137.0 * 6378137.0 / 4.0);
    const acres = Math.max(10, Math.round((areaSqMeters / 4046.86) * 10) / 10);

    onBoundaryDrawn(geojsonCoords, acres);
    setIsDrawing(false);
    setDrawnPoints([]);
    drawingLayerGroupRef.current?.clearLayers();
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setDrawnPoints([]);
    drawingLayerGroupRef.current?.clearLayers();
  };

  // 7. Indian Location Search Quick-Jump
  const handleSearchLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    const locations: Record<string, [number, number]> = {
      'dholera': [22.2530, 72.1920],
      'amaravati': [16.5420, 80.5180],
      'devanahalli': [13.2510, 77.7120],
      'bengaluru': [13.2510, 77.7120],
      'sonipat': [28.9880, 77.0220],
      'shivamogga': [13.9320, 75.5720],
      'delhi': [28.6139, 77.2090],
      'gift city': [23.1600, 72.6840],
      'gandhinagar': [23.2156, 72.6369],
      'pune': [18.5204, 73.8567],
      'hyderabad': [17.3850, 78.4867],
      'chandigarh': [30.7333, 76.7794]
    };

    let target = locations[query];
    if (!target) {
      for (const k in locations) {
        if (query.includes(k) || k.includes(query)) {
          target = locations[k];
          break;
        }
      }
    }

    if (target && mapRef.current) {
      mapRef.current.flyTo(target, 14, { duration: 1.5 });
    } else {
      alert(`Location "${searchQuery}" located in India regional catalog. Flying to closest regional hub.`);
      mapRef.current?.flyTo([22.2530, 72.1920], 13);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-115px)] bg-slate-950 overflow-hidden flex">
      {/* Central Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Top Controls (Search & Draw Tools) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <form onSubmit={handleSearchLocation} className="flex items-center bg-slate-900/90 border border-slate-700 backdrop-blur-md rounded-xl p-1 shadow-xl">
          <MapPin className="w-4 h-4 text-cyan-400 ml-2.5 mr-1.5" />
          <input
            type="text"
            placeholder="Search location in India (e.g. Dholera, Amaravati)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none px-2 py-1"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            Go
          </button>
        </form>

        {/* Draw Custom Boundary Button */}
        {!isDrawing ? (
          <button
            onClick={() => {
              setIsDrawing(true);
              setDrawnPoints([]);
            }}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 backdrop-blur-md text-xs font-semibold px-3 py-2 rounded-xl shadow-xl transition cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw Custom Land Boundary</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs px-3 py-1.5 rounded-xl backdrop-blur-md shadow-2xl">
            <span>Click map points ({drawnPoints.length} added)</span>
            <button
              onClick={finishDrawing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg"
            >
              Complete
            </button>
            <button
              onClick={cancelDrawing}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Floating Layer Switcher & Overlays Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Base Map Selector */}
        <div className="bg-slate-900/90 border border-slate-700 backdrop-blur-md rounded-xl p-1.5 shadow-xl flex gap-1">
          <button
            onClick={() => setBaseMap('dark')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
              baseMap === 'dark' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark GIS
          </button>
          <button
            onClick={() => setBaseMap('satellite')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
              baseMap === 'satellite' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setBaseMap('streets')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
              baseMap === 'streets' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Streets
          </button>
        </div>

        {/* Thematic Layer Toggles */}
        <div className="bg-slate-900/90 border border-slate-700 backdrop-blur-md rounded-xl p-2.5 shadow-xl flex flex-col gap-2 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            Geospatial Overlays
          </div>

          <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-slate-100 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Master Plan Zones
            </span>
            <input
              type="checkbox"
              checked={showZones}
              onChange={(e) => setShowZones(e.target.checked)}
              className="accent-cyan-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-slate-100 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              Elevation Contours
            </span>
            <input
              type="checkbox"
              checked={showContours}
              onChange={(e) => setShowContours(e.target.checked)}
              className="accent-indigo-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-slate-100 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              Flood Hazards
            </span>
            <input
              type="checkbox"
              checked={showFloodHazard}
              onChange={(e) => setShowFloodHazard(e.target.checked)}
              className="accent-rose-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-3 text-slate-300 hover:text-slate-100 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              ISRO Bhuvan WMS
            </span>
            <input
              type="checkbox"
              checked={showBhuvanWMS}
              onChange={(e) => setShowBhuvanWMS(e.target.checked)}
              className="accent-emerald-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Floating Zone Inspector Card (When user clicks any zone polygon) */}
      {selectedZone && (
        <div className="absolute bottom-6 left-6 z-30 max-w-sm w-full bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-md shadow-sm"
                style={{ backgroundColor: selectedZone.color }}
              ></span>
              <h3 className="text-sm font-bold text-slate-100 leading-tight">
                {selectedZone.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-slate-400 hover:text-slate-200 text-xs px-1.5 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            {selectedZone.description}
          </p>

          <div className="grid grid-cols-3 gap-2 bg-slate-950/80 rounded-xl p-2.5 text-center text-xs mb-3 border border-slate-800">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Acreage</span>
              <span className="font-bold text-cyan-400">{selectedZone.area_acres} ac</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Share</span>
              <span className="font-bold text-emerald-400">{selectedZone.area_percentage}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">FAR Ratio</span>
              <span className="font-bold text-indigo-400">{selectedZone.far_ratio}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onEditZone(selectedZone);
                setSelectedZone(null);
              }}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold py-2 rounded-xl transition shadow-md shadow-cyan-600/20"
            >
              Edit Zone Parameters & Geometry
            </button>
          </div>
        </div>
      )}

      {/* Floating Active Plan Legend (Bottom Right) */}
      {activePlan && (
        <div className="absolute bottom-6 right-6 z-20 max-w-xs bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-3 shadow-xl text-xs hidden md:block">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-200">{activePlan.name}</span>
            <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
              {activePlan.total_area_acres} Acres
            </span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {activePlan.zones.slice(0, 7).map((z) => (
              <div
                key={z.id}
                onClick={() => setSelectedZone(z)}
                className="flex items-center justify-between text-[11px] text-slate-300 hover:bg-slate-800/60 p-1 rounded cursor-pointer transition"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: z.color }}></span>
                  <span className="truncate">{z.name}</span>
                </div>
                <span className="font-semibold text-slate-400 shrink-0 ml-2">{z.area_acres} ac</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
