import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { DataStore } from '../../services/dataStore';
import type { ExpenseCategory } from '../../types/sales';
import { getTodayISO } from '../../utils/date';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [recordType, setRecordType] = useState<'sales' | 'expense'>('sales');
  
  // Sales state
  const [date, setDate] = useState<string>(getTodayISO());
  const [invoiceNo, setInvoiceNo] = useState<string>(`INV-${Math.floor(10000 + Math.random() * 90000)}`);
  const [cash, setCash] = useState<string>('');
  const [upi, setUpi] = useState<string>('');
  const [card, setCard] = useState<string>('');
  const [salesReturn, setSalesReturn] = useState<string>('');
  const [costOfGoods, setCostOfGoods] = useState<string>('');

  // Expense state
  const [category, setCategory] = useState<ExpenseCategory>('Supplier Payments');
  const [description, setDescription] = useState<string>('');
  const [cashExpense, setCashExpense] = useState<string>('');
  const [upiExpense, setUpiExpense] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (recordType === 'sales') {
      const c = parseFloat(cash) || 0;
      const u = parseFloat(upi) || 0;
      const cd = parseFloat(card) || 0;
      const ret = parseFloat(salesReturn) || 0;
      const cogs = parseFloat(costOfGoods) || undefined;
      const totalSales = Math.max(0, c + u + cd - ret);

      DataStore.addSalesRecord({
        date,
        invoiceNo,
        cash: c,
        upi: u,
        card: cd,
        salesReturn: ret,
        totalSales,
        cashSales: c,
        upiSales: u,
        cardSales: cd,
        returns: ret,
        netSales: totalSales,
        costOfGoods: cogs,
      });

      onSuccess('Daily sales record added successfully!');
    } else {
      const ce = parseFloat(cashExpense) || 0;
      const ue = parseFloat(upiExpense) || 0;
      const totalExpense = ce + ue;

      DataStore.addExpenseRecord({
        date,
        category,
        description: description || category,
        cashExpense: ce,
        upiExpense: ue,
        totalExpense,
        paymentType: ce > ue ? 'Cash' : 'Online',
        amount: totalExpense,
      });

      onSuccess('Expense record added successfully!');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Add New Record</h3>
              <p className="text-xs font-semibold text-slate-500">Insert daily transaction or expense</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Record Type Toggle */}
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-center">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 w-full max-w-xs">
            <button
              type="button"
              onClick={() => setRecordType('sales')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                recordType === 'sales' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales Entry
            </button>
            <button
              type="button"
              onClick={() => setRecordType('expense')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                recordType === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense Entry
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {recordType === 'sales' ? (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Invoice / Bill No.</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {['Supplier Payments', 'Salaries', 'Rent', 'Utilities', 'Miscellaneous', 'Donations', 'Card Charges'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {recordType === 'sales' ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-amber-700 block mb-1">Cash (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-indigo-700 block mb-1">UPI (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-700 block mb-1">Card (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-rose-700 block mb-1">Sales Return (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={salesReturn}
                    onChange={(e) => setSalesReturn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Cost of Goods (Optional ₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={costOfGoods}
                    onChange={(e) => setCostOfGoods(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description / Particulars</label>
                <input
                  type="text"
                  placeholder="e.g. Stock Purchase Batch #489"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-amber-700 block mb-1">Cash Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cashExpense}
                    onChange={(e) => setCashExpense(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-indigo-700 block mb-1">UPI Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={upiExpense}
                    onChange={(e) => setUpiExpense(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </>
          )}

          <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
