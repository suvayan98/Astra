import React, { useState } from 'react';
import { MasterPlanZone } from '../types';

interface EditZoneModalProps {
  zone: MasterPlanZone | null;
  onClose: () => void;
  onSave: (updated: Partial<MasterPlanZone>) => void;
}

export const EditZoneModal: React.FC<EditZoneModalProps> = ({ zone, onClose, onSave }) => {
  if (!zone) return null;

  const [zoneType, setZoneType] = useState<string>(zone.zone_type);
  const [areaAcres, setAreaAcres] = useState<number>(zone.area_acres);
  const [farRatio, setFarRatio] = useState<number>(zone.far_ratio);
  const [description, setDescription] = useState<string>(zone.description);

  const zoneTypes = [
    'Residential', 'Commercial', 'Industrial Clean-Tech', 'Agricultural Agro-Forestry',
    'Parks & Green Belt', 'Water Bodies & RWH', 'Roads & Transit Spine', 'Renewable Solar Farm',
    'Water Treatment DEWATS', 'Solid Waste Recovery', 'Hospitals & Emergency', 'Schools & Public Institutions'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      zone_type: zoneType,
      area_acres: Number(areaAcres),
      far_ratio: Number(farRatio),
      description: description
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: zone.color }}></span>
            <h3 className="text-base font-bold text-slate-100">Edit Zone: {zone.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Zoning Classification</label>
            <select
              value={zoneType}
              onChange={(e) => setZoneType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
            >
              {zoneTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Allocated Acres</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="300"
                value={areaAcres}
                onChange={(e) => setAreaAcres(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Floor Area Ratio (FAR)</label>
              <input
                type="number"
                step="0.1"
                min="0.0"
                max="5.0"
                value={farRatio}
                onChange={(e) => setFarRatio(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-indigo-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Zoning Description & Purpose</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-cyan-600/20"
            >
              Save Zone Modifications
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
