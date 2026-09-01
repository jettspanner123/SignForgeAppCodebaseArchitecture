import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  X, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  role: 'ADMIN' | 'EXECUTIVE' | 'CANDIDATE';
  title: string;
  avatarUrl?: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const PRESET_USERS: UserProfile[] = [
  {
    name: 'Ananya Sharma',
    email: 'ananya.sharma@theweplm.com',
    role: 'ADMIN',
    title: 'VP of Human Capital & Admin Lead',
  },
  {
    name: 'Jean-Luc Dubois',
    email: 'jeanluc.dubois@theweplm.eu',
    role: 'EXECUTIVE',
    title: 'Chief Technology Officer & Executive Director',
  },
  {
    name: 'Candidate User',
    email: 'candidate@example.com',
    role: 'CANDIDATE',
    title: 'Candidate Signer Role',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'EXECUTIVE' | 'CANDIDATE'>('ADMIN');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    const user: UserProfile = {
      name: customEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      email: customEmail,
      role: selectedRole,
      title: selectedRole === 'ADMIN' ? 'Enterprise HR Admin' : selectedRole === 'EXECUTIVE' ? 'Executive Director' : 'Job Candidate',
    };
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Enterprise Identity & Access</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Executive Role-Based Authentication Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button in Login Modal */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle theme mode in login"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-amber-400">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-slate-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">Dark</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Current Active User Info */}
          {currentUser && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide">Active Account</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                    {currentUser.role}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{currentUser.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{currentUser.email} • {currentUser.title}</p>
              </div>
              <button
                onClick={() => {
                  onLogout();
                }}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* One-Click Demo Profiles */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              Instant One-Click Demo Personas
            </label>
            <div className="space-y-2.5">
              {PRESET_USERS.map((preset) => {
                const isActive = currentUser?.email === preset.email;
                return (
                  <button
                    key={preset.email}
                    onClick={() => {
                      onLogin(preset);
                      onClose();
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        preset.role === 'ADMIN' 
                          ? 'bg-blue-600 text-white'
                          : preset.role === 'EXECUTIVE'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {preset.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{preset.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            preset.role === 'ADMIN'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : preset.role === 'EXECUTIVE'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {preset.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{preset.title}</p>
                      </div>
                    </div>
                    {isActive ? (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 font-semibold">Or Custom Login</span>
            </div>
          </div>

          {/* Custom Credentials Login Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@theweplm.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Role Access
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ADMIN', 'EXECUTIVE', 'CANDIDATE'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedRole === r
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!customEmail}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors disabled:opacity-50 shadow-md mt-2"
            >
              Authenticate & Sign In
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
