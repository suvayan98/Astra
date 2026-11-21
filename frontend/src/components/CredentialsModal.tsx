import React, { useState } from 'react';
import { Key, X, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { updateISROCredentials } from '../api';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({ isOpen, onClose, onUpdated }) => {
  if (!isOpen) return null;

  const [bhoonidhiKey, setBhoonidhiKey] = useState<string>('');
  const [bhuvanToken, setBhuvanToken] = useState<string>('');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateISROCredentials({
        bhoonidhi_api_key: bhoonidhiKey,
        bhuvan_token: bhuvanToken,
        demo_mode: demoMode ? 'true' : 'false'
      });
      setStatusMsg('Credentials successfully updated in backend session.');
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Error updating credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">ISRO Portal API Adapters</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm">✕</button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Bhoonidhi STAC API Key / Bearer Token
            </label>
            <input
              type="password"
              placeholder="Enter Bhoonidhi token (e.g. eyJhbGciOi...)"
              value={bhoonidhiKey}
              onChange={(e) => setBhoonidhiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Required for live Cartosat & LISS-IV STAC downloads from nrsc.gov.in
            </span>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Bhuvan Thematic Gateway Token
            </label>
            <input
              type="password"
              placeholder="Enter Bhuvan API token"
              value={bhuvanToken}
              onChange={(e) => setBhuvanToken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Demo Mode Toggle */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Verified Demo Cache Mode</span>
              <span className="text-[10px] text-slate-400">
                Uses official sample ISRO scenes when external API credentials are unconfigured.
              </span>
            </div>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>

          {statusMsg && (
            <div className="text-emerald-400 text-xs font-semibold">{statusMsg}</div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              Save Configuration
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
