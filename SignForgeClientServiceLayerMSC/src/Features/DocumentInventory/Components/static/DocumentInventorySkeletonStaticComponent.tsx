import React from 'react';
import SkeletonSharedComponent from '../../../../Shared/Components/SkeletonSharedComponent';

export interface DocumentInventorySkeletonStaticComponentProps {
  viewMode?: 'grid' | 'table';
  cardCount?: number;
}

export default function DocumentInventorySkeletonStaticComponent({
  viewMode = 'grid',
  cardCount = 6,
}: DocumentInventorySkeletonStaticComponentProps): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard data">
      {/* 1. Header Title & Actions Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonSharedComponent className="h-8 w-64" rounded="lg" />
          <SkeletonSharedComponent className="h-4 w-96 max-w-full" rounded="md" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonSharedComponent className="h-9 w-32" rounded="xl" />
          <SkeletonSharedComponent className="h-9 w-40" rounded="xl" />
        </div>
      </div>

      {/* 2. KPI Metric Cards 4-Column Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonSharedComponent className="h-4 w-24" rounded="md" />
              <SkeletonSharedComponent className="h-7 w-7" rounded="lg" />
            </div>
            <SkeletonSharedComponent className="h-8 w-16" rounded="lg" />
            <SkeletonSharedComponent className="h-3 w-32" rounded="sm" />
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Bar Skeleton */}
      <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <SkeletonSharedComponent className="h-9 w-full sm:w-72" rounded="lg" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SkeletonSharedComponent className="h-9 w-36" rounded="lg" />
          <SkeletonSharedComponent className="h-9 w-24" rounded="lg" />
        </div>
      </div>

      {/* 4. Document Items Grid/Table Skeleton */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: cardCount }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 space-y-4"
            >
              <div className="flex items-center justify-between">
                <SkeletonSharedComponent className="h-5 w-28" rounded="md" />
                <SkeletonSharedComponent className="h-6 w-20" rounded="full" />
              </div>
              <div className="space-y-2">
                <SkeletonSharedComponent className="h-6 w-4/5" rounded="md" />
                <SkeletonSharedComponent className="h-4 w-1/2" rounded="sm" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <SkeletonSharedComponent className="h-4 w-24" rounded="sm" />
                <SkeletonSharedComponent className="h-8 w-20" rounded="lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 overflow-hidden bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80">
          {Array.from({ length: cardCount }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SkeletonSharedComponent className="h-10 w-10" rounded="xl" />
                <div className="space-y-1.5">
                  <SkeletonSharedComponent className="h-4 w-48" rounded="md" />
                  <SkeletonSharedComponent className="h-3 w-32" rounded="sm" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-6">
                <SkeletonSharedComponent className="h-4 w-28" rounded="md" />
                <SkeletonSharedComponent className="h-6 w-24" rounded="full" />
                <SkeletonSharedComponent className="h-8 w-20" rounded="lg" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
