import React, { useState } from 'react';
import { X, Copy, Check, FileSpreadsheet, Link, Upload, Code } from 'lucide-react';
import { SheetService } from '../services/sheetService';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const currentConfig = SheetService.getConfig();
  const [webAppUrl, setWebAppUrl] = useState(currentConfig.webAppUrl);
  const [copied, setCopied] = useState(false);
  const [selectedImportTab, setSelectedImportTab] = useState('sales');

  if (!isOpen) return null;

  const sampleAppsScript = `// --- GOOGLE APPS SCRIPT FOR SAVIOUR PHARMACY ---
// Paste this code into Extensions -> Apps Script in your Google Sheet.
// Click Deploy -> New Deployment -> Select 'Web App' -> Access: 'Anyone'.

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var salesSheet = ss.getSheetByName("Sales");
  var cashSheet = ss.getSheetByName("Cash");
  var bankSheet = ss.getSheetByName("Bank");
  var ramSheet = ss.getSheetByName("Ramakrishnan");
  var saranSheet = ss.getSheetByName("Saran");

  var data = {
    sales: salesSheet ? parseSales(salesSheet.getDataRange().getValues()) : [],
    cash: cashSheet ? parseCash(cashSheet.getDataRange().getValues()) : [],
    bank: bankSheet ? parseBank(bankSheet.getDataRange().getValues()) : [],
    ramakrishnan: ramSheet ? parsePartner(ramSheet.getDataRange().getValues()) : [],
    saran: saranSheet ? parsePartner(saranSheet.getDataRange().getValues()) : []
  };

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseSales(rows) {
  var records = [];
  for (var i = 2; i < rows.length; i++) { // Skip Row 1 Totals & Row 2 Headers
    var r = rows[i];
    if (!r[0] && !r[1]) continue;
    records.push({
      slNo: r[0], date: formatDate(r[1]), computerSales: Number(r[2])||0,
      manualSales: Number(r[3])||0, difference1: Number(r[4])||0, salesReturn: Number(r[5])||0,
      netSales: Number(r[6])||0, cash: Number(r[7])||0, upi: Number(r[8])||0, card: Number(r[9])||0,
      charges: Number(r[10])||0, bankCredit: Number(r[11])||0, difference2: Number(r[12])||0, remarks: r[13]||''
    });
  }
  return records;
}

function formatDate(d) {
  if (d instanceof Date) return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return String(d);
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(sampleAppsScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveUrl = () => {
    SheetService.updateConfig({ webAppUrl });
    onConfigSaved();
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        SheetService.importTabFromCSV(selectedImportTab, content);
        onConfigSaved();
        alert(`Successfully imported ${selectedImportTab} sheet data!`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg">Google Sheets Direct Integration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Web App URL Config */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2 mb-2">
              <Link className="w-4 h-4 text-emerald-600" />
              <span>Google Apps Script Web App Endpoint</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Paste your Google Apps Script Web App URL below to connect the dashboard directly to your live Google Sheet.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
              <button
                onClick={handleSaveUrl}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Save Endpoint
              </button>
            </div>
          </div>

          {/* Copyable Google Apps Script Snippet */}
          <div className="bg-slate-900 rounded-xl p-4 text-slate-200 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4" /> Google Apps Script Code
              </span>
              <button
                onClick={handleCopyScript}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg text-xs font-mono overflow-x-auto text-slate-300 max-h-48 border border-slate-800">
              {sampleAppsScript}
            </pre>
          </div>

          {/* Excel / CSV Direct File Import */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2 mb-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Import Excel / CSV Sheet Data</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Directly upload your offline Excel exported CSV file to update any of the 5 tabs instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedImportTab}
                onChange={(e) => setSelectedImportTab(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 cursor-pointer"
              >
                <option value="sales">Tab 1: Sales Sheet</option>
                <option value="cash">Tab 2: Cash Register Sheet</option>
                <option value="bank">Tab 3: Bank Register Sheet</option>
                <option value="ramakrishnan">Tab 4: Ramakrishnan Sheet</option>
                <option value="saran">Tab 5: Saran Sheet</option>
              </select>
              <label className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Choose CSV File to Import</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
