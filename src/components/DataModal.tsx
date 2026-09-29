import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import type { ActiveTab, PartnerTab } from '../types/pharmacy';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: ActiveTab;
  partnerTab?: PartnerTab;
  onSaveSales: (data: any) => void;
  onSaveCash: (data: any) => void;
  onSaveBank: (data: any) => void;
  onSavePartner: (partner: PartnerTab, data: any) => void;
}

export const DataModal: React.FC<DataModalProps> = ({
  isOpen,
  onClose,
  tab,
  partnerTab = 'ramakrishnan',
  onSaveSales,
  onSaveCash,
  onSaveBank,
  onSavePartner
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Form states
  const [date, setDate] = useState(today);
  const [particulars, setParticulars] = useState('');
  const [remarks, setRemarks] = useState('');

  // Sales specific fields
  const [computerSales, setComputerSales] = useState<number | ''>('');
  const [manualSales, setManualSales] = useState<number | ''>('');
  const [salesReturn, setSalesReturn] = useState<number | ''>('');
  const [cash, setCash] = useState<number | ''>('');
  const [upi, setUpi] = useState<number | ''>('');
  const [card, setCard] = useState<number | ''>('');
  const [charges, setCharges] = useState<number | ''>('');
  const [bankCredit, setBankCredit] = useState<number | ''>('');

  // Cash / Bank / Partner fields
  const [inward, setInward] = useState<number | ''>('');
  const [outward, setOutward] = useState<number | ''>('');

  // Bank fields
  const [invNo, setInvNo] = useState('');
  const [invDate, setInvDate] = useState(today);

  // Partner fields
  const [mopMor, setMopMor] = useState('Bank Transfer');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'sales') {
      onSaveSales({
        date,
        computerSales: Number(computerSales) || 0,
        manualSales: Number(manualSales) || 0,
        salesReturn: Number(salesReturn) || 0,
        cash: Number(cash) || 0,
        upi: Number(upi) || 0,
        card: Number(card) || 0,
        charges: Number(charges) || 0,
        bankCredit: Number(bankCredit) || 0,
        remarks
      });
    } else if (tab === 'cash') {
      onSaveCash({
        date,
        particulars,
        inward: Number(inward) || 0,
        outward: Number(outward) || 0,
        remarks
      });
    } else if (tab === 'bank') {
      onSaveBank({
        date,
        particulars,
        invNo,
        invDate,
        inward: Number(inward) || 0,
        outward: Number(outward) || 0,
        remarks
      });
    } else if (tab === 'partners') {
      onSavePartner(partnerTab, {
        date,
        particulars,
        inward: Number(inward) || 0,
        outward: Number(outward) || 0,
        mopMor,
        remarks
      });
    }
    onClose();
  };

  const getTitle = () => {
    if (tab === 'sales') return 'Add Daily Sales Entry';
    if (tab === 'cash') return 'Add Cash Register Transaction';
    if (tab === 'bank') return 'Add Bank Register Transaction';
    if (tab === 'partners') return `Add ${partnerTab === 'ramakrishnan' ? 'Ramakrishnan' : 'Saran'} Partner Entry`;
    return 'Add Entry';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg">{getTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {tab !== 'sales' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Particulars / Description</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Stock purchase / Collection"
                  value={particulars}
                  onChange={(e) => setParticulars(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Tab Specific Fields */}
          {tab === 'sales' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Computer Sales (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={computerSales}
                  onChange={(e) => setComputerSales(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Manual Sales (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={manualSales}
                  onChange={(e) => setManualSales(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sales Return (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={salesReturn}
                  onChange={(e) => setSalesReturn(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Cash Collection (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={cash}
                  onChange={(e) => setCash(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/40 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-700 uppercase mb-1">UPI Collection (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-amber-300 bg-amber-50/40 rounded-lg text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-700 uppercase mb-1">Card Collection (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={card}
                  onChange={(e) => setCard(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-blue-300 bg-blue-50/40 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 uppercase mb-1">POS Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={charges}
                  onChange={(e) => setCharges(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-rose-300 bg-rose-50/40 rounded-lg text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-700 uppercase mb-1">Bank Credit (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={bankCredit}
                  onChange={(e) => setBankCredit(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none font-semibold text-slate-900"
                />
              </div>
            </div>
          )}

          {tab === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Invoice No</label>
                <input
                  type="text"
                  placeholder="E.g., INV-8821"
                  value={invNo}
                  onChange={(e) => setInvNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {tab === 'partners' && (
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">MOP / MOR (Mode of Payment / Receipt)</label>
              <select
                value={mopMor}
                onChange={(e) => setMopMor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                <option value="Cash">Cash Handover</option>
                <option value="Cheque">Bank Cheque</option>
              </select>
            </div>
          )}

          {tab !== 'sales' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Inward (+) (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={inward}
                  onChange={(e) => setInward(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/40 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 uppercase mb-1">Outward (-) (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={outward}
                  onChange={(e) => setOutward(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-rose-300 bg-rose-50/40 rounded-lg text-sm focus:ring-2 focus:ring-rose-600 focus:outline-none font-semibold text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Remarks</label>
            <input
              type="text"
              placeholder="Notes or voucher details"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
