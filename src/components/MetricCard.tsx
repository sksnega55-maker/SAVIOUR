import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface MetricCardProps {
  title: string;
  amount: number;
  subtitle: string;
  icon: LucideIcon;
  accentColor: 'emerald' | 'rose' | 'blue' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  accentColor,
}) => {
  const colorMap = {
    emerald: {
      border: 'border-l-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      text: 'text-emerald-600',
      pill: 'bg-emerald-100 text-emerald-800'
    },
    rose: {
      border: 'border-l-rose-500',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      text: 'text-rose-600',
      pill: 'bg-rose-100 text-rose-800'
    },
    blue: {
      border: 'border-l-blue-600',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      text: 'text-blue-600',
      pill: 'bg-blue-100 text-blue-800'
    },
    amber: {
      border: 'border-l-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      text: 'text-amber-600',
      pill: 'bg-amber-100 text-amber-800'
    },
  };

  const style = colorMap[accentColor];

  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${style.border} border-l-4 p-5 shadow-xs transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${style.text}`}>
          {formatINR(amount)}
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
