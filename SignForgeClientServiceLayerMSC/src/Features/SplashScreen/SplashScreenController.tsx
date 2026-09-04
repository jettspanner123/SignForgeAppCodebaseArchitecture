import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SplashScreenLogoStaticComponent from './Components/static/SplashScreenLogoStaticComponent';
import SplashScreenCON from './Constants/SplashScreenCON';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';

export interface SplashScreenControllerProps {
  onReady: () => void;
}

export default function SplashScreenController({
  onReady,
}: SplashScreenControllerProps): React.JSX.Element {
  // Pre-fetch Dashboard Information from Backend
  const { isLoading, isFetched, isError } =
    TanstackQueryClientService.current.dashboardInfoGrab.useDashboardInfoQuery();

  useEffect(() => {
    // When backend query settles (either loaded or errored/fallback), hold splash screen for 2 seconds before dismissing
    if (!isLoading && (isFetched || isError)) {
      const timer = setTimeout(() => {
        onReady();
      }, SplashScreenCON.MINIMUM_DISPLAY_DURATION_MS);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isFetched, isError, onReady]);

  return (
    <AnimatePresence>
      <motion.div
        key="splash-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`fixed inset-0 z-50 flex items-center justify-center min-h-screen w-screen overflow-hidden ${SplashScreenCON.BG_LIGHT} ${SplashScreenCON.BG_DARK}`}
      >
        <SplashScreenLogoStaticComponent />
      </motion.div>
    </AnimatePresence>
  );
}
