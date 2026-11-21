import React, { useState, useEffect } from 'react';
import {
  X, Check, Sparkles, Building2, Trees, Droplets, Zap, ShieldAlert,
  ArrowRight, RefreshCw, Layers, Sliders, Info, Scale
} from 'lucide-react';
import { MasterPlanZone } from '../types';

interface EditZoneModalProps {
  zone: MasterPlanZone | null;
  onClose: () => void;
  onSave: (updated: Partial<MasterPlanZone>) => void;
  totalAreaAcres?: number;
}

export const CANONICAL_ZONE_TYPES = [
  { name: 'Residential', color: '#3b82f6', defaultFar: 2.2, category: 'Living & Working', desc: 'Transit-oriented mixed-use housing, multi-family apartments, active street frontages' },
  { name: 'Commercial', color: '#8b5cf6', defaultFar: 3.0, category: 'Living & Working', desc: 'Central business district, pedestrian retail plaza, co-working spaces, corporate hubs' },
  { name: 'Industrial Clean-Tech', color: '#64748b', defaultFar: 1.6, category: 'Living & Working', desc: 'Zero-emission light industrial, clean electronics, biotechnology labs, logistics micro-depot' },
  { name: 'Agricultural Agro-Forestry', color: '#84cc16', defaultFar: 0.05, category: 'Ecological & Blue-Green', desc: 'Community organic farms, orchard groves, permaculture belts, peri-urban food security' },
  { name: 'Parks & Green Belt', color: '#10b981', defaultFar: 0.05, category: 'Ecological & Blue-Green', desc: 'Continuous Miyawaki urban forest, wildlife migration corridors, active walking/biking loops' },
  { name: 'Water Bodies & RWH', color: '#06b6d4', defaultFar: 0.0, category: 'Ecological & Blue-Green', desc: 'Cascading retention lakes, unconfined aquifer recharge ponds, wetland bioswales' },
  { name: 'Roads & Transit Spine', color: '#f59e0b', defaultFar: 0.0, category: 'Mobility & Utilities', desc: 'Electric BRT boulevard, grade-separated cycle tracks, shaded permeable pedestrian walkways' },
  { name: 'Renewable Solar Farm', color: '#eab308', defaultFar: 0.0, category: 'Mobility & Utilities', desc: 'Utility-scale bifacial solar PV arrays, agro-voltaics, battery energy storage system (BESS)' },
  { name: 'Water Treatment DEWATS', color: '#0284c7', defaultFar: 0.4, category: 'Mobility & Utilities', desc: 'Decentralized wastewater treatment system, anaerobic baffled reactors, constructed wetlands' },
  { name: 'Solid Waste Recovery', color: '#d97706', defaultFar: 0.5, category: 'Mobility & Utilities', desc: 'Automated Material Recovery Facility (MRF), bio-methanation digester, circular composting' },
  { name: 'Hospitals & Emergency', color: '#ef4444', defaultFar: 1.8, category: 'Civic & Social', desc: 'Multi-specialty district hospital, trauma center, disaster command post, emergency helipad' },
  { name: 'Schools & Public Institutions', color: '#ec4899', defaultFar: 1.5, category: 'Civic & Social', desc: 'Integrated K-12 green school campus, vocational training institute, community civic center' }
];

