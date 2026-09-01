import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Inbox, 
  Link as LinkIcon
} from 'lucide-react';
import { OfferDocument } from '../Types';
import { getCandidateShareLink } from '../utils/urlEncoder';

interface SendEmailModalProps {
  document: OfferDocument;
  onClose: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({ document, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

  const candidateEmail = document.offerDetails.candidateEmail || 'candidate@example.com';
  const candidateName = document.offerDetails.candidateName || 'Candidate';
  const jobTitle = document.offerDetails.jobTitle || 'Position';
  const companyName = document.companyName || 'We.PLM';

  // Construct direct candidate eSign link with embedded data payload
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

  const handleSimulateSend = () => {
    setEmailStatus('SENDING');
    setTimeout(() => {
      setEmailStatus('SENT');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Candidate eSign Email & Direct Link</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Candidate signs directly via link — No login or registration required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Candidate Direct Link Box */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Direct Candidate eSign URL</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                NO LOGIN REQUIRED
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={directLink}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>Copied Link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Share this link with <strong className="text-slate-700 dark:text-slate-200">{candidateName} ({candidateEmail})</strong> via Email, WhatsApp, or Slack.
            </p>
          </div>

          {/* Option A: Send via Web Mail or Mail App */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                <Send className="h-4.5 w-4.5" />
                <span>Option 1: Send Live Email via Webmail or Local Mail App</span>
              </div>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                1-CLICK LIVE DISPATCH
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Opens your preferred mail provider with a pre-filled professional invitation email containing the candidate eSign link.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              {/* Web Gmail Compose */}
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidateEmail)}&su=${mailSubject}&body=${mailBody}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <Mail className="h-4 w-4" />
                <span>Open in Gmail</span>
                <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
              </a>

              {/* Web Outlook Compose */}
              <a
                href={`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(candidateEmail)}&subject=${mailSubject}&body=${mailBody}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <Inbox className="h-4 w-4" />
                <span>Open in Outlook Web</span>
                <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
              </a>

              {/* Local Desktop App (No target="_blank" to prevent blank google.com/webhp tab) */}
              <button
                onClick={() => {
                  window.location.href = mailtoUrl;
                }}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all"
              >
                <Smartphone className="h-4 w-4" />
                <span>Default Mail App</span>
              </button>

              {/* Test Candidate Link in New Tab */}
              <button
                onClick={() => {
                  window.open(directLink, '_blank');
                }}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all ml-auto"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Test Candidate View in New Tab</span>
              </button>
            </div>
          </div>

          {/* Option B: Simulate In-App Email Dispatch */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
                <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                <span>Option 2: Simulate Direct Server Dispatch</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Simulates automated background SMTP dispatch to <strong className="text-slate-800 dark:text-slate-200">{candidateEmail}</strong>.
            </p>

            <div className="pt-1 flex items-center space-x-3">
              <button
                disabled={emailStatus === 'SENDING'}
                onClick={handleSimulateSend}
                className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {emailStatus === 'SENDING' ? 'Sending Email...' : emailStatus === 'SENT' ? '✓ Email Sent Successfully' : 'Simulate Email Send'}
              </button>

              {emailStatus === 'SENT' && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 animate-in fade-in">
                  <Check className="h-4 w-4" />
                  <span>Dispatched to candidate inbox log!</span>
                </span>
              )}
            </div>
          </div>

          {/* Production Setup Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Production Setup (Resend / SendGrid / Postmark)</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              To enable automated server-side email delivery when deploying to production (Vercel / Cloud Run), add your API key in <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded font-mono">.env</code>:
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400">
              RESEND_API_KEY=re_123456789<br />
              # Or for SendGrid:<br />
              SENDGRID_API_KEY=SG.xxxxxxxx
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
