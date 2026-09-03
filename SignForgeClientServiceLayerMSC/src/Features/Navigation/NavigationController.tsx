import React from 'react';
import { motion } from 'motion/react';
import HeaderStaticComponent from './Components/static/HeaderStaticComponent';
import CandidateHeaderStaticComponent from './Components/static/CandidateHeaderStaticComponent';
import { useOfferDocumentStore } from '../../Store/OfferDocumentStore';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';

export interface NavigationControllerProps {
  children: React.ReactNode;
  onOpenAuditLogs?: () => void;
}

export default function NavigationController({
  children,
  onOpenAuditLogs,
}: NavigationControllerProps): React.JSX.Element {
  const { currentView, setCurrentView } = useOfferDocumentStore();
  const isCandidateView = currentView === ApplicationRouteCON.CANDIDATE_VIEW;

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-white dark:bg-black text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      {isCandidateView ? (
        <CandidateHeaderStaticComponent />
      ) : (
        <HeaderStaticComponent
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenAuditLogs={onOpenAuditLogs}
        />
      )}
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