export const EditZoneModal: React.FC<EditZoneModalProps> = ({
  zone,
  onClose,
  onSave,
  totalAreaAcres = 500
}) => {
  if (!zone) return null;

  const [name, setName] = useState<string>(zone.name);
  const [zoneType, setZoneType] = useState<string>(zone.zone_type || '');
  const [color, setColor] = useState<string>(zone.color || '#3b82f6');
  const [areaAcres, setAreaAcres] = useState<number>(zone.area_acres);
  const [farRatio, setFarRatio] = useState<number>(zone.far_ratio);
  const [capacity, setCapacity] = useState<number>(zone.target_capacity_people || 0);
  const [description, setDescription] = useState<string>(zone.description || '');
  const [permeablePct, setPermeablePct] = useState<number>(zone.permeable_surface_pct ?? 60);
  const [rooftopSolarPct, setRooftopSolarPct] = useState<number>(zone.rooftop_solar_pct ?? 50);

  // Synchronize when active zone changes
  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setZoneType(zone.zone_type || '');
      setColor(zone.color || '#3b82f6');
      setAreaAcres(zone.area_acres);
      setFarRatio(zone.far_ratio);
      setCapacity(zone.target_capacity_people || 0);
      setDescription(zone.description || '');
      setPermeablePct(zone.permeable_surface_pct ?? 60);
      setRooftopSolarPct(zone.rooftop_solar_pct ?? 50);
    }
  }, [zone]);

  // Handle Zone Type change & auto-populate standards
  const handleZoneTypeChange = (newType: string) => {
    setZoneType(newType);
    const preset = CANONICAL_ZONE_TYPES.find(t => t.name === newType);
    if (preset) {
      setColor(preset.color);
      if (farRatio === zone.far_ratio) {
        setFarRatio(preset.defaultFar);
      }
      if (!description || description === zone.description) {
        setDescription(preset.desc);
      }
    }
  };

  // Calculations
  const areaHectares = Number((areaAcres * 0.404686).toFixed(1));
  const areaPercentage = Number(((areaAcres / totalAreaAcres) * 100).toFixed(1));
  const builtUpAreaSqFt = Math.round(areaAcres * 43560 * farRatio);
  const builtUpAreaSqM = Math.round(areaHectares * 10000 * farRatio);

  // Auto-calculate capacity based on urban standards
  const handleAutoEstimateCapacity = () => {
    let est = 0;
    if (zoneType === 'Residential') {
      // ~250 sqft BUA per person in Indian urban standards
      est = Math.round(builtUpAreaSqFt / 250);
    } else if (zoneType === 'Commercial') {
      // ~150 sqft BUA per employee/job
      est = Math.round(builtUpAreaSqFt / 150);
    } else if (zoneType === 'Industrial Clean-Tech') {
      // ~400 sqft BUA per worker
      est = Math.round(builtUpAreaSqFt / 400);
    } else if (zoneType === 'Schools & Public Institutions') {
      est = Math.round(builtUpAreaSqFt / 100);
    } else if (zoneType === 'Hospitals & Emergency') {
      est = Math.round(builtUpAreaSqFt / 600);
    }
    setCapacity(est);
  };

  // Quick preset guideline loader
  const handleLoadSmartGuidelines = () => {
    const preset = CANONICAL_ZONE_TYPES.find(t => t.name === zoneType);
    if (preset) {
      setDescription(`${preset.desc}. Designed under National Building Code (NBC) 2016 & URDPFI standards with zero run-off hydrology.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      zone_type: zoneType,
      color,
      area_acres: Number(areaAcres),
      area_hectares: areaHectares,
      area_percentage: areaPercentage,
      far_ratio: Number(farRatio),
      target_capacity_people: Number(capacity),
      description,
      permeable_surface_pct: Number(permeablePct),
      rooftop_solar_pct: Number(rooftopSolarPct),
      built_up_area_sqft: builtUpAreaSqFt
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-lg shadow-md shrink-0 transition-colors"
              style={{ backgroundColor: color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Interactive Zone Editor</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {zoneType}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Modify zoning envelope, Floor Area Ratio (FAR), demographic capacity, and sustainability metrics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Zone Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Zone Custom Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
                placeholder="e.g. High-Density Mixed Residential Core"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Zoning Classification (12-Zone Standard)</label>
              <select
                value={zoneType}
                onChange={(e) => handleZoneTypeChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-400 font-semibold focus:outline-none focus:border-cyan-500"
              >
                {CANONICAL_ZONE_TYPES.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Color Palette Swatches */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>GIS Layer & Map Render Color</span>
              <span className="text-[10px] text-slate-400 font-mono">{color}</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              {CANONICAL_ZONE_TYPES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setColor(t.color)}
                  className={`w-6 h-6 rounded-md transition transform hover:scale-110 flex items-center justify-center ${
                    color === t.color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: t.color }}
                  title={`${t.name} (${t.color})`}
                >
                  {color === t.color && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer ml-auto"
                title="Custom color picker"
              />
            </div>
          </div>

          {/* Row 3: Area Allocation (Acres & Hectares) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Land Area Allocation</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">{areaAcres} Acres</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-semibold">{areaHectares} ha</span>
                <span className="text-slate-500">|</span>
                <span className="text-indigo-400 font-semibold">{areaPercentage}% of City</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div>
                <input
                  type="range"
                  min="0.5"
                  max={Math.min(totalAreaAcres * 0.8, 300)}
                  step="0.5"
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max={totalAreaAcres}
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(Math.max(0.5, Number(e.target.value)))}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-cyan-400 font-bold text-center focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-400 text-xs">Acres</span>

                {/* Quick Delta Chips */}
                <div className="flex items-center gap-1 ml-auto">
                  {[-5, -1, +1, +5].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => setAreaAcres(prev => Math.max(0.5, Number((prev + delta).toFixed(1))))}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-300"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Floor Area Ratio (FAR) & Built-up Area */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Floor Area Ratio (FAR) & Built-up Density</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold text-sm">FAR {farRatio.toFixed(1)}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300 text-[11px]">
                  BUA: <strong className="text-white">{(builtUpAreaSqFt / 1000).toLocaleString()}k</strong> sq ft ({(builtUpAreaSqM / 1000).toFixed(1)}k m²)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={farRatio}
                  onChange={(e) => setFarRatio(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="6.0"
                  value={farRatio}
                  onChange={(e) => setFarRatio(Math.max(0, Number(e.target.value)))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-indigo-400 font-bold text-center focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400">
                  {farRatio >= 3.0 ? 'High-density TOD core' : farRatio >= 1.5 ? 'Medium mid-rise' : farRatio > 0.2 ? 'Low-rise eco' : 'Open / Unbuilt'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 5: Demographic / Employment Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Target Capacity (Residents / Jobs)</label>
                <button
                  type="button"
                  onClick={handleAutoEstimateCapacity}
                  className="text-cyan-400 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Estimate
                </button>
              </div>
              <input
                type="number"
                min="0"
                step="50"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                placeholder="e.g. 14000 residents"
              />
            </div>

            {/* Environmental Specifications */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Permeable Surface Target: {permeablePct}%</span>
                <span className="text-slate-300 font-semibold">Rooftop Solar: {rooftopSolarPct}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={permeablePct}
                  onChange={(e) => setPermeablePct(Number(e.target.value))}
                  className="accent-emerald-400 cursor-pointer"
                  title={`Permeable Pavement / Natural Surface: ${permeablePct}%`}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={rooftopSolarPct}
                  onChange={(e) => setRooftopSolarPct(Number(e.target.value))}
                  className="accent-amber-400 cursor-pointer"
                  title={`Rooftop Solar Coverage Mandate: ${rooftopSolarPct}%`}
                />
              </div>
            </div>
          </div>

          {/* Row 6: Description & Planning Purpose */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Zoning Purpose & Infrastructure Role</label>
              <button
                type="button"
                onClick={handleLoadSmartGuidelines}
                className="text-indigo-400 hover:text-indigo-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Insert URDPFI Norms
              </button>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed text-xs"
              placeholder="Detail the urban planning role, allowable uses, building setbacks, and utilities connectivity..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Zone Modifications</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
