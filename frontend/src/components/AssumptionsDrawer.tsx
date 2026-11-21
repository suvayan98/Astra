import React from 'react';
import { X, RotateCcw, Sliders, Info, ShieldAlert } from 'lucide-react';
import { Assumptions } from '../types';
import { DEFAULT_ASSUMPTIONS } from '../data/mockData';

interface AssumptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assumptions: Assumptions;
  onUpdateAssumptions: (updated: Assumptions) => void;
}

export const AssumptionsDrawer: React.FC<AssumptionsDrawerProps> = ({
  isOpen,
  onClose,
  assumptions,
  onUpdateAssumptions,
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof Assumptions, value: number) => {
    onUpdateAssumptions({
      ...assumptions,
      [key]: value,
    });
  };

  const handleReset = () => {
    onUpdateAssumptions({ ...DEFAULT_ASSUMPTIONS });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Simulation Assumptions & Coefficients
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Default Disclaimer */}
        <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Illustrative Default Note:</strong> All baseline coefficients are pre-calibrated against CPHEEO Indian municipal engineering standards and CGWB water guidelines.
          </p>
        </div>

        {/* Scrollable Coefficients List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Water Demand Coefficients */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>Water Demand Calibration</span>
              <span className="text-[10px] text-blue-600 font-extrabold bg-blue-50 px-2.5 py-0.5 rounded-full">
                CPHEEO Standard
              </span>
            </h3>

            {/* lpcd */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-bold">Per Capita Consumption (lpcd)</label>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {assumptions.lpcd} L/capita/day
                </span>
              </div>
              <input
                type="range"
                min={90}
                max={200}
                step={5}
                value={assumptions.lpcd}
                onChange={(e) => handleChange('lpcd', Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Illustrative default: 135 lpcd</span>
            </div>

            {/* externalSupplyMLD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-bold">External Piped Canal Supply</label>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {assumptions.externalSupplyMLD} MLD
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={assumptions.externalSupplyMLD}
                onChange={(e) => handleChange('externalSupplyMLD', Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Illustrative default: 15.0 MLD allocation</span>
            </div>

            {/* catchmentMultiplier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-bold">Catchment Area Multiplier</label>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {assumptions.catchmentMultiplier}x
                </span>
              </div>
              <input
                type="range"
                min={1.0}
                max={6.0}
                step={0.5}
                value={assumptions.catchmentMultiplier}
                onChange={(e) => handleChange('catchmentMultiplier', Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Illustrative default: 3.0x site footprint</span>
            </div>
          </div>

          {/* Infrastructure Buffer Distances */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>Proximity & Service Buffers</span>
              <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                URDPFI Norms
              </span>
            </h3>

            {/* Road Buffer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-bold">Primary Arterial Road Buffer</label>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {assumptions.roadBufferM} m
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={15000}
                step={500}
                value={assumptions.roadBufferM}
                onChange={(e) => handleChange('roadBufferM', Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Illustrative default: 5,000 m (5.0 km)</span>
            </div>

            {/* Amenity Buffer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-bold">Hospital & Education Service Radius</label>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {assumptions.amenityBufferM} m
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={20000}
                step={500}
                value={assumptions.amenityBufferM}
                onChange={(e) => handleChange('amenityBufferM', Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Illustrative default: 7,500 m (7.5 km)</span>
            </div>

            {/* Substation Buffer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-bold">High-Voltage Substation Radius</label>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {assumptions.substationBufferM} m
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={25000}
                step={1000}
                value={assumptions.substationBufferM}
                onChange={(e) => handleChange('substationBufferM', Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
              />
              <span className="text-[10px] text-slate-400">Illustrative default: 10,000 m (10.0 km)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md shadow-blue-500/20 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
