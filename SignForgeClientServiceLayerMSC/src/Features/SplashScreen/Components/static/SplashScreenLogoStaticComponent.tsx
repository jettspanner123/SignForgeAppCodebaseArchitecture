import React from 'react';
import { motion } from 'motion/react';

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
      className={`flex items-center justify-center select-none ${className}`}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full max-w-xs sm:max-w-sm h-auto object-contain pointer-events-none"
      >
        <source src="/splash-screen-logo-animation.mp4" type="video/mp4" />
      </video>
    </motion.div>
  );
}
