import React from 'react';
import {
  Lock,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  FileText,
} from 'lucide-react';
import RequestFeatureCON from '../../Constants/RequestFeatureCON';
import { UserSummaryModel, FeatureRequestResponseModel } from '../../Models/RequestFeatureModel';
import CustomSelectSharedComponent, { SelectOption } from '../../../../Shared/Components/CustomSelectSharedComponent';
import PrimaryActionButtonSharedComponent from '../../../../Shared/Components/PrimaryActionButtonSharedComponent';

interface FeatureRequestFormColumnStaticComponentProps {
  selectedUser: UserSummaryModel | null;
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

export default function FeatureRequestFormColumnStaticComponent({
  selectedUser,
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
}: FeatureRequestFormColumnStaticComponentProps): React.JSX.Element {
  const isLocked = !selectedUser;

  const featureTypeOptions: SelectOption[] = React.useMemo(() => {
    return RequestFeatureCON.FEATURE_TYPES.map((type) => ({
      value: type.value,
      label: type.label,
      sublabel: type.description,
    }));
  }, []);

  if (submittedRequest) {
    return (
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-white dark:bg-[#0a0a0c] border border-emerald-200 dark:border-emerald-900/60 p-6 sm:p-10 shadow-xs space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 blur-xl -z-10 transform scale-150" />
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Request Successfully Logged</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-headline text-slate-900 dark:text-zinc-100">
              Proposal Submitted for Review
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Your feature request has been registered in the database with status{' '}
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {submittedRequest.status || 'PENDING'}
              </span>{' '}
              and queued for engineering evaluation.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-left text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
              <span>Title:</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 truncate max-w-[240px]">
                {submittedRequest.title}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
              <span>Category:</span>
              <span className="font-medium text-slate-700 dark:text-zinc-300">
                {submittedRequest.featureType}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-zinc-400">
              <span>Audited Creator:</span>
              <span className="font-mono font-bold text-[#0C2086] dark:text-blue-400">
                {submittedRequest.createdBy}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <PrimaryActionButtonSharedComponent
              onClick={onReset}
              icon={<ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5 !text-white" />}
              className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-5 sm:px-4 text-sm sm:text-xs font-bold"
            >
              <span>Submit Another Request</span>
            </PrimaryActionButtonSharedComponent>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 relative">
      <div className="rounded-2xl bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-7 shadow-xs space-y-6">
        {/* Section: Feature Specification & Scope */}
        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
          <FileText className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
          <span>Feature Specification & Scope</span>
        </h4>

        {/* Form Container with Disabled Overlay */}
        <div className="relative">
          {/* Disabled Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-[2px] rounded-xl p-6 text-center space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 shadow-sm">
                <Lock className="w-6 h-6 text-[#0C2086] dark:text-blue-400" />
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Account Selection Required
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Select a user account in the left panel to begin your proposal.
                </p>
              </div>
            </div>
          )}

          {/* Actual Form Fields */}
          <form
            onSubmit={onSubmit}
            className={`space-y-5 transition-all duration-200 ${
              isLocked ? 'opacity-40 pointer-events-none select-none' : ''
            }`}
          >
            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="feature-title-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-zinc-300"
                >
                  Feature Title <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                  {title.length} / {RequestFeatureCON.MAX_TITLE_LENGTH}
                </span>
              </div>
              <div className="relative">
                <input
                  id="feature-title-input"
                  type="text"
                  disabled={isLocked}
                  maxLength={RequestFeatureCON.MAX_TITLE_LENGTH}
                  value={title}
                  onChange={(e) => onChangeTitle(e.target.value)}
                  placeholder="e.g. Automated HR Counter-Signature Reminder Webhook"
                  className={`w-full h-11 sm:h-10 px-3.5 rounded-xl sm:rounded-lg bg-white dark:bg-[#0a0a0c] border ${
                    validationErrors.title
                      ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20'
                      : 'border-slate-200/80 dark:border-zinc-800 focus:ring-[#0C2086]/30 dark:focus:ring-blue-500/30 focus:border-[#0C2086] dark:focus:border-blue-500'
                  } text-sm sm:text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all font-sans`}
                />
              </div>
              {validationErrors.title && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.title}</span>
                </p>
              )}
            </div>

            {/* Feature Type CustomSelect */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Feature Category <span className="text-rose-500">*</span>
              </label>
              <CustomSelectSharedComponent
                value={featureType}
                options={featureTypeOptions}
                onChange={onChangeFeatureType}
                placeholder="-- Select Feature Category --"
                size="sm"
                triggerClassName={
                  validationErrors.featureType
                    ? '!border-rose-300 dark:!border-rose-800 focus:!ring-rose-500/20'
                    : ''
                }
              />
              {validationErrors.featureType && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.featureType}</span>
                </p>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="feature-description-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-zinc-300"
                >
                  Detailed Description &amp; Business Use Case <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    description.length < RequestFeatureCON.MIN_DESCRIPTION_LENGTH && description.length > 0
                      ? 'text-amber-500'
                      : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {description.length} / {RequestFeatureCON.MAX_DESCRIPTION_LENGTH} (Min {RequestFeatureCON.MIN_DESCRIPTION_LENGTH})
                </span>
              </div>
              <textarea
                id="feature-description-input"
                rows={5}
                disabled={isLocked}
                maxLength={RequestFeatureCON.MAX_DESCRIPTION_LENGTH}
                value={description}
                onChange={(e) => onChangeDescription(e.target.value)}
                placeholder="Explain the proposed feature in detail, why it is needed, expected workflow improvements, and any specific edge cases or integration requirements..."
                className={`w-full p-3.5 rounded-xl sm:rounded-lg bg-white dark:bg-[#0a0a0c] border ${
                  validationErrors.description
                    ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20'
                    : 'border-slate-200/80 dark:border-zinc-800 focus:ring-[#0C2086]/30 dark:focus:ring-blue-500/30 focus:border-[#0C2086] dark:focus:border-blue-500'
                } text-sm sm:text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all font-sans resize-y leading-relaxed`}
              />
              {validationErrors.description && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.description}</span>
                </p>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-zinc-800/60">
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                Submitted requests are logged with full enterprise audit traceability.
              </p>

              <PrimaryActionButtonSharedComponent
                type="submit"
                disabled={isLocked || isSubmitting}
                isLoading={isSubmitting}
                loadingText="Submitting Proposal..."
                icon={<Send className="w-4 h-4 sm:w-3.5 sm:h-3.5 !text-white" />}
                className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-4 sm:px-3.5 text-sm sm:text-xs font-bold"
              >
                <span>Submit Feature Request</span>
              </PrimaryActionButtonSharedComponent>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
