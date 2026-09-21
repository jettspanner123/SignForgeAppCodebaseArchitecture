import React from 'react';
import { UserCheck } from 'lucide-react';
import RequestFeatureCON from '../../Constants/RequestFeatureCON';
import { FeatureRequestResponseModel } from '../../Models/RequestFeatureModel';
import { UserProfileType } from '../../../LoginScreen/Models/LoginScreenModel';
import FeatureRequestFormColumnStaticComponent from './FeatureRequestFormColumnStaticComponent';

interface RequestFeatureStaticComponentProps {
  currentUser: UserProfileType | null;
  title: string;
  featureType: string;
  description: string;
  isSubmitting: boolean;
  validationErrors: { title?: string; featureType?: string; description?: string };
  submittedRequest: FeatureRequestResponseModel | null;
  onChangeTitle: (value: string) => void;
  onChangeFeatureType: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function RequestFeatureStaticComponent({
  currentUser,
  title,
  featureType,
  description,
  isSubmitting,
  validationErrors,
  submittedRequest,
  onChangeTitle,
  onChangeFeatureType,
  onChangeDescription,
  onSubmit,
  onReset,
}: RequestFeatureStaticComponentProps): React.JSX.Element {
  return (
    <div className="space-y-6 max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      {/* 1. Standard Page Header matching /documents & /create-offer */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-headline tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
              {RequestFeatureCON.FEATURE_TITLE}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 max-w-2xl">
            {RequestFeatureCON.FEATURE_SUBTITLE}
          </p>
        </div>
      </div>

      {/* 2. Read-only submitter identity confirmation - always the authenticated account, never chosen */}
      <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 px-4 py-3 shadow-xs">
        <div className="w-8 h-8 rounded-full bg-[#0C2086] dark:bg-blue-600 text-white flex items-center justify-center shrink-0">
          <UserCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Submitting As
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
            {currentUser?.fullName || currentUser?.email || 'Current Account'}{' '}
            <span className="font-normal text-slate-500 dark:text-zinc-400">
              ({currentUser?.email})
            </span>
          </p>
        </div>
      </div>

      {/* 3. Feature Specification Form */}
      <FeatureRequestFormColumnStaticComponent
        title={title}
        featureType={featureType}
        description={description}
        isSubmitting={isSubmitting}
        validationErrors={validationErrors}
        submittedRequest={submittedRequest}
        onChangeTitle={onChangeTitle}
        onChangeFeatureType={onChangeFeatureType}
        onChangeDescription={onChangeDescription}
        onSubmit={onSubmit}
        onReset={onReset}
      />
    </div>
  );
}
