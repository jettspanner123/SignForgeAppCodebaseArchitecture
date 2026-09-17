import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastSharedComponentProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: ToastVariant;
  title: string;
  message?: string;
  autoDismissMs?: number;
}

export default function ToastSharedComponent({
  isOpen,
  onClose,
  variant = 'info',
  title,
  message,
  autoDismissMs = 6000,
}: ToastSharedComponentProps): React.JSX.Element | null {
  useEffect(() => {
    if (!isOpen || !autoDismissMs) return;
    const timer = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(timer);
  }, [isOpen, autoDismissMs, onClose]);

  const variantConfig: Record<ToastVariant, { Icon: typeof CheckCircle2; iconColor: string }> = {
    success: { Icon: CheckCircle2, iconColor: 'text-emerald-500 dark:text-emerald-400' },
    error: { Icon: XCircle, iconColor: 'text-rose-500 dark:text-rose-400' },
    warning: { Icon: AlertTriangle, iconColor: 'text-amber-500 dark:text-amber-400' },
    info: { Icon: Info, iconColor: 'text-sky-500 dark:text-sky-400' },
  };
  const { Icon, iconColor } = variantConfig[variant];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="toast-shared-component"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96, transition: { duration: 0.2 } }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[100] w-[calc(100vw-3rem)] sm:w-auto sm:max-w-sm"
        >
          <div className="bg-white dark:bg-[#0a0a0c] hairline-border-strong rounded-2xl shadow-2xl p-4 flex items-start space-x-3">
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100">{title}</p>
              {message && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{message}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
