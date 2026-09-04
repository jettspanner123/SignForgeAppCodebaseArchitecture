import React from 'react';
import { motion } from 'motion/react';
import { WePlmLogo } from '../../../../components/WePlmLogo';
import SplashScreenCON from '../../Constants/SplashScreenCON';

export interface SplashScreenLogoStaticComponentProps {
  className?: string;
}

export default function SplashScreenLogoStaticComponent({
  className = '',
}: SplashScreenLogoStaticComponentProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center select-none text-center ${className}`}
    >
      {/* Brand Icon (Less Rounded Corner) */}
      <WePlmLogo className="h-14 sm:h-16 w-auto object-contain rounded-lg select-none pointer-events-none" />
      
      {/* Brand Title & Subtitle */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="mt-4 space-y-1"
      >
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-serif-headline">
          {SplashScreenCON.BRAND_TITLE}
        </h1>
        <p className="text-xs tracking-wider uppercase font-semibold text-slate-500 dark:text-zinc-400">
          {SplashScreenCON.BRAND_SUBTITLE}
        </p>
      </motion.div>
    </motion.div>
  );
}
