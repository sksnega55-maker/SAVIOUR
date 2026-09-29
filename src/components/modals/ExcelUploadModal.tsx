import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  Loader2
} from 'lucide-react';
import { ExcelImportService } from '../../services/excelImport';
import type { ImportResult } from '../../services/excelImport';
import { DataStore } from '../../services/dataStore';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const result = await ExcelImportService.parseFile(selectedFile);
      setImportResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process Excel file.');
      setImportResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!importResult) return;

    DataStore.importData(importResult.sales, importResult.expenses, replaceExisting);
    const totalCount = importResult.totalSalesCount + importResult.totalExpenseCount;
    onSuccess(`Data updated successfully! ${totalCount} records imported.`);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setErrorMsg(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Excel / CSV File</h3>
              <p className="text-xs text-slate-400">Import pharmacy sales or expense spreadsheets</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* File Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-800/40 hover:bg-slate-800/70 p-8 rounded-2xl text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-10 w-10 text-slate-400 group-hover:text-emerald-400 mx-auto transition-transform group-hover:scale-110" />
            <p className="mt-3 text-sm font-semibold text-white">
              {file ? file.name : 'Click to select or drag & drop file'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Supported formats: .xlsx, .xls, .csv
            </p>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2.5 p-4 bg-slate-800/60 rounded-xl text-xs text-emerald-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing columns and validating records…</span>
            </div>
          )}

          {/* Error display */}
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <span className="font-bold block">Import Error</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Import Result Preview */}
          {importResult && !isProcessing && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>File Parsed Successfully</span>
                  <span className="text-emerald-400 font-semibold">{importResult.filename}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 block">Sales Records</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {importResult.totalSalesCount} rows
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 block">Expense Records</span>
                    <span className="text-base font-extrabold text-indigo-400">
                      {importResult.totalExpenseCount} rows
                    </span>
                  </div>
                </div>
              </div>

              {/* Import options */}
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/50"
                />
                <span>Replace existing data completely (otherwise appends & skips duplicates)</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/80">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!importResult || isProcessing}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40"
          >
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
};
