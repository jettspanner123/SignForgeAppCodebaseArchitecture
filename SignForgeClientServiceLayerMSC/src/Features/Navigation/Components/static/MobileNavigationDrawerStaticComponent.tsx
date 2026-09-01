import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import NavigationCON from '../../Constants/NavigationCON';
import PrimaryActionButtonSharedComponent from '../../../../Shared/Components/PrimaryActionButtonSharedComponent';
import ApplicationRouteCON from '../../../../Constants/ApplicationRouteCON';
import weplmLogo from '../../../../assets/weplm.jpeg';

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
}: MobileNavigationDrawerStaticComponentProps): React.JSX.Element {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full bg-white dark:bg-[#0c0c0e] border-t border-slate-200 dark:border-zinc-800 rounded-t-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Items */}
            <div className="space-y-1.5">
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
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0C2086] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold">{item.label}</div>
                      {item.description && (
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <div className="pt-2">
              <PrimaryActionButtonSharedComponent
                label="Create Offer"
                size="md"
                className="w-full justify-center"
                onClick={() => {
                  onSelectView(ApplicationRouteCON.CREATE_OFFER);
                  onClose();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
