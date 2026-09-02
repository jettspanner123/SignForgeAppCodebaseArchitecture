import React from 'react';
import { UserCheck } from 'lucide-react';
import NavigationCON from '../../Constants/NavigationCON';
import weplmLogo from '../../../../assets/weplm.jpeg';

export default function CandidateHeaderStaticComponent(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Insignia */}
        <div className="flex items-center gap-3 select-none shrink-0">
          <img
            src={weplmLogo}
            alt="We.PLM Logo"
            className="w-8 h-8 rounded-sm object-cover shrink-0 shadow-sm border border-slate-200/80 dark:border-zinc-800"
          />
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-serif-headline leading-none">
              {NavigationCON.BRAND_TITLE}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
              {NavigationCON.BRAND_SUBTITLE}
            </p>
          </div>
        </div>

        {/* Right Clustered: Prominent Candidate Portal Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 shadow-xs font-mono font-bold text-xs">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Candidate Portal</span>
          </div>
        </div>
      </div>
    </header>
  );
}
