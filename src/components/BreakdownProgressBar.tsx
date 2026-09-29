import React from 'react';
import { formatINR } from '../utils/formatters';

export interface BreakdownSegment {
  label: string;
  amount: number;
  colorClass: string; // e.g. bg-emerald-500, bg-amber-500, bg-blue-600
  dotClass: string;
}

interface BreakdownCardProps {
  title: string;
  totalAmount: number;
  segments: BreakdownSegment[];
  totalLabel?: string;
}

export const BreakdownProgressBar: React.FC<BreakdownCardProps> = ({
  title,
  totalAmount,
  segments,
  totalLabel = 'Total'
}) => {
  const safeTotal = totalAmount > 0 ? totalAmount : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header Title */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-800 text-base">{title}</h4>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {totalLabel}: {formatINR(totalAmount)}
          </span>
        </div>

        {/* Proportional Segmented Progress Bar */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex my-4 p-0.5 border border-slate-200/60">
          {segments.map((seg, idx) => {
            const pct = Math.max(0, (seg.amount / safeTotal) * 100);
            if (pct <= 0) return null;
            return (
              <div
                key={idx}
                style={{ width: `${pct}%` }}
                className={`h-full ${seg.colorClass} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                title={`${seg.label}: ${formatINR(seg.amount)} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend & Breakdown List */}
        <div className="space-y-2.5 mt-4">
          {segments.map((seg, idx) => {
            const pct = totalAmount > 0 ? (seg.amount / safeTotal) * 100 : 0;
            return (
              <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-3 h-3 rounded-full ${seg.dotClass} shrink-0`} />
                  <span className="text-slate-600 font-medium">{seg.label}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-semibold w-12 text-right">
                    {pct.toFixed(1)}%
                  </span>
                  <span className="font-bold text-slate-900 w-28 text-right">
                    {formatINR(seg.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total Footer Row */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
        <span>{totalLabel}</span>
        <span className="text-emerald-600 font-extrabold text-base">
          {formatINR(totalAmount)}
        </span>
      </div>
    </div>
  );
};
