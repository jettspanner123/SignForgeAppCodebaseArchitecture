import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { motion } from 'motion/react';
import NavigationCON from '../../Constants/NavigationCON';
import ApplicationRouteCON from '../../../../Constants/ApplicationRouteCON';
import ProfileDropdownStaticComponent from './ProfileDropdownStaticComponent';
import MobileNavigationDrawerStaticComponent from './MobileNavigationDrawerStaticComponent';
import { triggerHapticFeedback } from '../../../../utils/haptics';
import weplmLogo from '../../../../assets/weplm.jpeg';

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
  const user = NavigationCON.DEFAULT_USER;

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-black sm:bg-white/90 sm:dark:bg-black/90 sm:backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Insignia 1:1 AssetSphere */}
        <div
          onClick={() => onSelectView(ApplicationRouteCON.DOCUMENTS)}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none shrink-0"
        >
          <img
            src={weplmLogo}
            alt="We.PLM Logo"
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-sm object-cover shrink-0 shadow-sm border border-slate-200/80 dark:border-zinc-800"
          />
          <div className="flex flex-col justify-center">
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
              onPointerDown={() => triggerHapticFeedback(12)}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl sm:rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hairline-border hover:bg-slate-200 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer relative flex items-center justify-center select-none"
              title={`${user.name} - Profile & Settings`}
            >
              <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs sm:text-[10px] font-mono">
                {user.initials}
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
            onPointerDown={() => triggerHapticFeedback(12)}
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
