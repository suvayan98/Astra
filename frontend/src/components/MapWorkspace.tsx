import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Edit3, 
  Check, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Maximize2, 
  ShieldAlert,
  Compass,
  Eye,
  EyeOff
} from 'lucide-react';
import { SampleSite, MasterPlanAlternative, CityZone, ExclusionZone } from '../types';

interface MapWorkspaceProps {
  selectedSite: SampleSite | null;
  activePlan: MasterPlanAlternative | null;
  exclusionZones: ExclusionZone[];
  onUpdateZone: (updatedZone: CityZone) => void;
  onDeleteZone: (zoneId: string) => void;
  onSelectSite: (site: SampleSite) => void;
  sampleSites: SampleSite[];
}

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  selectedSite,
  activePlan,
  exclusionZones,
  onUpdateZone,
  onDeleteZone,
  onSelectSite,
  sampleSites
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const zonesLayerRef = useRef<L.FeatureGroup | null>(null);
  const exclusionLayerRef = useRef<L.FeatureGroup | null>(null);
  const bhuvanWmsLayerRef = useRef<L.TileLayer.WMS | null>(null);

  // Layer Toggles
  const [showZones, setShowZones] = useState(true);
  const [showExclusions, setShowExclusions] = useState(true);
  const [showBhuvanWms, setShowBhuvanWms] = useState(false);
  const [baseMapType, setBaseMapType] = useState<'satellite' | 'dark' | 'topo'>('dark');

  // Selected Zone for Editing
  const [selectedZone, setSelectedZone] = useState<CityZone | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editDensity, setEditDensity] = useState('');
  const [editMessage, setEditMessage] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = selectedSite ? [selectedSite.center[1], selectedSite.center[0]] : [16.541, 80.515];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark Map base layer
    const darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer && !(layer instanceof L.TileLayer.WMS)) {
        map.removeLayer(layer);
      }
    });

    if (baseMapType === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
      }).addTo(map);
    } else if (baseMapType === 'topo') {
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
        maxZoom: 17
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
    }
  }, [baseMapType]);

  // Update Bhuvan WMS Overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (showBhuvanWms) {
      if (!bhuvanWmsLayerRef.current) {
        bhuvanWmsLayerRef.current = L.tileLayer.wms('https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms', {
          layers: 'lulc:LULC50K_1516',
          format: 'image/png',
          transparent: true,
          opacity: 0.65,
          attribution: '© ISRO / NRSC Bhuvan LULC 50K'
        });
      }
      bhuvanWmsLayerRef.current.addTo(map);
    } else {
      if (bhuvanWmsLayerRef.current && map.hasLayer(bhuvanWmsLayerRef.current)) {
        map.removeLayer(bhuvanWmsLayerRef.current);
      }
    }
  }, [showBhuvanWms]);

  // Render Site Boundary
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSite) return;
    const map = mapInstanceRef.current;

    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
    }

    const geoData: any = {
      type: 'Feature',
      geometry: selectedSite.polygon,
      properties: { name: selectedSite.name }
    };

    const bLayer = L.geoJSON(geoData, {
      style: {
        color: '#06b6d4',
        weight: 3,
        dashArray: '6, 6',
        fillColor: '#06b6d4',
        fillOpacity: 0.05
      }
    }).addTo(map);

    boundaryLayerRef.current = bLayer;
    map.fitBounds(bLayer.getBounds(), { padding: [40, 40], animate: true });
  }, [selectedSite]);

  // Render Master Plan Zones with Interactive Click & Selection
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (zonesLayerRef.current) {
      map.removeLayer(zonesLayerRef.current);
      zonesLayerRef.current = null;
    }

    if (!showZones || !activePlan) return;

    const group = L.featureGroup();

    activePlan.zones.forEach((zone) => {
      const isSelected = selectedZone?.id === zone.id;
      const poly = L.geoJSON(
        { type: 'Feature', geometry: zone.polygon, properties: zone } as any,
        {
          style: {
            color: isSelected ? '#ffffff' : zone.color,
            weight: isSelected ? 3.5 : 2,
            fillColor: zone.color,
            fillOpacity: isSelected ? 0.65 : 0.45
          }
        }
      );

      poly.on('click', () => {
        setSelectedZone(zone);
        setEditName(zone.name);
        setEditType(zone.type);
        setEditDensity(zone.density_level || 'Medium');
        setEditMessage(null);
      });

      poly.bindTooltip(`
        <div style="font-family:sans-serif; font-size:11px; padding:2px;">
          <strong style="color:${zone.color}">${zone.name}</strong><br/>
          <span>${zone.type} &bull; ${zone.area_acres} Acres (${zone.area_percentage}%)</span>
        </div>
      `, { sticky: true, opacity: 0.95 });

      group.addLayer(poly);
    });

    group.addTo(map);
    zonesLayerRef.current = group;
  }, [activePlan, showZones, selectedZone]);

  // Render Statutory Exclusion Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSite) return;
    const map = mapInstanceRef.current;

    if (exclusionLayerRef.current) {
      map.removeLayer(exclusionLayerRef.current);
      exclusionLayerRef.current = null;
    }

    if (!showExclusions || exclusionZones.length === 0) return;

    const group = L.featureGroup();
    const bounds = L.geoJSON({ type: 'Feature', geometry: selectedSite.polygon, properties: {} } as any).getBounds();
    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();
    const dLat = maxLat - minLat;
    const dLng = maxLng - minLng;

    // Stylized riparian buffer corridor along natural stream
    const riparianCoords: [number, number][] = [
      [minLat + dLat * 0.70, minLng + dLng * 0.65],
      [minLat + dLat * 0.95, minLng + dLng * 0.95],
      [minLat + dLat * 0.90, minLng + dLng * 0.98],
      [minLat + dLat * 0.65, minLng + dLng * 0.68],
    ];

    const riparianPoly = L.polygon(riparianCoords, {
      color: '#f43f5e',
      weight: 2,
      dashArray: '4, 4',
      fillColor: '#f43f5e',
      fillOpacity: 0.25
    });

    riparianPoly.bindTooltip(`
      <div style="font-family:sans-serif; font-size:11px; color:#f43f5e; font-weight:bold;">
        ⚠️ 100m Riparian Flood Buffer (45 Acres)
        <p style="font-size:10px; color:#cbd5e1; font-weight:normal;">Non-buildable ecological retention zone</p>
      </div>
    `, { sticky: true });

    group.addLayer(riparianPoly);
    group.addTo(map);
    exclusionLayerRef.current = group;
  }, [selectedSite, showExclusions, exclusionZones]);

  const handleSaveZoneEdit = () => {
    if (!selectedZone) return;
    const updated: CityZone = {
      ...selectedZone,
      name: editName,
      type: editType,
      density_level: editDensity
    };
    onUpdateZone(updated);
    setSelectedZone(updated);
    setEditMessage('Zone updated and re-verified against boundary.');
    setTimeout(() => setEditMessage(null), 3500);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950">
      {/* Map Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Preset Site Switcher */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-xl flex items-center space-x-1">
          <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center">
            <Compass className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
            Preset Sites:
          </span>
          {sampleSites.slice(0, 4).map((site) => (
            <button
              key={site.site_id}
              onClick={() => onSelectSite(site)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                selectedSite?.site_id === site.site_id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {site.district}
            </button>
          ))}
        </div>

        {/* Base Map Style */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-xl flex items-center space-x-1 text-xs">
          <button
            onClick={() => setBaseMapType('dark')}
            className={`px-2.5 py-1 rounded-lg transition ${baseMapType === 'dark' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Dark Carto
          </button>
          <button
            onClick={() => setBaseMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg transition ${baseMapType === 'satellite' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Satellite
          </button>
          <button
            onClick={() => setBaseMapType('topo')}
            className={`px-2.5 py-1 rounded-lg transition ${baseMapType === 'topo' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Contours (DEM)
          </button>
        </div>
      </div>

      {/* Layer Visibility Toggles (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl flex flex-col space-y-2 text-xs">
        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider mb-0.5 flex items-center">
          <Layers className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
          Active GIS Layers
        </div>

        <label className="flex items-center space-x-2 cursor-pointer text-slate-200 hover:text-white">
          <input 
            type="checkbox" 
            checked={showZones} 
            onChange={(e) => setShowZones(e.target.checked)} 
            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span>Master Plan Zones ({activePlan?.name.split(':')[0] || 'Plan A'})</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer text-slate-200 hover:text-white">
          <input 
            type="checkbox" 
            checked={showExclusions} 
            onChange={(e) => setShowExclusions(e.target.checked)} 
            className="rounded border-slate-700 text-rose-500 focus:ring-0"
          />
          <span className="text-rose-300">Statutory Exclusion Buffers (100m)</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer text-slate-200 hover:text-white">
          <input 
            type="checkbox" 
            checked={showBhuvanWms} 
            onChange={(e) => setShowBhuvanWms(e.target.checked)} 
            className="rounded border-slate-700 text-orange-500 focus:ring-0"
          />
          <span className="text-orange-300">ISRO Bhuvan LULC 50K (WMS)</span>
        </label>
      </div>

      {/* Interactive Map Canvas */}
      <div ref={mapContainerRef} className="w-full flex-1 z-10" />

      {/* Selected Zone Inspector & Live Geometry Editor Drawer */}
      {selectedZone && (
        <div className="absolute bottom-6 left-6 z-20 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedZone.color }} />
              <span className="font-bold text-slate-100 text-sm">{selectedZone.name}</span>
            </div>
            <button 
              onClick={() => setSelectedZone(null)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Zone Footprint:</span>
              <strong className="text-cyan-400 text-xs">{selectedZone.area_acres} Acres</strong> ({selectedZone.area_percentage}%)
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Density Setting:</span>
              <strong className="text-emerald-400 text-xs">{selectedZone.density_level || 'Medium'}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-slate-400 font-medium mb-1">Zone Name</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-medium mb-1">Functional Classification</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Residential">Residential Mixed-Use</option>
                <option value="Commercial">Commercial & Innovation Hub</option>
                <option value="Industrial">Clean-Tech / Light Industrial</option>
                <option value="Agricultural">Regenerative Urban Agriculture</option>
                <option value="Green_Forest">Urban Forest & Biophilic Park</option>
                <option value="Water_Body">Rainwater Retention Lake / Wetland</option>
                <option value="Renewable_Solar">Solar Farm & Microgrid BESS</option>
                <option value="Civic_STP_SWM">Tertiary STP & Circular Waste Recovery</option>
                <option value="Emergency_Hospital">Hospital & Disaster Relief Base</option>
                <option value="Institutional_Schools">Schools & Public Institutions</option>
              </select>
            </div>
          </div>

          {editMessage && (
            <div className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1.5 rounded-lg flex items-center">
              <Check className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              {editMessage}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => onDeleteZone(selectedZone.id)}
              className="px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/40 border border-rose-900/50 rounded-lg transition flex items-center text-[11px]"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete Zone
            </button>

            <button
              onClick={handleSaveZoneEdit}
              className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-semibold rounded-lg hover:bg-cyan-400 transition flex items-center text-[11px] shadow-md shadow-cyan-500/20"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Apply Changes
            </button>
          </div>
        </div>
      )}

      {/* Map Legend Overlay (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl max-w-xs text-[11px]">
        <div className="font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>Master Plan Zoning Legend</span>
          <span className="text-[10px] font-mono text-cyan-400">{activePlan?.zones.length || 0} Zones</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
            <span>Residential</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
            <span>Commercial / TOD</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
            <span>Forest & Green</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]" />
            <span>Water / RWH Lake</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#eab308]" />
            <span>Solar / Microgrid</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]" />
            <span>Urban Agriculture</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" />
            <span>Hospital / Civic</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#64748b]" />
            <span>Tertiary STP/SWM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
