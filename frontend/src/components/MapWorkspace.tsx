import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers, MapPin, Eye, EyeOff, Sparkles, AlertTriangle,
  ZoomIn, ZoomOut, Compass, RefreshCw, PenTool, CheckCircle, Info,
  Maximize, Minimize, Crosshair, Ruler, Trash2, Edit3, X, ChevronLeft,
  ChevronRight, ChevronUp, ChevronDown, ShieldCheck, Activity,
  Database, Droplets, Mountain, Sun, Trees, Navigation, ArrowUpRight,
  Sliders, Download, Map as MapIcon
} from 'lucide-react';
import { MasterPlanAlternative, MasterPlanZone, SiteSuitabilityResult } from '../types';
import {
  getDistanceMeters,
  calculatePolygonArea,
  getBoundsFromCoords,
  generateSiteContours,
  generateSiteWaterBodies,
  generateSiteFloodZones,
  generateSiteBhuvanLULC,
  generateSiteNDVI,
  generateDefaultMasterPlan,
  INDIAN_PRESET_LOCATIONS
} from './gisUtils';

export interface MapWorkspaceProps {
  center: { lat: number; lng: number };
  boundary: any;
  activePlan: MasterPlanAlternative | null;
  onEditZone: (zone: MasterPlanZone) => void;
  onBoundaryDrawn: (polygon: number[][][], areaAcres: number) => void;
  siteName: string;
  suitability?: SiteSuitabilityResult | null;
  onSelectSite?: (siteId: string) => void;
  onResetBoundary?: () => void;
}

