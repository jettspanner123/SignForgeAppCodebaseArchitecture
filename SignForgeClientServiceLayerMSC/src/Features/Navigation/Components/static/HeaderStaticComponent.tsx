import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import NavigationCON from '../../Constants/NavigationCON';
import ApplicationRouteCON from '../../../../Constants/ApplicationRouteCON';
import ProfileDropdownStaticComponent from './ProfileDropdownStaticComponent';
import MobileNavigationDrawerStaticComponent from './MobileNavigationDrawerStaticComponent';
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
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Insignia 1:1 AssetSphere */}
        <div
          onClick={() => onSelectView(ApplicationRouteCON.DOCUMENTS)}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0"
        >
          <img
            src={weplmLogo}
            alt="We.PLM Logo"
            className="w-8 h-8 rounded-sm object-cover shrink-0 shadow-sm border border-slate-200/80 dark:border-zinc-800"
          />
          <div className="hidden sm:block">
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-serif-headline leading-none">
              {NavigationCON.BRAND_TITLE}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
              {NavigationCON.BRAND_SUBTITLE}
            </p>
          </div>
        </div>

        {/* Right Clustered: Navigation Tabs + Profile Button */}
        <div className="flex items-center gap-3 shrink-0">
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
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none ${
                    isActive
                      ? 'bg-white dark:bg-zinc-800 text-[#0C2086] dark:text-zinc-100 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          {/* 1:1 AssetSphere Profile Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hairline-border hover:bg-slate-200 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer relative flex items-center justify-center select-none"
              title={`${user.name} - Profile & Settings`}
            >
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-[10px] font-mono">
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
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
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
