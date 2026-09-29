import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Key
} from 'lucide-react';
import { GoogleSheetsService } from '../../services/googleSheets';
import { DataStore } from '../../services/dataStore';

interface DataSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const DataSettingsModal: React.FC<DataSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentConfig = GoogleSheetsService.getConfig();
  const [sheetUrl, setSheetUrl] = useState<string>(currentConfig.sheetUrl || '');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndSync = async () => {
    setIsTesting(true);
    setStatusMsg(null);

    try {
      GoogleSheetsService.saveConfig({
        sheetUrl,
        sheetId: sheetUrl,
      });

      if (sheetUrl.trim()) {
        await DataStore.refreshFromGoogleSheets();
        setStatusMsg({ type: 'success', text: 'Google Sheet connected and synced successfully!' });
        onSuccess('Google Sheet data synced!');
      } else {
        setStatusMsg({ type: 'success', text: 'Settings saved.' });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Unable to fetch data from Google Sheet. Please make sure the sheet is public or published to web as CSV.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetSample = () => {
    DataStore.resetToSampleData();
    setStatusMsg({ type: 'success', text: 'Data reset to default multi-year sample dataset.' });
    onSuccess('Data reset to sample dataset.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Data Settings & Integration</h3>
              <p className="text-xs text-slate-400">Configure Google Sheets or local data sources</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Alert */}
          {statusMsg && (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Google Sheet URL Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-emerald-400" />
              Google Sheet Web / Published CSV URL
            </label>
            <input
              type="text"
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <p className="text-[11px] text-slate-400">
              Paste your Google Sheet share link. Make sure access is set to <strong>"Anyone with the link can view"</strong> or published to Web as CSV.
            </p>
          </div>

          {/* Setup Instructions Card */}
          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Key className="h-4 w-4 text-indigo-400" />
              Environment Variables Setup (.env)
            </div>
            <p className="text-[11px] text-slate-400">
              For production secure server integration, configure your credentials in your project <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">.env</code> file:
            </p>
            <pre className="bg-slate-950 p-2.5 rounded-lg text-[10px] text-emerald-300 font-mono overflow-x-auto">
{`GOOGLE_SHEETS_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=pharmacy-service-account@gcp.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."`}
            </pre>
          </div>

          {/* Reset Option */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Reset Dataset</span>
              <span className="text-[11px] text-slate-400">Restore default multi-year pharmacy dataset</span>
            </div>
            <button
              onClick={handleResetSample}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Reset Sample</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={handleSaveAndSync}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Syncing...' : 'Save & Sync Sheet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
