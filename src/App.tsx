import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthService } from './services/auth';
import { DataStore } from './services/dataStore';
import { SheetService } from './services/sheetService';
import { GoogleSheetsService } from './services/googleSheets';
import type { FullGoogleSheetsConfig } from './services/googleSheets';

import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { DashboardView } from './pages/DashboardView';
import { DailySales } from './pages/DailySales';
import { SalesView } from './pages/SalesView';
import { CashView } from './pages/CashView';
import { BankView } from './pages/BankView';
import { MonthlyReport } from './pages/MonthlyReport';
import { YearlyReport } from './pages/YearlyReport';
import { PaymentAnalysis } from './pages/PaymentAnalysis';

import { GoogleSheetsConnectModal } from './components/modals/GoogleSheetsConnectModal';
import { AddRecordModal } from './components/modals/AddRecordModal';

import { CheckCircle2 } from 'lucide-react';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Main App Layout Wrapper
const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  // Filters state (Default September 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 = September (0-indexed)

  // Layout states
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Data Sync & Config state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [sheetConfig, setSheetConfig] = useState<FullGoogleSheetsConfig>(GoogleSheetsService.getFullConfig());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(DataStore.getLastSyncedTimestamp());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Version counter to trigger re-renders on DataStore update
  const [, setVer] = useState(0);
  useEffect(() => {
    const unsubscribe = DataStore.subscribe(() => {
      setVer((v) => v + 1);
      setLastSyncedAt(DataStore.getLastSyncedTimestamp());
      setSheetConfig(GoogleSheetsService.getFullConfig());
    });
    return unsubscribe;
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      if (sheetConfig.sheetUrl || sheetConfig.sheetId) {
        await DataStore.refreshFromGoogleSheets();
        showToast('Live Google Sheets data synced!');
      } else {
        DataStore.setLastSyncedTimestamp();
        setLastSyncedAt(DataStore.getLastSyncedTimestamp());
        showToast('Dashboard data refreshed!');
      }
    } catch (e: any) {
      showToast(e.message || 'Refresh completed with local cache.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    showToast('Logged out successfully.');
    navigate('/login');
  };

  // Data fetching
  const salesRecords = DataStore.getSales();
  const expenseRecords = DataStore.getExpenses();

  const pharmacySales = SheetService.getSales(selectedYear, selectedMonth);
  const salesSummary = SheetService.getSalesSummary(selectedYear, selectedMonth);

  const cashRecords = SheetService.getCash(selectedYear, selectedMonth);
  const cashSummary = SheetService.getCashSummary(selectedYear, selectedMonth);

  const bankRecords = SheetService.getBank(selectedYear, selectedMonth);
  const bankSummary = SheetService.getBankSummary(selectedYear, selectedMonth);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl shadow-emerald-600/30 border border-emerald-400 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Collapsible Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        sheetConfig={sheetConfig}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <Header
          isSyncing={isSyncing}
          onRefresh={handleRefresh}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          sheetConfig={sheetConfig}
          lastSyncedAt={lastSyncedAt}
          onLogout={handleLogout}
        />

        {/* View Page Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardView
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  sheetConfig={sheetConfig}
                  isSyncing={isSyncing}
                />
              }
            />

            <Route
              path="/daily-sales"
              element={
                <DailySales
                  salesRecords={salesRecords}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                />
              }
            />

            <Route
              path="/sales"
              element={
                <SalesView
                  records={pharmacySales}
                  summary={salesSummary}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              }
            />

            <Route
              path="/cash"
              element={
                <CashView
                  records={cashRecords}
                  summary={cashSummary}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  searchQuery=""
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              }
            />

            <Route
              path="/bank"
              element={
                <BankView
                  records={bankRecords}
                  summary={bankSummary}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  searchQuery=""
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              }
            />

            <Route
              path="/monthly-report"
              element={
                <MonthlyReport
                  salesRecords={salesRecords}
                  expenseRecords={expenseRecords}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                />
              }
            />

            <Route
              path="/yearly-report"
              element={
                <YearlyReport
                  salesRecords={salesRecords}
                  expenseRecords={expenseRecords}
                />
              }
            />

            <Route
              path="/payment-analysis"
              element={
                <PaymentAnalysis
                  salesRecords={salesRecords}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                />
              }
            />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Modals */}
      <GoogleSheetsConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={() => {}} />}
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
