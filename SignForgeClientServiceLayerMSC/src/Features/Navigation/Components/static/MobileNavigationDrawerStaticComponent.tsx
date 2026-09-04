import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Smartphone, LogOut } from 'lucide-react';
import NavigationCON from '../../Constants/NavigationCON';
import PrimaryActionButtonSharedComponent from '../../../../Shared/Components/PrimaryActionButtonSharedComponent';
import ConfirmationModalSharedComponent from '../../../../Shared/Components/ConfirmationModalSharedComponent';
import PWAService from '../../../../Services/PWAService';
import ApplicationHapticsUtility from '../../../../Utilities/ApplicationHapticsUtility';
import LoginScreenService from '../../../LoginScreen/Services/LoginScreenService';
import useAuthenticationStateStore from '../../../../Store/AuthenticationStateStore';
import ApplicationRouteCON from '../../../../Constants/ApplicationRouteCON';
import weplmLogo from '@/src/Assets/weplm.jpeg';

export interface MobileNavigationDrawerStaticComponentProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onSelectView: (viewId: string) => void;
}

export default function MobileNavigationDrawerStaticComponent({
  isOpen,
  onClose,
  currentView,
  onSelectView,
}: MobileNavigationDrawerStaticComponentProps): React.JSX.Element | null {
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = PWAService.current.subscribe((installable) => {
      setCanInstall(installable);
    });
    return () => unsubscribe();
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleInstallApp = async () => {
    if (canInstall) {
      const installed = await PWAService.current.promptInstall();
      if (installed) {
        onClose();
      }
    } else {
      // Fallback instruction for iOS Safari / already installed
      alert(
        'To install SignForge on your phone:\n\n1. In Safari / Chrome, tap the Share or Menu button.\n2. Tap "Add to Home Screen".'
      );
    }
  };

  const handleInitiateSignOut = () => {
    onClose();
    setIsSignOutModalOpen(true);
  };

  const handleConfirmSignOut = () => {
    setIsSignOutModalOpen(false);
    LoginScreenService.current.clearSession();
    useAuthenticationStateStore.getState().clearAuth();
    const targetPath = ApplicationRouteCON.toPath(ApplicationRouteCON.LOGIN);
    window.history.replaceState(null, '', targetPath);
  };

  if (typeof document === 'undefined') return null;

  return (
    <React.Fragment>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[100] md:hidden flex flex-col justify-end">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              />

              {/* Drawer Sheet 1:1 AssetSphere */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full bg-white dark:bg-[#0c0c0e] border-t border-slate-200 dark:border-zinc-800 rounded-t-2xl shadow-2xl p-5 pb-10 sm:pb-6 space-y-4 max-h-[85vh] overflow-y-auto"
              >
                {/* Header 1:1 AssetSphere */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={weplmLogo}
                      alt="We.PLM Logo"
                      className="w-8 h-8 rounded-sm object-cover shrink-0 shadow-sm border border-slate-200/80 dark:border-zinc-800"
                    />
                    <div>
                      <h2 className="font-serif-headline font-bold text-slate-900 dark:text-zinc-100 text-sm leading-tight">
                        {NavigationCON.BRAND_TITLE}
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                        {NavigationCON.BRAND_SUBTITLE}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close navigation menu"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Items List (AssetSphere Aesthetics with Increased Touch Targets) */}
                <div className="space-y-2.5">
                  {NavigationCON.PRIMARY_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectView(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-100 dark:bg-zinc-800/90 border border-slate-300/80 dark:border-zinc-700 border-l-4 border-l-[#0C2086] dark:border-l-blue-500 shadow-xs'
                            : 'bg-slate-50/70 dark:bg-[#121215]/80 hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-800/80'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 border ${
                          isActive
                            ? 'bg-white dark:bg-zinc-800 text-[#0C2086] dark:text-blue-400 border-slate-200 dark:border-zinc-700 shadow-xs'
                            : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-bold font-serif-headline tracking-tight ${
                            isActive
                              ? 'text-[#0C2086] dark:text-white'
                              : 'text-slate-900 dark:text-zinc-100'
                          }`}>
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-xs text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Actions 1:1 AssetSphere */}
                <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-zinc-800/80">
                  {!PWAService.current.isStandalone() && (
                    <PrimaryActionButtonSharedComponent
                      label="Install SignForge App"
                      size="lg"
                      icon={<Smartphone className="w-4 h-4 !text-white" />}
                      className="w-full justify-center !h-11 text-xs font-bold shadow-md"
                      onClick={handleInstallApp}
                    />
                  )}

                  <button
                    type="button"
                    onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                    onClick={handleInitiateSignOut}
                    className="w-full flex items-center justify-center gap-2.5 p-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 transition-all cursor-pointer font-bold text-xs h-11"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of SignForge</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <ConfirmationModalSharedComponent
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        title="Sign Out of SignForge"
        subtitle="Enterprise Session Termination"
        description="Are you sure you want to sign out of your enterprise session? You will need to log back in to access your dashboard."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        maxWidth="md"
      />
    </React.Fragment>
  );
}