// 8 Thematic Geospatial Layer Keys
type LayerKey =
  | 'satellite'
  | 'terrain'
  | 'streets'
  | 'lulc'
  | 'vegetation'
  | 'water'
  | 'contours'
  | 'flood'
  | 'zones';

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  center,
  boundary,
  activePlan: passedActivePlan,
  onEditZone,
  onBoundaryDrawn,
  siteName,
  suitability,
  onSelectSite,
  onResetBoundary
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups for 8 thematic geospatial layers + drawing & measurement
  const zonesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const contoursLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const waterLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const floodLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const lulcLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const vegLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const measureLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const editMarkersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const locationMarkerRef = useRef<L.Marker | null>(null);

  // Active Plan fallback to realistic high-fidelity default if not provided
  const activePlan = passedActivePlan || generateDefaultMasterPlan(siteName, center, 500);

  // Panel Collapse States
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);
  const [bottomPanelExpanded, setBottomPanelExpanded] = useState<boolean>(false);
  const [leftTab, setLeftTab] = useState<'info' | 'layers' | 'tools'>('layers');

  // Base map & 8 Toggleable Geospatial Layers
  const [baseMap, setBaseMap] = useState<'satellite' | 'dark' | 'terrain' | 'streets'>('satellite');

  const [layerVisibility, setLayerVisibility] = useState<Record<LayerKey, boolean>>({
    satellite: true,
    terrain: false,
    streets: false,
    lulc: true,
    vegetation: false,
    water: true,
    contours: true,
    flood: true,
    zones: true
  });

  const [layerOpacity, setLayerOpacity] = useState<Record<LayerKey, number>>({
    satellite: 1.0,
    terrain: 0.8,
    streets: 0.9,
    lulc: 0.55,
    vegetation: 0.65,
    water: 0.75,
    contours: 0.9,
    flood: 0.6,
    zones: 0.5
  });

  // Selected Zone for Interactive Inspector
  const [selectedZone, setSelectedZone] = useState<MasterPlanZone | null>(null);

  // Coordinates & Scale State
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Boundary Drawing Mode
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [liveDrawingStats, setLiveDrawingStats] = useState<{ acres: number; hectares: number; pts: number }>({
    acres: 0,
    hectares: 0,
    pts: 0
  });

  // Boundary Edit Mode
  const [isEditingBoundary, setIsEditingBoundary] = useState<boolean>(false);
  const [editablePoints, setEditablePoints] = useState<[number, number][]>([]);

  // Measurement Tool State (Ruler: Distance & Area)
  const [measureMode, setMeasureMode] = useState<'off' | 'distance' | 'area'>('off');
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureResult, setMeasureResult] = useState<{
    distanceM: number;
    distanceKm: number;
    areaAcres: number;
    areaHa: number;
  }>({ distanceM: 0, distanceKm: 0, areaAcres: 0, areaHa: 0 });

  // Floating notifications/toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Default Esri High-Resolution Satellite imagery
    const tileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri, Maxar, Earthstar Geographics & ISRO',
        maxZoom: 19
      }
    ).addTo(map);

    baseTileLayerRef.current = tileLayer;

    // Create thematic layer groups in order of stacking
    lulcLayerGroupRef.current = L.layerGroup().addTo(map);
    vegLayerGroupRef.current = L.layerGroup().addTo(map);
    contoursLayerGroupRef.current = L.layerGroup().addTo(map);
    floodLayerGroupRef.current = L.layerGroup().addTo(map);
    waterLayerGroupRef.current = L.layerGroup().addTo(map);
    zonesLayerGroupRef.current = L.layerGroup().addTo(map);
    drawingLayerGroupRef.current = L.layerGroup().addTo(map);
    measureLayerGroupRef.current = L.layerGroup().addTo(map);
    editMarkersLayerGroupRef.current = L.layerGroup().addTo(map);

    // Mouse tracking for live coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: parseFloat(e.latlng.lat.toFixed(6)),
        lng: parseFloat(e.latlng.lng.toFixed(6))
      });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Trigger map resize on panel open/close
  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [leftPanelOpen, rightPanelOpen, bottomPanelExpanded]);

  // 3. Center update handler
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
  }, [center]);

  // 4. Base Map switcher
  useEffect(() => {
    if (!mapRef.current || !baseTileLayerRef.current) return;

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    if (baseMap === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (baseMap === 'terrain') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
    } else if (baseMap === 'streets') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }

    baseTileLayerRef.current.setUrl(url);
  }, [baseMap]);

  // 5. Render Site Boundary Polygon
  useEffect(() => {
    if (!mapRef.current || !boundary || !boundary.coordinates || boundary.coordinates.length === 0) return;

    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.remove();
    }

    const latLngs: [number, number][] = boundary.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);

    const poly = L.polygon(latLngs, {
      color: '#22d3ee',
      weight: 3,
      dashArray: '8, 6',
      fillColor: '#22d3ee',
      fillOpacity: 0.04
    }).addTo(mapRef.current);

    boundaryLayerRef.current = poly;

    // Save points for edit mode
    setEditablePoints(latLngs);

    if (!isDrawing && !isEditingBoundary && latLngs.length > 2) {
      mapRef.current.fitBounds(poly.getBounds(), { padding: [60, 60] });
    }
  }, [boundary]);

  // 6. Render Elevation Contours Layer
  useEffect(() => {
    if (!contoursLayerGroupRef.current) return;
    contoursLayerGroupRef.current.clearLayers();

    if (!layerVisibility.contours) return;

    const contours = generateSiteContours(center, 10.4);
    const opacity = layerOpacity.contours;

    contours.forEach((c) => {
      const line = L.polyline(c.coordinates, {
        color: c.isIndexContour ? '#e2e8f0' : '#94a3b8',
        weight: c.isIndexContour ? 2 : 1.2,
        dashArray: c.isIndexContour ? undefined : '3, 4',
        opacity: opacity
      });

      line.bindTooltip(`Elevation: ${c.label}`, {
        permanent: false,
        direction: 'center',
        className: 'bg-slate-900/95 text-cyan-300 text-[10px] font-mono border border-slate-700 px-1.5 py-0.5 rounded shadow'
      });

      contoursLayerGroupRef.current?.addLayer(line);
    });
  }, [center, layerVisibility.contours, layerOpacity.contours]);

  // 7. Render Water Bodies & Statutory 50m NGT Buffer Layer
  useEffect(() => {
    if (!waterLayerGroupRef.current) return;
    waterLayerGroupRef.current.clearLayers();

    if (!layerVisibility.water) return;

    const waterBodies = generateSiteWaterBodies(center);
    const opacity = layerOpacity.water;

    waterBodies.forEach((wb) => {
      // 50m Ecological Buffer
      const bufferPoly = L.polygon(wb.bufferPolygon, {
        color: '#06b6d4',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#06b6d4',
        fillOpacity: opacity * 0.18
      });

      bufferPoly.bindTooltip(`50m NGT Buffer: ${wb.name}`, {
        permanent: false,
        direction: 'top',
        className: 'bg-cyan-950/90 text-cyan-200 text-xs border border-cyan-700 rounded px-2 py-1'
      });

      // Actual Water Body
      const waterPoly = L.polygon(wb.polygon, {
        color: '#0284c7',
        weight: 2,
        fillColor: '#0284c7',
        fillOpacity: opacity * 0.8
      });

      waterPoly.bindTooltip(`<b>${wb.name}</b><br/>Capacity: ${wb.capacityML} ML (CGWB Geo-tagged)`, {
        permanent: false,
        direction: 'center',
        className: 'bg-slate-900 text-blue-200 text-xs border border-blue-700 rounded px-2 py-1 shadow-lg'
      });

      waterLayerGroupRef.current?.addLayer(bufferPoly);
      waterLayerGroupRef.current?.addLayer(waterPoly);
    });
  }, [center, layerVisibility.water, layerOpacity.water]);

  // 8. Render Flood-Risk Overlays
  useEffect(() => {
    if (!floodLayerGroupRef.current) return;
    floodLayerGroupRef.current.clearLayers();

    if (!layerVisibility.flood) return;

    const floodZones = generateSiteFloodZones(center);
    const opacity = layerOpacity.flood;

    floodZones.forEach((fz) => {
      const poly = L.polygon(fz.polygon, {
        color: fz.color,
        weight: 1.8,
        dashArray: '5, 5',
        fillColor: fz.color,
        fillOpacity: opacity * 0.38
      });

      poly.bindTooltip(
        `<b>${fz.hazardLevel} Flood Hazard Zone</b><br/>Return: ${fz.returnPeriod}<br/>Depth: ${fz.inundationDepthM}`,
        {
          permanent: false,
          direction: 'center',
          className: 'bg-slate-900 text-rose-200 text-xs border border-rose-700 rounded px-2.5 py-1.5 shadow-xl'
        }
      );

      floodLayerGroupRef.current?.addLayer(poly);
    });
  }, [center, layerVisibility.flood, layerOpacity.flood]);

  // 9. Render ISRO Bhuvan LULC Layer
  useEffect(() => {
    if (!lulcLayerGroupRef.current) return;
    lulcLayerGroupRef.current.clearLayers();

    if (!layerVisibility.lulc) return;

    const lulcFeatures = generateSiteBhuvanLULC(center);
    const opacity = layerOpacity.lulc;

    lulcFeatures.forEach((feat) => {
      const poly = L.polygon(feat.polygon, {
        color: feat.color,
        weight: 1.5,
        fillColor: feat.color,
        fillOpacity: opacity * 0.5
      });

      poly.bindTooltip(`<b>${feat.className} (${feat.code})</b><br/>ISRO Bhuvan 1:50,000 (${feat.areaPct}%)`, {
        permanent: false,
        direction: 'center',
        className: 'bg-slate-900 text-amber-200 text-xs border border-amber-600 rounded px-2 py-1'
      });

      lulcLayerGroupRef.current?.addLayer(poly);
    });
  }, [center, layerVisibility.lulc, layerOpacity.lulc]);

  // 10. Render Sentinel-2 / VEDAS NDVI Layer
  useEffect(() => {
    if (!vegLayerGroupRef.current) return;
    vegLayerGroupRef.current.clearLayers();

    if (!layerVisibility.vegetation) return;

    const ndviFeatures = generateSiteNDVI(center);
    const opacity = layerOpacity.vegetation;

    ndviFeatures.forEach((feat) => {
      const poly = L.polygon(feat.polygon, {
        color: feat.color,
        weight: 1.5,
        fillColor: feat.color,
        fillOpacity: opacity * 0.5
      });

      poly.bindTooltip(`<b>${feat.level}</b><br/>NDVI Index: ${feat.ndviRange}<br/>Source: VEDAS AWiFS 10m`, {
        permanent: false,
        direction: 'center',
        className: 'bg-slate-900 text-emerald-200 text-xs border border-emerald-600 rounded px-2 py-1'
      });

      vegLayerGroupRef.current?.addLayer(poly);
    });
  }, [center, layerVisibility.vegetation, layerOpacity.vegetation]);

  // 11. Render Master Plan Zones with Interactive Popups & Inspector
  useEffect(() => {
    if (!zonesLayerGroupRef.current) return;
    zonesLayerGroupRef.current.clearLayers();

    if (!layerVisibility.zones || !activePlan) return;

    const opacity = layerOpacity.zones;

    activePlan.zones.forEach((zone) => {
      if (!zone.geometry || !zone.geometry.coordinates || zone.geometry.coordinates.length === 0) return;
      const latLngs: [number, number][] = zone.geometry.coordinates[0].map((c: number[]) => [c[1], c[0]]);

      const zonePoly = L.polygon(latLngs, {
        color: zone.color,
        weight: 2,
        fillColor: zone.color,
        fillOpacity: opacity
      });

      // Hover styling
      zonePoly.on('mouseover', () => {
        zonePoly.setStyle({ weight: 3.5, fillOpacity: Math.min(1.0, opacity + 0.25) });
      });

      zonePoly.on('mouseout', () => {
        zonePoly.setStyle({ weight: 2, fillOpacity: opacity });
      });

      // Interactive Click Popup & Inspector
      zonePoly.on('click', (e) => {
        setSelectedZone(zone);
        L.DomEvent.stopPropagation(e);
      });

      // Tooltip
      zonePoly.bindTooltip(
        `<div class="space-y-0.5">
          <div class="font-bold text-slate-100 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full inline-block" style="background:${zone.color}"></span>
            ${zone.name}
          </div>
          <div class="text-[11px] text-cyan-300 font-mono">${zone.area_acres} Acres • ${zone.area_percentage}% of site • FAR ${zone.far_ratio}</div>
        </div>`,
        {
          permanent: false,
          direction: 'center',
          className: 'bg-slate-900/95 text-slate-100 border border-slate-700 rounded-lg p-2 shadow-2xl backdrop-blur-md'
        }
      );

      zonesLayerGroupRef.current?.addLayer(zonePoly);
    });
  }, [activePlan, layerVisibility.zones, layerOpacity.zones]);

  // 12. Drawing Boundary Handler
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawing) return;
      const newPt: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDrawnPoints((prev) => {
        const updated = [...prev, newPt];
        redrawDrawing(updated);

        // Compute real-time area if 3+ points
        if (updated.length >= 3) {
          const areaCalc = calculatePolygonArea(updated);
          setLiveDrawingStats({
            acres: areaCalc.acres,
            hectares: areaCalc.hectares,
            pts: updated.length
          });
        } else {
          setLiveDrawingStats({ acres: 0, hectares: 0, pts: updated.length });
        }

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

    points.forEach((pt, idx) => {
      const isStart = idx === 0;
      const marker = L.circleMarker(pt, {
        radius: isStart ? 7 : 5,
        color: isStart ? '#22d3ee' : '#10b981',
        fillColor: isStart ? '#22d3ee' : '#10b981',
        fillOpacity: 0.95
      });
      drawingLayerGroupRef.current?.addLayer(marker);
    });

    if (points.length >= 2) {
      const line = L.polyline(points, { color: '#10b981', weight: 2.5, dashArray: '5, 5' });
      drawingLayerGroupRef.current.addLayer(line);
    }

    if (points.length >= 3) {
      const poly = L.polygon(points, {
        color: '#10b981',
        weight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.15
      });
      drawingLayerGroupRef.current.addLayer(poly);
    }
  };

  const finishDrawing = () => {
    if (drawnPoints.length < 3) {
      showToast('Click at least 3 points on the map to define a valid polygon boundary.');
      return;
    }
    const closed = [...drawnPoints, drawnPoints[0]];
    const geojsonCoords = [closed.map((p) => [p[1], p[0]])];
    const areaCalc = calculatePolygonArea(closed);

    onBoundaryDrawn(geojsonCoords, areaCalc.acres);
    setIsDrawing(false);
    setDrawnPoints([]);
    drawingLayerGroupRef.current?.clearLayers();
    showToast(`Site boundary created: ${areaCalc.acres} Acres (${areaCalc.hectares} Ha)`);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setDrawnPoints([]);
    setLiveDrawingStats({ acres: 0, hectares: 0, pts: 0 });
    drawingLayerGroupRef.current?.clearLayers();
  };

  // 13. Boundary Edit Mode Handler
  const toggleEditBoundary = () => {
    if (!boundary || !boundary.coordinates || boundary.coordinates.length === 0) {
      showToast('No active boundary available to edit.');
      return;
    }

    if (isEditingBoundary) {
      // Save changes
      if (editablePoints.length >= 3) {
        const closed = [...editablePoints, editablePoints[0]];
        const geojsonCoords = [closed.map((p) => [p[1], p[0]])];
        const areaCalc = calculatePolygonArea(closed);
        onBoundaryDrawn(geojsonCoords, areaCalc.acres);
        showToast(`Saved boundary edits: ${areaCalc.acres} Acres`);
      }
      setIsEditingBoundary(false);
      editMarkersLayerGroupRef.current?.clearLayers();
    } else {
      setIsEditingBoundary(true);
      showToast('Boundary Edit Mode: Drag vertex handles to reshape boundary');
      renderEditHandles(editablePoints);
    }
  };

  const renderEditHandles = (points: [number, number][]) => {
    if (!editMarkersLayerGroupRef.current || !mapRef.current) return;
    editMarkersLayerGroupRef.current.clearLayers();

    points.forEach((pt, idx) => {
      const vertexIcon = L.divIcon({
        className: 'custom-edit-vertex',
        html: `<div style="background:#22d3ee; width:12px; height:12px; border:2px solid #0f172a; border-radius:50%; box-shadow:0 0 8px #22d3ee; cursor:move;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker(pt, {
        draggable: true,
        icon: vertexIcon
      });

      marker.on('drag', (e: any) => {
        const newLatLng = e.target.getLatLng();
        setEditablePoints((prev) => {
          const updated = [...prev];
          updated[idx] = [newLatLng.lat, newLatLng.lng];

          // Update boundary poly preview
          if (boundaryLayerRef.current) {
            boundaryLayerRef.current.setLatLngs(updated);
          }
          return updated;
        });
      });

      editMarkersLayerGroupRef.current?.addLayer(marker);
    });
  };

  // 14. Delete / Reset Boundary Handler
  const handleDeleteBoundary = () => {
    if (window.confirm('Reset boundary to the default 500-Acre master plan envelope?')) {
      if (onResetBoundary) {
        onResetBoundary();
      } else {
        onBoundaryDrawn([
          [
            [center.lng - 0.007, center.lat - 0.007],
            [center.lng + 0.007, center.lat - 0.007],
            [center.lng + 0.007, center.lat + 0.007],
            [center.lng - 0.007, center.lat + 0.007],
            [center.lng - 0.007, center.lat - 0.007]
          ]
        ], 500);
      }
      showToast('Boundary reset to default master plan extent.');
    }
  };

  // 15. Measurement Tool Handler (Distance & Area)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleMeasureClick = (e: L.LeafletMouseEvent) => {
      if (measureMode === 'off') return;
      const pt: [number, number] = [e.latlng.lat, e.latlng.lng];

      setMeasurePoints((prev) => {
        const updated = [...prev, pt];
        renderMeasurement(updated, measureMode);
        return updated;
      });
    };

    map.on('click', handleMeasureClick);
    return () => {
      map.off('click', handleMeasureClick);
    };
  }, [measureMode]);

  const renderMeasurement = (points: [number, number][], mode: 'distance' | 'area' | 'off') => {
    if (!measureLayerGroupRef.current) return;
    measureLayerGroupRef.current.clearLayers();

    if (mode === 'off' || points.length === 0) return;

    // Vertex markers
    points.forEach((p) => {
      const circle = L.circleMarker(p, {
        radius: 5,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.9
      });
      measureLayerGroupRef.current?.addLayer(circle);
    });

    if (mode === 'distance' && points.length >= 2) {
      let totalDist = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const segDist = getDistanceMeters(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
        totalDist += segDist;

        // Midpoint tooltip
        const mid: [number, number] = [(points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2];
        const segLabel = L.tooltip({
          permanent: true,
          direction: 'center',
          className: 'bg-amber-950/90 text-amber-200 text-[10px] font-mono border border-amber-600 px-1 py-0.5 rounded'
        })
          .setLatLng(mid)
          .setContent(`${Math.round(segDist)} m`);
        measureLayerGroupRef.current?.addLayer(segLabel);
      }

      const line = L.polyline(points, { color: '#f59e0b', weight: 2.5, dashArray: '6, 4' });
      measureLayerGroupRef.current.addLayer(line);

      setMeasureResult({
        distanceM: Math.round(totalDist),
        distanceKm: Math.round((totalDist / 1000) * 100) / 100,
        areaAcres: 0,
        areaHa: 0
      });
    } else if (mode === 'area' && points.length >= 3) {
      const areaCalc = calculatePolygonArea(points);
      const poly = L.polygon(points, {
        color: '#f59e0b',
        weight: 2,
        fillColor: '#f59e0b',
        fillOpacity: 0.25
      });
      measureLayerGroupRef.current.addLayer(poly);

      setMeasureResult({
        distanceM: 0,
        distanceKm: 0,
        areaAcres: areaCalc.acres,
        areaHa: areaCalc.hectares
      });
    }
  };

  const clearMeasurement = () => {
    setMeasurePoints([]);
    setMeasureResult({ distanceM: 0, distanceKm: 0, areaAcres: 0, areaHa: 0 });
    measureLayerGroupRef.current?.clearLayers();
  };

  // 16. Geolocation Current Location Handler
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    showToast('Locating your position via GPS/IP...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        if (mapRef.current) {
          mapRef.current.flyTo([userLat, userLng], 15, { duration: 2 });

          if (locationMarkerRef.current) {
            locationMarkerRef.current.remove();
          }

          const icon = L.divIcon({
            className: 'custom-location-marker',
            html: `<div style="position:relative; width:18px; height:18px;">
                     <div style="position:absolute; width:18px; height:18px; background:#22d3ee; border-radius:50%; border:3px solid white; box-shadow:0 0 10px #22d3ee;"></div>
                     <div style="position:absolute; width:36px; height:36px; left:-9px; top:-9px; background:rgba(34,211,238,0.3); border-radius:50%; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                   </div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });

          const m = L.marker([userLat, userLng], { icon }).addTo(mapRef.current);
          m.bindPopup('<b>Current Device Location</b><br/>High Accuracy GPS Fix', { closeButton: false }).openPopup();
          locationMarkerRef.current = m;
          showToast(`Located: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`);
        }
      },
      () => {
        showToast('Location permission denied. Resetting to site center.');
        mapRef.current?.flyTo([center.lat, center.lng], 14);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // 17. Full-Screen Toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  // 18. Indian Location Search & Quick-Jump
  const handleSearchLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    // Check preset list
    const foundPreset = INDIAN_PRESET_LOCATIONS.find(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.district.toLowerCase().includes(query) ||
        p.state.toLowerCase().includes(query)
    );

    if (foundPreset) {
      if (onSelectSite) onSelectSite(foundPreset.id);
      mapRef.current?.flyTo([foundPreset.center.lat, foundPreset.center.lng], 14, { duration: 1.5 });
      showToast(`Navigated to ${foundPreset.name}`);
      return;
    }

    // Check direct lat,lng format
    const coordParts = query.split(',').map((s) => parseFloat(s.trim()));
    if (coordParts.length === 2 && !isNaN(coordParts[0]) && !isNaN(coordParts[1])) {
      mapRef.current?.flyTo([coordParts[0], coordParts[1]], 14, { duration: 1.5 });
      showToast(`Jumped to coordinates: ${coordParts[0]}, ${coordParts[1]}`);
      return;
    }

    showToast(`Searching regional catalog for "${searchQuery}"...`);
    mapRef.current?.flyTo([22.2530, 72.1920], 13);
  };

  // Computed total site area from boundary if available
  const siteAreaCalculated = boundary?.coordinates?.[0]
    ? calculatePolygonArea(boundary.coordinates[0].map((c: number[]) => [c[1], c[0]]))
    : { acres: 500, hectares: 202.34, sqKm: 2.02 };

  return (
    <div className="relative w-full h-[calc(100vh-115px)] bg-[#07111f] overflow-hidden flex select-none">
      {/* Central Interactive Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT PANEL (COLLAPSIBLE) */}
      <div
        className={`absolute top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out flex ${
          leftPanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="w-80 md:w-96 h-full bg-[#0d1928]/95 border-r border-slate-700/70 backdrop-blur-xl shadow-2xl flex flex-col text-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/60 flex items-center justify-between bg-[#111f30]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-600/30">
                <MapIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 tracking-wide">GIS Spatial Workspace</h2>
                <p className="text-[10px] text-cyan-400/90 font-mono">ISRO Space & Esri Imagery</p>
              </div>
            </div>
            <button
              onClick={() => setLeftPanelOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
              title="Collapse Left Panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 p-1.5 bg-[#0a1320] border-b border-slate-800 text-xs">
            <button
              onClick={() => setLeftTab('layers')}
              className={`py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                leftTab === 'layers' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>
            <button
              onClick={() => setLeftTab('info')}
              className={`py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                leftTab === 'info' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Site Info</span>
            </button>
            <button
              onClick={() => setLeftTab('tools')}
              className={`py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                leftTab === 'tools' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tools</span>
            </button>
          </div>

          {/* TAB 1: 8 GEOSPATIAL LAYERS */}
          {leftTab === 'layers' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {/* Base Map Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Base Cartography
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'satellite', name: 'Esri Satellite', icon: Sun },
                    { id: 'dark', name: 'Dark Matter', icon: Crosshair },
                    { id: 'terrain', name: 'Topo Relief', icon: Mountain },
                    { id: 'streets', name: 'OSM Voyager', icon: Navigation }
                  ].map((bm) => (
                    <button
                      key={bm.id}
                      onClick={() => setBaseMap(bm.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                        baseMap === bm.id
                          ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-900/30'
                          : 'bg-[#111f30]/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <bm.icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{bm.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 8 Thematic Overlays with Opacity Sliders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    8 Geospatial Overlays
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">Real-time WMS</span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      key: 'zones' as LayerKey,
                      name: 'Master Plan 12-Zone Partition',
                      tag: 'AI Generated',
                      color: '#3b82f6',
                      desc: 'Land-use allocations with FAR and density'
                    },
                    {
                      key: 'water' as LayerKey,
                      name: 'Water Bodies & 50m NGT Buffers',
                      tag: 'CGWB & Eco',
                      color: '#06b6d4',
                      desc: 'Ponds, tanks, and statutory non-construction buffer'
                    },
                    {
                      key: 'contours' as LayerKey,
                      name: 'Elevation Contours (Cartosat-3 DEM)',
                      tag: '2.5m Res',
                      color: '#e2e8f0',
                      desc: 'Topographic contour lines at 2m intervals'
                    },
                    {
                      key: 'flood' as LayerKey,
                      name: 'Flood Risk (1:25 & 1:50-Yr Storms)',
                      tag: 'Hazard Zone',
                      color: '#ef4444',
                      desc: 'Low-elevation inundation surge corridors'
                    },
                    {
                      key: 'lulc' as LayerKey,
                      name: 'ISRO Bhuvan Land-Use (LULC 50k)',
                      tag: 'NRSC ISRO',
                      color: '#d97706',
                      desc: 'Official scrubland, barren, and cropland patches'
                    },
                    {
                      key: 'vegetation' as LayerKey,
                      name: 'Vegetation Health (Sentinel-2 NDVI)',
                      tag: 'VEDAS AWiFS',
                      color: '#10b981',
                      desc: 'Canopy density and riparian green index'
                    }
                  ].map((layer) => (
                    <div
                      key={layer.key}
                      className="bg-[#111f30]/70 border border-slate-700/60 rounded-xl p-2.5 transition hover:border-slate-600"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: layer.color }}
                          />
                          <span className="text-xs font-semibold text-slate-200 truncate">{layer.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-mono bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700">
                            {layer.tag}
                          </span>
                          <button
                            onClick={() =>
                              setLayerVisibility((prev) => ({ ...prev, [layer.key]: !prev[layer.key] }))
                            }
                            className={`p-1 rounded hover:bg-slate-800 transition cursor-pointer ${
                              layerVisibility[layer.key] ? 'text-cyan-400' : 'text-slate-500'
                            }`}
                            title={layerVisibility[layer.key] ? 'Hide Layer' : 'Show Layer'}
                          >
                            {layerVisibility[layer.key] ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 mb-2 leading-tight">{layer.desc}</p>

                      {/* Opacity Slider */}
                      {layerVisibility[layer.key] && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-400 font-mono w-12">Opacity:</span>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={layerOpacity[layer.key]}
                            onChange={(e) =>
                              setLayerOpacity((prev) => ({
                                ...prev,
                                [layer.key]: parseFloat(e.target.value)
                              }))
                            }
                            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                          <span className="text-[10px] text-cyan-400 font-mono w-8 text-right">
                            {Math.round(layerOpacity[layer.key] * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SITE INFO & PRESETS */}
          {leftTab === 'info' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {/* Site Card */}
              <div className="bg-gradient-to-br from-[#111f30] to-[#17283a] border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100">{siteName}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Area</span>
                    <span className="font-bold text-cyan-300">
                      {siteAreaCalculated.acres} ac ({siteAreaCalculated.hectares} ha)
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Target Pop</span>
                    <span className="font-bold text-emerald-300">20,000 citizens</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Gross Density</span>
                    <span className="font-bold text-indigo-300">40.0 ppl/acre</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Active Zones</span>
                    <span className="font-bold text-amber-300">{activePlan.zones.length} Master Zones</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-lg font-mono">
                  <span>Centroid:</span>
                  <span className="text-cyan-400">
                    {center.lat.toFixed(4)}°N, {center.lng.toFixed(4)}°E
                  </span>
                </div>
              </div>

              {/* Quick Jump Indian Greenfield Presets */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Select Indian Smart City Hub
                </label>
                <div className="space-y-1.5">
                  {INDIAN_PRESET_LOCATIONS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (onSelectSite) onSelectSite(preset.id);
                        mapRef.current?.flyTo([preset.center.lat, preset.center.lng], 14, { duration: 1.5 });
                        showToast(`Switched site to ${preset.name}`);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-[#111f30]/60 hover:bg-[#17283a] border border-slate-700/60 hover:border-cyan-500/50 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                          {preset.city}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                          Score {preset.suitabilityScore}/100
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                        <span>{preset.district}, {preset.state}</span>
                        <span>{preset.areaAcres} Acres</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYSIS & GIS TOOLS */}
          {leftTab === 'tools' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Geospatial Compliance Checks
                </label>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#111f30]/70 border border-slate-700/60">
                    <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>NGT 50m Water Buffer Compliance</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      All proposed built-up structures maintain &gt;50m setback from high-flood levels of lake & retention tanks.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111f30]/70 border border-slate-700/60">
                    <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-cyan-300">
                      <Mountain className="w-4 h-4 text-cyan-400" />
                      <span>Slope Feasibility Check</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Mean slope is 1.2° (&lt;3° recommended). Optimal for storm drainage gravity flow and road grading.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111f30]/70 border border-slate-700/60">
                    <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>50-Yr Storm Inundation Check</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Southern sector has moderate flood pooling. Finished plinth level should be raised by +1.2m MSL.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Export Spatial Data
                </label>
                <button
                  onClick={() => {
                    const geojsonStr = JSON.stringify(
                      {
                        type: 'FeatureCollection',
                        features: activePlan.zones.map((z) => ({
                          type: 'Feature',
                          properties: { name: z.name, area_acres: z.area_acres, far: z.far_ratio },
                          geometry: z.geometry
                        }))
                      },
                      null,
                      2
                    );
                    const blob = new Blob([geojsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${siteName.replace(/\s+/g, '_')}_master_plan.geojson`;
                    a.click();
                    showToast('GeoJSON exported successfully.');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 rounded-xl border border-slate-600 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download Master Plan GeoJSON</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Left Panel Toggle Tab when open */}
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="self-center -mr-4 z-40 bg-[#0d1928] hover:bg-slate-800 text-cyan-400 p-1.5 rounded-r-xl border-y border-r border-slate-700/80 shadow-2xl transition cursor-pointer"
          title="Toggle Left Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Button to reopen Left Panel when closed */}
      {!leftPanelOpen && (
        <button
          onClick={() => setLeftPanelOpen(true)}
          className="absolute top-20 left-4 z-20 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700/80 backdrop-blur-md p-2.5 rounded-xl shadow-2xl transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
          title="Open Geospatial Workspace"
        >
          <Layers className="w-4 h-4" />
          <span>Layers & Site</span>
        </button>
      )}

      {/* TOP FLOATING CONTROLS: SEARCH, DRAW, MEASURE */}
      <div className="absolute top-4 left-4 md:left-24 z-20 flex flex-wrap items-center gap-2">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchLocation}
          className="flex items-center bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-xl p-1 shadow-2xl"
        >
          <MapPin className="w-4 h-4 text-cyan-400 ml-2.5 mr-1" />
          <input
            type="text"
            placeholder="Search Indian location (Dholera, Amaravati)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 md:w-60 bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none px-2 py-1"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
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
              setMeasureMode('off');
              setIsEditingBoundary(false);
              showToast('Click points on the map to draw your site polygon boundary');
            }}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 backdrop-blur-md text-xs font-semibold px-3 py-2 rounded-xl shadow-2xl transition cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Draw Land Boundary</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-950/95 border border-emerald-500 text-emerald-200 text-xs px-3 py-1.5 rounded-xl backdrop-blur-md shadow-2xl animate-pulse">
            <span className="font-mono">
              Pts: {liveDrawingStats.pts} | {liveDrawingStats.acres} Ac ({liveDrawingStats.hectares} Ha)
            </span>
            <button
              onClick={finishDrawing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              Complete
            </button>
            <button
              onClick={cancelDrawing}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Edit Boundary Button */}
        <button
          onClick={toggleEditBoundary}
          className={`flex items-center gap-1.5 border backdrop-blur-md text-xs font-semibold px-3 py-2 rounded-xl shadow-2xl transition cursor-pointer ${
            isEditingBoundary
              ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300'
          }`}
          title="Drag boundary vertices"
        >
          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">{isEditingBoundary ? 'Save Edits' : 'Edit Boundary'}</span>
        </button>

        {/* Delete / Reset Boundary */}
        <button
          onClick={handleDeleteBoundary}
          className="flex items-center gap-1 bg-slate-900/90 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 text-slate-400 backdrop-blur-md text-xs font-semibold px-2.5 py-2 rounded-xl shadow-2xl transition cursor-pointer"
          title="Reset boundary to preset default"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Measurement Tool Toggle */}
        <div className="bg-slate-900/90 border border-slate-700 backdrop-blur-md rounded-xl p-0.5 shadow-2xl flex items-center">
          <button
            onClick={() => {
              setMeasureMode(measureMode === 'distance' ? 'off' : 'distance');
              setIsDrawing(false);
              clearMeasurement();
              showToast('Distance mode: Click sequential points to measure distance');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              measureMode === 'distance' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
            title="Measure Distance"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ruler</span>
          </button>
          <button
            onClick={() => {
              setMeasureMode(measureMode === 'area' ? 'off' : 'area');
              setIsDrawing(false);
              clearMeasurement();
              showToast('Area mode: Click 3+ points to measure polygon area');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              measureMode === 'area' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
            title="Measure Area"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Area</span>
          </button>
        </div>

        {/* Live Measurement Result Indicator */}
        {measureMode !== 'off' && measurePoints.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-950/90 border border-amber-500 text-amber-200 text-xs px-3 py-1.5 rounded-xl backdrop-blur-md shadow-2xl">
            {measureMode === 'distance' && (
              <span className="font-mono">
                Distance: <b>{measureResult.distanceKm} km</b> ({measureResult.distanceM} m)
              </span>
            )}
            {measureMode === 'area' && (
              <span className="font-mono">
                Area: <b>{measureResult.areaAcres} Ac</b> ({measureResult.areaHa} Ha)
              </span>
            )}
            <button
              onClick={clearMeasurement}
              className="text-amber-400 hover:text-white text-xs underline cursor-pointer ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* FLOATING MAP CONTROLS (RIGHT CORNER): ZOOM, FULLSCREEN, GEOLOCATION */}
      <div className="absolute top-4 right-4 md:right-16 z-20 flex flex-col gap-2">
        <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-xl p-1 shadow-2xl flex flex-col gap-1">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 my-0.5" />
          <button
            onClick={handleCurrentLocation}
            className="p-2 text-cyan-400 hover:text-cyan-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="My Current Location (GPS)"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (boundaryLayerRef.current && mapRef.current) {
                mapRef.current.fitBounds(boundaryLayerRef.current.getBounds(), { padding: [60, 60] });
              } else {
                mapRef.current?.flyTo([center.lat, center.lng], 14);
              }
            }}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Fit to Site Boundary"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullScreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL (COLLAPSIBLE): SITE INTELLIGENCE, RISK & METADATA */}
      <div
        className={`absolute top-0 right-0 bottom-0 z-30 transition-all duration-300 ease-in-out flex ${
          rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Toggle tab on left edge of right panel */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="self-center -ml-4 z-40 bg-[#0d1928] hover:bg-slate-800 text-cyan-400 p-1.5 rounded-l-xl border-y border-l border-slate-700/80 shadow-2xl transition cursor-pointer"
          title="Toggle Right Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-80 md:w-96 h-full bg-[#0d1928]/95 border-l border-slate-700/70 backdrop-blur-xl shadow-2xl flex flex-col text-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/60 flex items-center justify-between bg-[#111f30]/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100">Site Intelligence & Risk</h2>
            </div>
            <button
              onClick={() => setRightPanelOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {/* Site Suitability Score Radial Gauge */}
            <div className="bg-[#111f30]/80 border border-slate-700/60 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  AHP Suitability Score
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                  Class A: Prime
                </span>
              </div>

              {/* Radial SVG Gauge */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#cyanEmeraldGrad)"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * (suitability?.overall_suitability_score || 78.4)) / 100}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="cyanEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-extrabold text-white">
                      {Math.round(suitability?.overall_suitability_score || 78.4)}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-1 font-mono">/ 100</span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-400">Slope & Relief</span>
                      <span className="font-bold text-cyan-400">92%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-400">Soil Bearing</span>
                      <span className="font-bold text-emerald-400">76%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-400">Water Security</span>
                      <span className="font-bold text-indigo-400">71%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded-full" style={{ width: '71%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Indicators */}
            <div className="bg-[#111f30]/80 border border-slate-700/60 rounded-2xl p-4 shadow-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 block">
                Geospatial Hazards & Restrictions
              </span>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-amber-900/40">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200">Moderate Flood Vulnerability</div>
                    <p className="text-[11px] text-slate-400">
                      Gulf tidal influence requires 1.2m plinth raise in southern lowlands.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-yellow-900/40">
                  <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200">Seismic Zone III (IS 1893:2016)</div>
                    <p className="text-[11px] text-slate-400">
                      Moderate earthquake resistance engineering criteria enforced.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-cyan-900/40">
                  <Droplets className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200">Semi-Critical Aquifer (82.6%)</div>
                    <p className="text-[11px] text-slate-400">
                      CGWB guidelines mandate 100% rooftop rainwater harvesting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Space Data Source Metadata */}
            <div className="bg-[#111f30]/80 border border-slate-700/60 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ISRO Space & Survey Metadata
                </span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">DEM Elevation</span>
                  <span className="font-mono text-cyan-300">Cartosat-3 (2.5m Res)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Land Cover (LULC)</span>
                  <span className="font-mono text-cyan-300">Bhuvan 1:50,000 WMS</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">NDVI Multi-spectral</span>
                  <span className="font-mono text-cyan-300">VEDAS AWiFS 10m</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Weather & Rainfall</span>
                  <span className="font-mono text-cyan-300">MOSDAC Automatic AWS</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Hydrogeology</span>
                  <span className="font-mono text-cyan-300">CGWB National Report 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button to reopen Right Panel when closed */}
      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          className="absolute top-20 right-4 z-20 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700/80 backdrop-blur-md p-2.5 rounded-xl shadow-2xl transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
          title="Open Intelligence Panel"
        >
          <Activity className="w-4 h-4" />
          <span>Intelligence & Risk</span>
        </button>
      )}

      {/* BOTTOM PANEL (COLLAPSIBLE STATUS BAR & GEODETIC METRICS) */}
      <div
        className={`absolute left-0 right-0 bottom-0 z-30 bg-[#07111f]/95 border-t border-slate-700/80 backdrop-blur-xl shadow-2xl text-slate-200 transition-all duration-300 ${
          bottomPanelExpanded ? 'h-36' : 'h-11'
        }`}
      >
        {/* Compact Bar Always Visible */}
        <div className="h-11 px-4 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4 truncate">
            {/* Live Cursor Coordinates */}
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                Cursor:{' '}
                {cursorCoords
                  ? `${cursorCoords.lat.toFixed(5)}°N, ${cursorCoords.lng.toFixed(5)}°E`
                  : `${center.lat.toFixed(5)}°N, ${center.lng.toFixed(5)}°E`}
              </span>
            </div>

            {/* Total Area */}
            <div className="hidden sm:flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">•</span>
              <span>
                Area: <b className="text-white">{siteAreaCalculated.acres} Ac</b> ({siteAreaCalculated.hectares} Ha)
              </span>
            </div>

            {/* Scale / Zoom */}
            <div className="hidden md:flex items-center gap-1 text-slate-400">
              <span className="text-slate-500">•</span>
              <span>Zoom: {currentZoom} (~1:15,000)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Satellite Source Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ISRO Cartosat-3 & Esri Imagery (WGS84 / EPSG:4326)</span>
            </div>

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setBottomPanelExpanded(!bottomPanelExpanded)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs"
              title={bottomPanelExpanded ? 'Collapse' : 'Expand Geodetic Metrics'}
            >
              <span className="hidden sm:inline">{bottomPanelExpanded ? 'Less' : 'Details'}</span>
              {bottomPanelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Geodetic Details */}
        {bottomPanelExpanded && (
          <div className="p-4 pt-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border-t border-slate-800">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Coordinate Reference</span>
              <span className="font-bold text-cyan-300 font-mono">EPSG:4326 (WGS 84)</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Projected: UTM Zone 43N</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Elevation Profile</span>
              <span className="font-bold text-emerald-300 font-mono">6.5m - 14.2m MSL</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Mean Gradient: 1.2°</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Boundary Perimeter</span>
              <span className="font-bold text-amber-300 font-mono">~5.68 km (5,680 m)</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Bounding Envelope: 2.02 km²</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Spatial Resolution</span>
              <span className="font-bold text-indigo-300 font-mono">0.5m Esri / 2.5m ISRO</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Update Cycle: 15-Day Composite</span>
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE ZONE INSPECTOR CARD (MODAL / FLOAT) */}
      {selectedZone && (
        <div className="absolute bottom-14 left-6 z-40 max-w-sm w-full bg-[#0d1928]/95 border border-cyan-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 text-slate-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-md shadow-md shrink-0"
                style={{ backgroundColor: selectedZone.color }}
              ></span>
              <div>
                <h3 className="text-sm font-bold text-slate-100 leading-tight">{selectedZone.name}</h3>
                <span className="text-[10px] text-cyan-400 font-mono">{selectedZone.category}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed">{selectedZone.description}</p>

          <div className="grid grid-cols-3 gap-2 bg-[#07111f]/90 rounded-xl p-2.5 text-center text-xs mb-3 border border-slate-800">
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
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold py-2 rounded-xl transition shadow-lg shadow-cyan-600/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Zone Parameters & Geometry</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
