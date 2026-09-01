import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DocumentStatus } from '../../Types';
import ApplicationThemeCON from '../../Constants/ApplicationThemeCON';

export interface BadgeSharedComponentProps {
  status: DocumentStatus | string;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
  customLabel?: string;
}

export default function BadgeSharedComponent({
  status,
  size = 'md',
  className,
  showDot = true,
  customLabel
}: BadgeSharedComponentProps) {
  const config = ApplicationThemeCON.STATUS_CONFIGS[status] || {
    label: status,
    bgLight: 'bg-slate-100',
    bgDark: 'dark:bg-zinc-800',
    textLight: 'text-slate-700',
    textDark: 'dark:text-zinc-300',
    dot: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-mono font-medium rounded-md border border-black/5 dark:border-white/10 uppercase tracking-wide shrink-0',
          sizeClasses,
          config.bgLight,
          config.bgDark,
          config.textLight,
          config.textDark,
          className
        )
      )}
    >
      {showDot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      )}
      <span>{customLabel || config.label}</span>
    </span>
  );
}
