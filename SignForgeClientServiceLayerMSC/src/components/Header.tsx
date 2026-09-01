import React from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  UserCheck, 
  PlusCircle, 
  Server, 
  Layers,
  Search,
  Moon,
  Sun,
  User,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from './LoginModal';
import { WePlmLogo } from './WePlmLogo';

interface HeaderProps {
  currentView: 'DOCUMENTS' | 'CREATE_OFFER' | 'CANDIDATE_VIEW' | 'HR_COUNTERSIGN' | 'VERCEL_GUIDE';
  setCurrentView: (view: 'DOCUMENTS' | 'CREATE_OFFER' | 'CANDIDATE_VIEW' | 'HR_COUNTERSIGN' | 'VERCEL_GUIDE') => void;
  activeDocTitle?: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalDocs: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  totalDocs,
  theme,
  onToggleTheme,
  currentUser,
  onOpenLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className={`flex items-center space-x-3 ${currentUser ? 'cursor-pointer' : ''}`} 
            onClick={() => {
              if (currentUser) setCurrentView('DOCUMENTS');
            }}
          >
            <WePlmLogo className="h-8 w-auto shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">SignForge</span>
                {(!currentUser && currentView === 'CANDIDATE_VIEW') ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    CANDIDATE PORTAL
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    ENTERPRISE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar (When on Document List) */}
          {currentView === 'DOCUMENTS' && currentUser && (
            <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidates or offer ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          )}

          {/* Navigation & Admin Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* Show full HR navigation ONLY if logged in or not in candidate-only view */}
            {(currentUser || currentView !== 'CANDIDATE_VIEW') ? (
              <>
                <button
                  id="nav-btn-documents"
                  onClick={() => setCurrentView('DOCUMENTS')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === 'DOCUMENTS'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Dashboard ({totalDocs})</span>
                </button>

                <button
                  id="nav-btn-create"
                  onClick={() => setCurrentView('CREATE_OFFER')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === 'CREATE_OFFER'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="hidden sm:inline">New Offer</span>
                </button>

                {/* Candidate Portal Nav */}
                <button
                  id="nav-btn-candidate"
                  onClick={() => setCurrentView('CANDIDATE_VIEW')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === 'CANDIDATE_VIEW'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800'
                  }`}
                  title="Switch to Candidate Portal View"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Candidate Portal</span>
                  <span className="lg:hidden">Candidate</span>
                </button>

                {/* HR Sign Nav */}
                <button
                  id="nav-btn-hrcountersign"
                  onClick={() => setCurrentView('HR_COUNTERSIGN')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === 'HR_COUNTERSIGN'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800'
                  }`}
                  title="Switch to HR Counter-Sign Portal"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">HR Counter-Sign</span>
                  <span className="lg:hidden">HR Sign</span>
                </button>
              </>
            ) : (
              /* Isolated Candidate Portal Header Indicator */
              <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-xs">
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Candidate eSign Portal</span>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-400 hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-700 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Login / Profile Button */}
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
              title={currentUser ? "Admin Profile Settings" : "HR Staff Admin Login"}
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">{currentUser ? currentUser.name.split(' ')[0] : 'HR Staff Login'}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-500 text-white font-extrabold ml-1">
                {currentUser?.role || 'LOGIN'}
              </span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
