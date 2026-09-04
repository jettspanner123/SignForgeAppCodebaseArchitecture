import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Inbox, 
  Link as LinkIcon,
  UserCheck
} from 'lucide-react';
import { OfferDocument } from '../Types';
import { getCandidateShareLink } from '../utils/urlEncoder';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import { triggerHapticFeedback } from '../utils/haptics';

interface SendEmailModalProps {
  document: OfferDocument;
  onClose: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({ document, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [exitDirection, setExitDirection] = useState<'down' | 'up'>('down');
  const [copied, setCopied] = useState(false);

  const candidateEmail = document.offerDetails.candidateEmail || 'candidate@example.com';
  const candidateName = document.offerDetails.candidateName || 'Candidate';
  const jobTitle = document.offerDetails.jobTitle || 'Position';
  const companyName = document.companyName || 'We.PLM Global Technologies (P) Ltd.';

  // Construct direct candidate eSign link with embedded DataObjects payload
  const directLink = getCandidateShareLink(document);

  // Construct mailto link for 1-click live mail dispatch
  const mailSubject = encodeURIComponent(`Employment Offer Letter — ${jobTitle} at ${companyName} (${document.documentNumber})`);
  const mailBody = encodeURIComponent(
`Dear ${candidateName},

We are pleased to extend an offer for the position of ${jobTitle} at ${companyName}.

Please click the secure link below to review, accept, and eSign your offer letter.
NO APP LOGIN IS REQUIRED:

${directLink}

Offer Details:
• Role: ${jobTitle}
• Compensation: ${document.offerDetails.annualSalary}
• Joining Date: ${document.offerDetails.joiningDate}

If you have any questions regarding this offer, please feel free to reach out directly to HR.

Best regards,
${document.createdBy || 'Talent Acquisition Team'}
${companyName}
`
  );

  const mailtoUrl = `mailto:${candidateEmail}?subject=${mailSubject}&body=${mailBody}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleHeaderOrBackdropClose = () => {
    setExitDirection('down');
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 550);
  };

  const handleFooterClose = () => {
    setExitDirection('down');
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 550);
  };

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={handleHeaderOrBackdropClose}
      exitDirection={exitDirection}
      headerCloseDirection="down"
      title="Candidate eSign Link"
      subtitle={`Document #${document.documentNumber} • Direct eSign dispatch to ${candidateEmail}`}
      maxWidth="2xl"
      footer={
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-3 w-full">
          <ButtonSharedComponent
            variant="outline"
            size="md"
            onClick={handleFooterClose}
            className="w-full sm:w-auto justify-center"
          >
            Close
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            label="Launch Client"
            size="md"
            icon={<Send className="w-3.5 h-3.5 !text-white" />}
            onClick={() => {
              window.location.href = mailtoUrl;
            }}
            className="w-full sm:w-auto justify-center"
          />
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Section 1: Candidate Direct Link Box */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <LinkIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>1. Direct Candidate eSignature URL</span>
          </h4>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={directLink}
                className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3.5 py-2.5 sm:py-2 text-sm sm:text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-[#0C2086] dark:focus:ring-blue-500 select-all truncate h-11 sm:h-9"
              />
              <button
                type="button"
                onPointerDown={() => triggerHapticFeedback(12)}
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 !h-11 sm:!h-9 bg-[#0C2086] hover:bg-[#0a1b70] text-white font-bold text-sm sm:text-xs rounded-xl sm:rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Share this cryptographic URL directly with <strong className="text-slate-700 dark:text-zinc-200">{candidateName} ({candidateEmail})</strong> via Email, WhatsApp, or Slack.
            </p>
          </div>
        </div>

        {/* Section 2: 1-Click Live Email Dispatch Channels */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>2. Live Mail Client Dispatch Options</span>
          </h4>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-3">
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Launch your preferred mail service with a pre-filled professional invitation letter and direct cryptographic eSign link:
            </p>

            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2 pt-1">
              {/* Web Gmail Compose */}
              <ButtonSharedComponent
                variant="outline"
                size="md"
                icon={<Mail className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-500" />}
                onClick={() => {
                  window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidateEmail)}&su=${mailSubject}&body=${mailBody}`, '_blank');
                }}
                className="w-full sm:w-auto justify-center !h-11 sm:!h-9 text-xs font-semibold"
              >
                Gmail
              </ButtonSharedComponent>

              {/* Web Outlook Compose */}
              <ButtonSharedComponent
                variant="outline"
                size="md"
                icon={<Inbox className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-blue-500" />}
                onClick={() => {
                  window.open(`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(candidateEmail)}&subject=${mailSubject}&body=${mailBody}`, '_blank');
                }}
                className="w-full sm:w-auto justify-center !h-11 sm:!h-9 text-xs font-semibold"
              >
                Outlook Web
              </ButtonSharedComponent>

              {/* Local Desktop App */}
              <ButtonSharedComponent
                variant="outline"
                size="md"
                icon={<Smartphone className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-600 dark:text-zinc-400" />}
                onClick={() => {
                  window.location.href = mailtoUrl;
                }}
                className="w-full sm:w-auto justify-center !h-11 sm:!h-9 text-xs font-semibold"
              >
                Default App
              </ButtonSharedComponent>

              {/* Test Portal View */}
              <div className="w-full sm:w-auto sm:ml-auto">
                <ButtonSharedComponent
                  variant="secondary"
                  size="md"
                  icon={<ExternalLink className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  onClick={() => {
                    window.open(directLink, '_blank');
                  }}
                  className="w-full sm:w-auto justify-center !h-11 sm:!h-9 text-xs font-semibold"
                >
                  Test Portal
                </ButtonSharedComponent>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Executive Signatory Status */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>3. Executive Notification Routing</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-mono">HR Head Channel</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                  {document.executives?.hrHead?.status || 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                {document.executives?.hrHead?.email || document.hrHeadEmail || 'hr@theweplm.com'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-mono">CTO Channel</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                  {document.executives?.cto?.status || 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                {document.executives?.cto?.email || document.ctoEmail || 'cto@theweplm.com'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </ModalSharedComponent>
  );
};
export default SendEmailModal;
