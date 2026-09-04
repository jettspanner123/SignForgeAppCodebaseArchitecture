import React from 'react';
import { motion } from 'motion/react';
import { WePlmLogo } from '../../../../components/WePlmLogo';
import SplashScreenCON from '../../Constants/SplashScreenCON';

export interface SplashScreenLogoStaticComponentProps {
  loadingMessage?: string;
}

export default function SplashScreenLogoStaticComponent({
  loadingMessage = SplashScreenCON.LOADING_TEXT,
}: SplashScreenLogoStaticComponentProps): React.JSX.Element {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 max-w-sm w-full select-none text-center">
      {/* Subtle Ambient Radial Glow */}
      <div 
        className={`absolute -inset-16 rounded-full bg-gradient-to-tr ${SplashScreenCON.AMBIENT_LIGHT} ${SplashScreenCON.AMBIENT_DARK} blur-3xl opacity-70 pointer-events-none`}
        aria-hidden="true" 
      />

      {/* Brand Icon Card with Breathing Animation */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-6 flex items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-xl shadow-slate-900/5 dark:shadow-black/40 border border-slate-200/70 dark:border-slate-800/80 backdrop-blur-md"
        >
          <WePlmLogo className="h-16 w-auto object-contain" />
        </motion.div>
      </motion.div>

      {/* App Title & Tagline */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="space-y-1 mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-serif-headline">
          {SplashScreenCON.BRAND_TITLE}
        </h1>
        <p className="text-xs tracking-wide uppercase font-semibold text-slate-500 dark:text-slate-400">
          {SplashScreenCON.BRAND_SUBTITLE}
        </p>
      </motion.div>

      {/* Slender Indeterminate Loading Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="w-48 space-y-2"
      >
        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-400 rounded-full"
            initial={{ x: '-100%', width: '40%' }}
            animate={{ x: ['-100%', '250%'] }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: 'easeInOut',
            }}
          />
        </div>
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {loadingMessage}
        </p>
      </motion.div>
    </div>
  );
}
