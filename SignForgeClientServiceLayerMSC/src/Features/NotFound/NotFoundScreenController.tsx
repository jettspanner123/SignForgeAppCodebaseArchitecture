import React from 'react';
import { ArrowLeft, Home, LogIn, FileText, ShieldAlert } from 'lucide-react';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import ApplicationHapticsUtility from '../../Utilities/ApplicationHapticsUtility';
import ApplicationRouteCON from '../../Constants/ApplicationRouteCON';
import { useOfferDocumentStore } from '../../Store/OfferDocumentStore';
import useAuthenticationStateStore from '../../Store/AuthenticationStateStore';

interface NotFoundScreenControllerProps {
  isRestrictedFeature?: boolean;
  featureName?: string;
  onNavigateHome?: () => void;
}

export const NotFoundScreenController: React.FC<NotFoundScreenControllerProps> = ({
  isRestrictedFeature = false,
  featureName = 'External PDF Upload & Coordinate Tagging',
  onNavigateHome,
}) => {
  const { setCurrentView } = useOfferDocumentStore();
  const isAuthenticated = useAuthenticationStateStore((s) => s.isAuthenticated);

  const handlePrimaryAction = () => {
    ApplicationHapticsUtility.current.triggerHapticFeedback(12);
    if (onNavigateHome) {
      onNavigateHome();
    } else if (isAuthenticated) {
      setCurrentView(ApplicationRouteCON.DOCUMENTS);
    } else {
      setCurrentView(ApplicationRouteCON.LOGIN);
    }
  };

  const handleGoBuilder = () => {
    ApplicationHapticsUtility.current.triggerHapticFeedback(12);
    setCurrentView(ApplicationRouteCON.CREATE_OFFER);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* Visual Glyph Card with Executive Glow */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-blue-500/10 dark:bg-blue-500/20 blur-2xl -z-10 transform scale-150" />
          
          <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200/80 dark:from-zinc-900 dark:to-[#0a0a0c] border border-slate-200/90 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50">
            {isRestrictedFeature ? (
              <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 text-[#0C2086] dark:text-blue-400 stroke-[1.5]" />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-[#0C2086] dark:text-blue-400">
                  404
                </span>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 dark:text-zinc-500 uppercase mt-0.5">
                  SignForge ITSC
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Headline and Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-headline tracking-tight text-slate-900 dark:text-zinc-100">
            {isRestrictedFeature
              ? `${featureName} is Currently Unavailable`
              : 'The requested page could not be found'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            {isRestrictedFeature
              ? 'This module is temporarily inactive or undergoing enterprise administrative configuration. You can continue creating and dispatching offers using the Standard Offer Builder.'
              : isAuthenticated
                ? 'The URL path you navigated to does not exist or may have been moved. Please verify the link or return to the main dashboard.'
                : 'The URL path you navigated to does not exist or may have been moved. Please return to the login screen.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <ButtonSharedComponent
            variant="primary"
            size="md"
            icon={isAuthenticated ? <Home className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            onClick={handlePrimaryAction}
            className="w-full sm:w-auto px-6 !h-11 sm:!h-10 text-xs font-bold"
          >
            {isAuthenticated ? 'Return to Dashboard' : 'Back to Login'}
          </ButtonSharedComponent>

          {isRestrictedFeature && isAuthenticated && (
            <ButtonSharedComponent
              variant="outline"
              size="md"
              icon={<FileText className="w-4 h-4 text-[#0C2086] dark:text-blue-400" />}
              onClick={handleGoBuilder}
              className="w-full sm:w-auto px-6 !h-11 sm:!h-10 text-xs font-bold"
            >
              Use Offer Builder
            </ButtonSharedComponent>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotFoundScreenController;
