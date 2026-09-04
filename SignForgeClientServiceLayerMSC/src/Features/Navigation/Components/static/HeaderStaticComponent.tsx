import React, { useState } from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NavigationCON from '../../Constants/NavigationCON';
import ApplicationRouteCON from '../../../../Constants/ApplicationRouteCON';
import ProfileDropdownStaticComponent from './ProfileDropdownStaticComponent';
import MobileNavigationDrawerStaticComponent from './MobileNavigationDrawerStaticComponent';
import ApplicationHapticsUtility from '../../../../Utilities/ApplicationHapticsUtility';
import { useOfferDocumentStore } from '../../../../Store/OfferDocumentStore';
import useAuthenticationStateStore from '../../../../Store/AuthenticationStateStore';
import PWAService from '../../../../Services/PWAService';
import weplmLogo from '@/src/Assets/weplm.jpeg';

export interface HeaderStaticComponentProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
  onOpenAuditLogs?: () => void;
}

export default function HeaderStaticComponent({
  currentView,
  onSelectView,
  onOpenAuditLogs,
}: HeaderStaticComponentProps): React.JSX.Element {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const user = useAuthenticationStateStore((s) => s.user);

  const displayName =
    user?.fullName ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'Enterprise User';
  const displayEmail = user?.email || '';

  const getInitials = (name: string, email: string): string => {
    if (name && name.trim() && name !== 'Enterprise User') {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'SF';
  };

  const userInitials = getInitials(displayName, displayEmail);
  const isStandalone = typeof window !== 'undefined' && PWAService.current.isStandalone();
  const isMainTab =
    currentView === ApplicationRouteCON.DOCUMENTS ||
    currentView === ApplicationRouteCON.CREATE_OFFER ||
    currentView === ApplicationRouteCON.UPLOAD_PDF;
  const showBackButton = isStandalone && !isMainTab;
  const { goBack } = useOfferDocumentStore();

  const handleNavClick = () => {
    if (showBackButton) {
      goBack();
    } else {
      onSelectView(ApplicationRouteCON.DOCUMENTS);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-black sm:bg-white/90 sm:dark:bg-black/90 sm:backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Insignia & Back Navigation 1:1 AssetSphere */}
        <div className="flex items-center gap-2.5 sm:gap-3 select-none shrink-0">
          <div className="w-10 h-10 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center relative">
            <AnimatePresence mode="wait" initial={false}>
              {!showBackButton ? (
                <motion.div
                  key="brand-logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onSelectView(ApplicationRouteCON.DOCUMENTS)}
                  className="w-10 h-10 sm:w-8 sm:h-8 cursor-pointer shrink-0"
                >
                  <img
                    src={weplmLogo}
                    alt="We.PLM Logo"
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-sm object-cover shrink-0 shadow-sm border border-slate-200/80 dark:border-zinc-800"
                  />
                </motion.div>
              ) : (
                <motion.button
                  key="back-button"
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                  onClick={goBack}
                  aria-label="Go back to previous page"
                  title="Go Back"
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-sm flex items-center justify-center text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/90 border border-slate-200/80 dark:border-zinc-700/80 shadow-xs cursor-pointer select-none transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div
            onClick={handleNavClick}
            className="flex flex-col justify-center cursor-pointer"
          >
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white font-serif-headline leading-tight">
              {NavigationCON.BRAND_TITLE}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 leading-none">
              {NavigationCON.BRAND_SUBTITLE}
            </p>
          </div>
        </div>

        {/* Right Clustered: Navigation Tabs + Profile Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Segmented Capsule Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-zinc-900/90 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            {NavigationCON.PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTopNavPill"
                      className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span
                    className={`relative z-10 flex items-center gap-2 ${
                      isActive
                        ? 'text-[#0C2086] dark:text-zinc-100 font-semibold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
          {/* 1:1 AssetSphere Profile Button */}
          <div className="relative">
            <button
              type="button"
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl sm:rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hairline-border hover:bg-slate-200 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer relative flex items-center justify-center select-none"
              title={`${displayName} - Profile & Settings`}
            >
              <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs sm:text-[10px] font-mono">
                {userInitials}
              </div>
            </button>

            {/* Profile Dropdown Popover */}
            <ProfileDropdownStaticComponent
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              onOpenAuditLogs={onOpenAuditLogs}
            />
          </div>

          {/* Mobile Menu Button (<768px) */}
          <button
            type="button"
            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            className="md:hidden h-10 w-10 sm:h-9 sm:w-9 rounded-xl sm:rounded-lg flex items-center justify-center p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 cursor-pointer"
          >
            <Menu className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileNavigationDrawerStaticComponent
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentView={currentView}
        onSelectView={onSelectView}
      />
    </header>
  );
}
