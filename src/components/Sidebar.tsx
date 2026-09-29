import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Building2, 
  Users, 
  PieChart, 
  Cross, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import type { ActiveTab } from '../types/pharmacy';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Daily Sales', icon: Receipt },
    { id: 'cash', label: 'Cash Register', icon: Wallet },
    { id: 'bank', label: 'Bank Register', icon: Building2 },
    { id: 'partners', label: 'Partner Accounts', icon: Users },
    { id: 'analysis', label: 'Payment Analysis', icon: PieChart },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0f172a] text-white flex flex-col transition-all duration-300 border-r border-slate-800 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header Branding */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="bg-emerald-500 text-slate-950 p-2 rounded-lg flex items-center justify-center shrink-0">
            <Cross className="w-5 h-5 fill-current" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-bold text-lg text-white leading-tight tracking-wide">
                Saviour
              </h1>
              <p className="text-xs text-slate-400 font-medium">Pharmacy Dashboard</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1e293b] text-white border-l-4 border-emerald-500 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Pinned Bottom Box: Amber Reminder Card */}
      {!isCollapsed ? (
        <div className="p-3 m-3 bg-[#fef3c7] border border-[#fcd34d] rounded-xl text-[#92400e] text-xs shadow-sm flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="leading-snug">
            <span className="font-semibold block mb-0.5">Reminder:</span>
            Upload today's Excel sheet to keep reports up to date.
          </div>
        </div>
      ) : (
        <div className="p-3 text-center text-amber-400" title="Reminder: Upload today's Excel sheet">
          <AlertCircle className="w-6 h-6 mx-auto" />
        </div>
      )}
    </aside>
  );
};
