import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface ModalSharedComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  minHeight?: string;
  scrollMode?: 'backdrop' | 'body';
  animationType?: 'scale' | 'slide-up';
  exitDirection?: 'down' | 'up';
  headerCloseDirection?: 'down' | 'up';
  zIndex?: number;
}

export default function ModalSharedComponent({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '2xl',
  minHeight,
  scrollMode = 'backdrop',
  animationType = 'slide-up',
  exitDirection: exitDirectionProp = 'down',
  headerCloseDirection = 'down',
  zIndex = 50,
}: ModalSharedComponentProps): React.JSX.Element {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dialogCardRef = useRef<HTMLDivElement>(null);
  const [internalExitDirection, setInternalExitDirection] = useState<'down' | 'up'>(exitDirectionProp);
  const prevOpenRef = useRef(isOpen);

  useEffect(() => {
    setInternalExitDirection(exitDirectionProp);
  }, [exitDirectionProp]);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setInternalExitDirection(exitDirectionProp || 'down');
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, exitDirectionProp]);

  const getScrollAwareDirection = (): 'down' | 'up' => {
    if (scrollMode === 'backdrop' && scrollContainerRef.current) {
      return scrollContainerRef.current.scrollTop > 40 ? 'up' : 'down';
    }
    return 'down';
  };

  const handleBackdropClick = () => {
    const direction = getScrollAwareDirection();
    setInternalExitDirection(direction);
    setTimeout(() => onClose(), 0);
  };

  const handleEscapeKey = () => {
    const direction = getScrollAwareDirection();
    setInternalExitDirection(direction);
    setTimeout(() => onClose(), 0);
  };

  const handleHeaderClose = () => {
    setInternalExitDirection(headerCloseDirection);
    setTimeout(() => onClose(), 0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleEscapeKey();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  let widthClass = 'max-w-2xl';
  if (maxWidth === 'sm') widthClass = 'max-w-sm';
  if (maxWidth === 'md') widthClass = 'max-w-md';
  if (maxWidth === 'lg') widthClass = 'max-w-lg';
  if (maxWidth === 'xl') widthClass = 'max-w-xl';
  if (maxWidth === '2xl') widthClass = 'max-w-2xl';
  if (maxWidth === '3xl') widthClass = 'max-w-3xl';
  if (maxWidth === '4xl') widthClass = 'max-w-4xl';
  if (maxWidth === '5xl') widthClass = 'max-w-5xl';

  const isSlideUp = animationType === 'slide-up';
  const activeExitDirection: 'down' | 'up' =
    exitDirectionProp === 'up' || internalExitDirection === 'up' ? 'up' : 'down';

  const getExitDistance = (dir: 'down' | 'up'): number => {
    if (typeof window === 'undefined') return dir === 'up' ? -1800 : 1800;
    const vh = window.innerHeight || 800;
    const cardHeight = dialogCardRef.current?.offsetHeight || 800;
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    return dir === 'up' ? -(cardHeight + vh + scrollTop + 400) : cardHeight + vh + 400;
  };

  const modalVariants = {
    initial: {
      y: isSlideUp ? (typeof window !== 'undefined' ? window.innerHeight + 1000 : '150vh') : 8,
      opacity: isSlideUp ? 1 : 0,
      scale: isSlideUp ? 1 : 0.96,
    },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: (customDir?: 'down' | 'up') => {
      const dir = customDir || activeExitDirection;
      const distance = getExitDistance(dir);
      return {
        y: isSlideUp ? distance : 8,
        opacity: isSlideUp ? 1 : 0,
        scale: isSlideUp ? 1 : 0.96,
        transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const },
      };
    },
  };

  return (
    <AnimatePresence custom={activeExitDirection}>
      {isOpen && (
        <div
          ref={scrollContainerRef}
          style={{ zIndex }}
          className="fixed inset-0 flex items-end sm:items-start justify-center p-0 sm:p-6 overflow-y-auto overflow-x-hidden w-[100dvw] h-[100dvh]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-slate-950/75 dark:bg-black/80 sm:bg-slate-900/60 sm:dark:bg-black/60 backdrop-blur-none sm:backdrop-blur-sm w-[100dvw] h-[100dvh]"
          />

          <motion.div
            ref={dialogCardRef}
            custom={activeExitDirection}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative w-[100dvw] sm:w-full ${widthClass} bg-white dark:bg-[#0a0a0c] hairline-border-strong rounded-t-2xl rounded-b-none sm:rounded-xl shadow-2xl z-10 my-0 sm:my-8 max-h-[90dvh] sm:max-h-none flex flex-col shrink-0`}
          >
            {(title || subtitle) && (
              <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 font-serif-headline">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleHeaderClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className={`p-5 sm:p-6 flex-1 overflow-y-auto max-h-[calc(90dvh-130px)] sm:max-h-none ${scrollMode === 'body' ? 'overflow-y-auto' : ''} ${minHeight ? minHeight : ''}`}>
              {children}
            </div>

            {footer && (
              <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-[#08080a] shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
