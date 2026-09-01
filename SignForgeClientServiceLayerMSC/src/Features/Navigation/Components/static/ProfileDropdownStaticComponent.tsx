import UserPreferencesUtility from '../../../../Utilities/UserPreferencesUtility';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Mail,
  Sun,
  Moon,
  RotateCcw,
  Trash2,
  LogOut,
  FileText
} from 'lucide-react';
import ApplicationThemeCON from '../../../../Constants/ApplicationThemeCON';
import ApplicationThemeUtility from '../../../../Utilities/ApplicationThemeUtility';
import { useOfferDocumentStore } from '../../../../Store/OfferDocumentStore';
import NavigationCON from '../../Constants/NavigationCON';
import ConfirmationModalSharedComponent from '../../../../Shared/Components/ConfirmationModalSharedComponent';

export interface ProfileDropdownStaticComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuditLogs?: () => void;
}

export default function ProfileDropdownStaticComponent({
  isOpen,
  onClose,
  onOpenAuditLogs,
}: ProfileDropdownStaticComponentProps): React.JSX.Element {
  const { theme, toggleTheme, resetToSampleData, documents } = useOfferDocumentStore();
  const isDark = theme === ApplicationThemeCON.DARK;
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [deploymentMode, setDeploymentMode] = useState<'Self-Hosted Air-Gapped' | 'Enterprise Cloud Sync'>('Enterprise Cloud Sync');
  const isSelfHosted = deploymentMode === 'Self-Hosted Air-Gapped';

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const user = NavigationCON.DEFAULT_USER;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, onClose]);

  const handleClearAll = () => {
    try {
      localStorage.removeItem('signcorp_documents');
      UserPreferencesUtility.current.clearAllPreferences();
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Full Screen Transparent Backdrop Overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 z-40 bg-transparent cursor-default pointer-events-auto"
          />

          {/* Clean Executive Profile Popover 1:1 AssetSphere */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-80 z-50 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 text-xs select-none space-y-4"
          >
            {/* 1. Header: User Identity */}
            <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold font-serif-headline text-sm shadow-xs shrink-0">
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white font-serif-headline text-sm truncate leading-tight">
                  {user.name}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5 font-mono">
                  {user.role} • People Operations
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                  <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            {/* 2. Preferences & Controls */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 dark:text-zinc-500 block px-1">
                Preferences & Controls
              </span>

              {/* Theme Mode Control Block */}
              <div className="space-y-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-200 font-medium">
                  {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>Theme Mode</span>
                </div>

                <div className="flex items-center p-1 rounded-lg bg-slate-200/80 dark:bg-zinc-800 border border-slate-300/60 dark:border-zinc-700/60 h-8 w-full">
                  <button
                    type="button"
                    onClick={(e) =>
                      isDark &&
                      ApplicationThemeUtility.current.executeAnimatedThemeToggle(
                        e.currentTarget,
                        toggleTheme
                      )
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 h-6 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      !isDark
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Light Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) =>
                      !isDark &&
                      ApplicationThemeUtility.current.executeAnimatedThemeToggle(
                        e.currentTarget,
                        toggleTheme
                      )
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 h-6 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      isDark
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>

              {/* Deployment Environment Control Block */}
              <div className="space-y-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-200 font-medium">
                  <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Deployment Environment</span>
                </div>

                <div className="flex items-center p-1 rounded-lg bg-slate-200/80 dark:bg-zinc-800 border border-slate-300/60 dark:border-zinc-700/60 h-8 w-full">
                  <button
                    type="button"
                    onClick={() => !isSelfHosted && setDeploymentMode('Self-Hosted Air-Gapped')}
                    className={`flex-1 py-1 h-6 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
                      isSelfHosted
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Air-Gapped
                  </button>
                  <button
                    type="button"
                    onClick={() => isSelfHosted && setDeploymentMode('Enterprise Cloud Sync')}
                    className={`flex-1 py-1 h-6 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
                      !isSelfHosted
                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Cloud Sync
                  </button>
                </div>
              </div>

              {/* Reset Sample Documents */}
              <button
                type="button"
                onClick={() => {
                  resetToSampleData();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700/60 transition-all cursor-pointer font-medium text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Reset Sample Documents</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-zinc-400">4 Active</span>
              </button>

              {/* Clear LocalStorage Control Block */}
              <button
                type="button"
                onClick={() => {
                  setIsClearModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer font-medium text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Clear Local Storage</span>
                </div>
                <span className="text-[10px] font-mono font-semibold uppercase">Purge All</span>
              </button>
            </div>

            {/* 3. Quick Action Links */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              {onOpenAuditLogs && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuditLogs();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors font-medium cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>System Audit Logs</span>
                </button>
              )}
            </div>

            {/* 4. Footer: Sign Out */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>

          {/* Confirmation Modal for Clearing All Documents */}
          <ConfirmationModalSharedComponent
            isOpen={isClearModalOpen}
            onClose={() => setIsClearModalOpen(false)}
            onConfirm={handleClearAll}
            title="Clear All Local Documents?"
            subtitle="Permanent local storage purge"
            description="Are you sure you want to delete all offer letters and local signatures? This action cannot be undone."
            confirmText="Clear All Data"
            cancelText="Keep Documents"
            variant="danger"
          />
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
