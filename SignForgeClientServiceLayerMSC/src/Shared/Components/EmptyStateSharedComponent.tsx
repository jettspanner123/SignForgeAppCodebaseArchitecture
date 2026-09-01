import React from 'react';
import { FileText } from 'lucide-react';
import ButtonSharedComponent from './ButtonSharedComponent';

export interface EmptyStateSharedComponentProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyStateSharedComponent({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateSharedComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center text-[#0C2086] dark:text-blue-400 mb-4">
        {icon || <FileText className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold font-serif-headline text-slate-900 dark:text-zinc-100 mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <ButtonSharedComponent variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </ButtonSharedComponent>
      )}
    </div>
  );
}
