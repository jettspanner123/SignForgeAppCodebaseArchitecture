import React from 'react';
import { motion } from 'motion/react';
import HeaderStaticComponent from './Components/static/HeaderStaticComponent';
import { useOfferDocumentStore } from '../../Store/OfferDocumentStore';

export interface NavigationControllerProps {
  children: React.ReactNode;
  onOpenAuditLogs?: () => void;
}

export default function NavigationController({
  children,
  onOpenAuditLogs,
}: NavigationControllerProps): React.JSX.Element {
  const { currentView, setCurrentView } = useOfferDocumentStore();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <HeaderStaticComponent
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenAuditLogs={onOpenAuditLogs}
      />
      <main className="flex-1 w-full">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
