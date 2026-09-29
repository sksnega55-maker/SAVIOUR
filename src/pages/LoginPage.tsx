import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { AuthService } from '../services/auth';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@saviourpharmacy.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotToast, setForgotToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = AuthService.login(email, password);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess();
        navigate('/');
      } else {
        setError(res.error || 'Login failed.');
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setEmail('admin@saviourpharmacy.com');
    setPassword('admin123');
    setError('');
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotToast(true);
    setTimeout(() => setForgotToast(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/60 via-teal-50/40 to-transparent pointer-events-none rounded-b-full blur-2xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />

      {forgotToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <KeyRound className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Demo Password Reset link sent! Use default credentials: admin123</span>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-10 relative z-10 transition-all">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-100 transform hover:scale-105 transition-transform duration-300">
            <Pill className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Saviour Pharmacy
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
              Owner Portal
            </p>
          </div>
        </div>

        <div 
          onClick={handleQuickFill}
          className="mt-6 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-100/70 transition-all cursor-pointer group flex items-center justify-between"
          title="Click to auto-fill demo credentials"
        >
          <div className="flex items-center space-x-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">Demo Quick-Fill Credentials</span>
              <span className="text-xs font-mono font-semibold text-emerald-950">admin@saviourpharmacy.com / admin123</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">Auto-fill →</span>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@saviourpharmacy.com"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="font-semibold text-slate-600">Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 group cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Authenticating…</span>
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Encrypted Session • Saviour Pharmacy Management System</span>
        </div>
      </div>
    </div>
  );
};
