import React from 'react';
import { Sparkles, MessageSquarePlus } from 'lucide-react';
import RequestFeatureCON from '../../Constants/RequestFeatureCON';
import { UserSummaryModel, FeatureRequestResponseModel } from '../../Models/RequestFeatureModel';
import UserSelectorColumnStaticComponent from './UserSelectorColumnStaticComponent';
import FeatureRequestFormColumnStaticComponent from './FeatureRequestFormColumnStaticComponent';

interface RequestFeatureStaticComponentProps {
  users: UserSummaryModel[];
  selectedUser: UserSummaryModel | null;
  isLoadingUsers: boolean;
  title: string;
  featureType: string;
  description: string;
  isSubmitting: boolean;
  validationErrors: { title?: string; featureType?: string; description?: string };
  submittedRequest: FeatureRequestResponseModel | null;
  onSelectUser: (user: UserSummaryModel | null) => void;
  onChangeTitle: (value: string) => void;
  onChangeFeatureType: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function RequestFeatureStaticComponent({
  users,
  selectedUser,
  isLoadingUsers,
  title,
  featureType,
  description,
  isSubmitting,
  validationErrors,
  submittedRequest,
  onSelectUser,
  onChangeTitle,
  onChangeFeatureType,
  onChangeDescription,
  onSubmit,
  onReset,
}: RequestFeatureStaticComponentProps): React.JSX.Element {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
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

      {/* 2. 2-Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: User Account Selector (~30% width) */}
        <UserSelectorColumnStaticComponent
          users={users}
          selectedUser={selectedUser}
          isLoadingUsers={isLoadingUsers}
          onSelectUser={onSelectUser}
        />

        {/* Right Column: Feature Specification Form (~70% width) */}
        <FeatureRequestFormColumnStaticComponent
          selectedUser={selectedUser}
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
    </div>
  );
}
