import React from 'react';
import { FileText, Plus, Upload, Shield, RotateCcw } from 'lucide-react';
import { useOfferDocumentStore } from '../../Store/OfferDocumentStore';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';
import ThemeToggleSharedComponent from './ThemeToggleSharedComponent';
import ButtonSharedComponent from './ButtonSharedComponent';

export interface HeaderSharedComponentProps {
  onOpenAuditModal?: () => void;
}

export default function HeaderSharedComponent({ onOpenAuditModal }: HeaderSharedComponentProps) {
  const { currentView, setCurrentView, resetToSampleData } = useOfferDocumentStore();

  const navItems = [
    {
      id: ApplicationRouteCON.DOCUMENTS,
      label: 'Document Inventory',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: ApplicationRouteCON.CREATE_OFFER,
      label: 'Offer Builder',
      icon: <Plus className="w-4 h-4" />
    },
    {
      id: ApplicationRouteCON.UPLOAD_PDF,
      label: 'Upload Custom PDF',
      icon: <Upload className="w-4 h-4" />
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Insignia */}
        <div 
          onClick={() => setCurrentView(ApplicationRouteCON.DOCUMENTS)}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl !bg-[#0C2086] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="font-serif-headline text-white font-bold text-lg leading-none tracking-tight">
              W
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-headline font-bold text-base sm:text-lg text-slate-950 dark:text-zinc-100 tracking-tight">
                We.SignForge
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#0C2086] dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/40">
                Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              AssetSphere Signing Canvas
            </p>
          </div>
        </div>

        {/* Navigation Tabs Center */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-zinc-900/90 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-[#0C2086] dark:text-zinc-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions Cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenAuditModal && (
            <button
              onClick={onOpenAuditModal}
              title="Audit Logs"
              className="p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 cursor-pointer transition-colors"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={resetToSampleData}
            title="Reset to Sample Offer Documents"
            className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <ThemeToggleSharedComponent />

          <ButtonSharedComponent
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setCurrentView(ApplicationRouteCON.CREATE_OFFER)}
          >
            Create Offer
          </ButtonSharedComponent>
        </div>
      </div>
    </header>
  );
}
