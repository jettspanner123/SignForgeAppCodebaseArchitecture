import React from 'react';

export interface SkeletonSharedComponentProps {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export default function SkeletonSharedComponent({
  className = 'h-4 w-full',
  rounded = 'md',
}: SkeletonSharedComponentProps): React.JSX.Element {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 ${roundedClass} ${className}`}
      aria-hidden="true"
    />
  );
}
