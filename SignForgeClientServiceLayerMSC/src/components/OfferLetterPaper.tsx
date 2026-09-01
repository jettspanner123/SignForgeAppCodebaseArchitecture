import React from 'react';
import { OfferDocument } from '../types';
import { PenTool, CheckCircle2, ShieldCheck } from 'lucide-react';
import { WePlmLogo } from './WePlmLogo';

interface OfferLetterPaperProps {
  document: OfferDocument;
  onOpenSignModal?: () => void;
  isCandidateView?: boolean;
  isHRView?: boolean;
  isPreview?: boolean;
}

export const OfferLetterPaper: React.FC<OfferLetterPaperProps> = ({
  document,
  onOpenSignModal,
  isCandidateView = false,
  isHRView = false,
  isPreview = false
}) => {
  const isCandidateSigned = !!document.candidateSignature;
  const isHRSigned = !!document.hrSignature;
  const docTypeTitle = document.documentType === 'JOINING_LETTER' ? 'JOINING LETTER' : 'OFFER LETTER';
  const candidateFirstName = document.offerDetails.candidateName.split(' ')[0] || document.offerDetails.candidateName;

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans text-slate-900">
      
      {/* PAGE 1: APPOINTMENT & OFFER DETAILS */}
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-200 relative overflow-hidden space-y-6">
        
        {/* Header: We.PLM Logo & Title */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
          {/* Logo */}
          <WePlmLogo className="h-14 sm:h-18 w-auto shrink-0" />

          {/* Centered Title */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wider underline underline-offset-8 decoration-2 decoration-slate-900">
              {docTypeTitle}
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2">
              Ref: {document.documentNumber}
            </p>
          </div>

          {/* Date */}
          <div className="text-right text-xs font-semibold text-slate-600 shrink-0">
            <p className="font-mono text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {new Date(document.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Recipient Address Block */}
        <div className="space-y-1 text-xs text-slate-800 leading-relaxed pt-2">
          <p className="font-bold text-slate-900 text-sm">To,</p>
          <p className="font-extrabold text-slate-900 text-sm">{document.offerDetails.candidateName}</p>
          <p className="whitespace-pre-line text-slate-700 font-medium">
            {document.offerDetails.candidateAddress || 'Pune, Maharashtra - 411027'}
          </p>
          {document.offerDetails.candidateDob && (
            <p className="font-bold text-slate-900 pt-1">
              DOB: <span className="font-mono">{document.offerDetails.candidateDob}</span>
            </p>
          )}
        </div>

        {/* Salutation & Main Body Paragraphs */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed pt-2">
          <p className="font-bold text-slate-900">Dear {candidateFirstName},</p>
          
          <p>
            We are pleased to appoint you as <strong className="text-slate-900 font-extrabold">{document.offerDetails.jobTitle}</strong> in{' '}
            <strong className="text-slate-900 font-extrabold">{document.companyName}</strong>. During your engagement, you may be deputed at our{' '}
            <strong className="text-slate-900 font-semibold">{document.offerDetails.workLocation || 'Pune office'}</strong>. Your assignment with the Company will be Effective from{' '}
            <strong className="text-slate-900 font-extrabold">{document.offerDetails.joiningDate}</strong>.
          </p>

          <p>
            We are looking forward to a wonderful journey together.
          </p>

          <p>
            We wish you all the best and are very confident that you will successfully deliver your responsibilities.
          </p>
        </div>

        {/* Offer Highlights Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex justify-between">
            <span>KEY ENGAGEMENT TERMS</span>
            <span className="text-emerald-700 font-extrabold">{document.offerDetails.annualSalary}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700 pt-1">
            <div>
              <span className="text-slate-500 block text-[10px]">Department:</span>
              <span className="font-bold text-slate-900">{document.offerDetails.department}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Reporting Manager:</span>
              <span className="font-bold text-slate-900">{document.offerDetails.reportingManager}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Probation Period:</span>
              <span className="font-bold text-slate-900">{document.offerDetails.probationMonths} Month(s)</span>
            </div>
          </div>
        </div>

        {/* Sign-off */}
        <div className="pt-4 space-y-1 text-xs text-slate-800">
          <p className="font-medium text-slate-600">Yours truly,</p>
          <p className="font-extrabold text-slate-900">For {document.companyName}</p>
          <div className="pt-6">
            <p className="font-bold text-slate-900">{document.offerDetails.directorName || 'Shantanu Jagtap'}</p>
            <p className="text-slate-600 font-medium">{document.offerDetails.directorTitle || 'Director'}</p>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 italic text-center leading-tight">
          Regd. Office: {document.companyName} | G22 Deepmala Pimple Saudagar Pune 411027 | INDIA | Tel: +91 8806060538 | sales@theweplm.com | www.theweplm.com | CIN : U72900PN2021FTC203259
        </div>
      </div>

      {/* PAGE 2: TERMS AND CONDITIONS */}
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-200 relative overflow-hidden space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
          <WePlmLogo className="h-12 w-auto shrink-0" />
          <div className="flex-1 text-center px-4">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider underline underline-offset-4 decoration-2">
              {docTypeTitle} - TERMS & CONDITIONS
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Page 2 of 3 • Ref: {document.documentNumber}
            </p>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Candidate Agreement Header */}
        <div className="space-y-2 text-xs text-slate-900">
          <p className="font-bold text-sm">I {document.offerDetails.candidateName},</p>
          <p className="font-semibold text-slate-700">Hereby agree to the following terms and conditions:</p>
        </div>

        {/* Terms Bullet Points */}
        <div className="space-y-3 text-xs text-slate-800 leading-relaxed text-justify">
          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              <strong>Inventory & Asset Management:</strong> During your tenure at {document.companyName} or client deputation offices, any electronic devices (including laptops, computer peripherals, headphones, hard disks, mobiles, etc.) must be handled with utmost care and returned in fully operational condition upon request or exit. The ownership of all devices, tools, and consumables remains solely with {document.companyName}. In case of loss or damaged inventory, the company retains the right to recover total costs from the employee or withhold final settlements.
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              <strong>FOREX & Expense Settlement:</strong> FOREX allowances provided or expense claims incurred during official international/onsite trips must be completely settled with receipts within 30 days of trip conclusion. Unused FOREX balance remains company property and must be refunded immediately.
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              <strong>Joining Bonus Recovery:</strong> Any joining bonus or relocation assistance disbursed to you shall be fully recoverable by the company if you voluntarily resign or leave within 12 months of joining.
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              <strong>Notice Period:</strong> The mandatory notice period after completion of probation is 3 months. Serving the full notice period is strictly required to ensure clean operational handover and formal release.
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              <strong>Onsite Deputation & Obligations:</strong> Once deputed onsite or to client locations, you are expected to comply with all legal, statutory, and moral obligations while representing {document.companyName} at the highest professional standards.
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              <strong>Offshore Service Bond:</strong> Following an onsite assignment exceeding 6 months, you are required to serve a minimum of 6 months offshore to facilitate knowledge transfer. This commitment carries a liquidated damages bond value of 10,00,000 INR.
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              <strong>Organizational Governance:</strong> You agree to operate strictly within the organizational framework, code of conduct, and business policies enforced by the Company from time to time.
            </p>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 italic text-center leading-tight">
          Regd. Office: {document.companyName} | G22 Deepmala Pimple Saudagar Pune 411027 | INDIA | Tel: +91 8806060538 | sales@theweplm.com | www.theweplm.com | CIN : U72900PN2021FTC203259
        </div>
      </div>

      {/* PAGE 3: TERM, TERMINATION & SIGNATURE EXECUTION */}
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-200 relative overflow-hidden space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
          <WePlmLogo className="h-12 w-auto shrink-0" />
          <div className="flex-1 text-center px-4">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider underline underline-offset-4 decoration-2">
              {docTypeTitle} - EXECUTION & ACCEPTANCE
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Page 3 of 3 • Ref: {document.documentNumber}
            </p>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Term and Termination Section */}
        <div className="space-y-3 text-xs text-slate-800 leading-relaxed text-justify">
          <h3 className="font-bold text-slate-900 text-sm">Term and Termination:</h3>
          
          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              The Company shall be entitled to terminate your engagement immediately and without notice in cases of neglect of duties, breach of statutory policies, misappropriation of property, moral turpitude, fraudulent activity, or submission of forged documents.
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              <strong>Confidentiality & Non-Disclosure:</strong> You shall not disclose any proprietary or confidential information of {document.companyName} to third parties. All intellectual property generated during your employment belongs exclusively to the Company.
            </p>
          </div>
        </div>

        {/* Candidate Acceptance Header */}
        <div className="pt-4 border-t border-slate-200 space-y-1">
          <h3 className="font-extrabold text-slate-900 text-sm">Acceptance</h3>
          <p className="text-xs font-semibold text-slate-700">I agree to abide by the terms of the Engagement Letter</p>
          <p className="text-xs font-bold text-slate-900 pt-1">{document.offerDetails.candidateName}</p>
        </div>

        {/* eSignature Execution Grid */}
        <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Candidate Signature Box */}
          <div
            onClick={() => isCandidateView && !isCandidateSigned && onOpenSignModal && onOpenSignModal()}
            className={`border-2 rounded-xl p-4 transition-all ${
              isCandidateSigned
                ? 'border-emerald-500 bg-emerald-50/70'
                : isCandidateView
                ? 'border-dashed border-blue-500 bg-blue-50/60 hover:bg-blue-100/70 cursor-pointer shadow-sm'
                : 'border-dashed border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">CANDIDATE eSIGNATURE</span>
              {isCandidateSigned ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  VERIFIED eSIGN
                </span>
              ) : isCandidateView ? (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded animate-pulse border border-blue-300">
                  CLICK TO SIGN
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                  PENDING
                </span>
              )}
            </div>

            {document.candidateSignature ? (
              <div className="space-y-1">
                {document.candidateSignature.type === 'TYPE' ? (
                  <p className="text-2xl font-bold text-slate-900 py-2 border-b border-slate-200" style={{ fontFamily: document.candidateSignature.fontFamily }}>
                    {document.candidateSignature.value}
                  </p>
                ) : (
                  <img
                    src={document.candidateSignature.value}
                    alt="Candidate Signature"
                    className="max-h-12 py-1 object-contain border-b border-slate-200"
                  />
                )}
                <p className="text-[11px] font-bold text-slate-900 pt-1">Signed by: {document.candidateSignature.signedBy}</p>
                <p className="text-[10px] text-slate-500">Date: {new Date(document.candidateSignature.timestamp).toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-mono">IP: {document.candidateSignature.ipAddress}</p>
              </div>
            ) : (
              <div className="py-6 text-center space-y-1">
                <PenTool className={`h-6 w-6 mx-auto ${isCandidateView ? 'text-blue-600 opacity-90' : 'text-slate-400 opacity-60'}`} />
                <p className={`text-xs font-bold ${isCandidateView ? 'text-blue-700' : 'text-slate-500'}`}>
                  {isCandidateView ? 'Click Here to Apply Candidate eSignature' : '[ Pending Candidate Signature ]'}
                </p>
              </div>
            )}
          </div>

          {/* HR Representative Counter-Signature Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">HR AUTHORIZED SIGNER</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isHRSigned ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-200 text-slate-600'}`}>
                {isHRSigned ? 'COUNTERSIGNED' : 'PENDING COUNTERSIGN'}
              </span>
            </div>

            {document.hrSignature ? (
              <div className="space-y-1">
                {document.hrSignature.type === 'TYPE' ? (
                  <p className="text-2xl font-bold text-slate-900 py-2 border-b border-slate-200" style={{ fontFamily: document.hrSignature.fontFamily }}>
                    {document.hrSignature.value}
                  </p>
                ) : (
                  <img
                    src={document.hrSignature.value}
                    alt="HR Signature"
                    className="max-h-12 py-1 object-contain border-b border-slate-200"
                  />
                )}
                <p className="text-[11px] font-bold text-slate-900 pt-1">Signed by HR: {document.hrSignature.signedBy}</p>
                <p className="text-[10px] text-slate-500 font-mono">IP: {document.hrSignature.ipAddress}</p>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <ShieldCheck className="h-6 w-6 mx-auto opacity-50" />
                <p className="text-xs italic">[ Pending HR Counter-Signature ]</p>
              </div>
            )}
          </div>

        </div>

        {/* Watermark Security Seal */}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
          <span>SignCorp eSignature Engine • ESIGN & eIDAS Verified</span>
          <span className="font-mono">SHA-256 AUDIT STAMP: {document.sha256Checksum?.slice(0, 16) || 'SECURE'}...</span>
        </div>

        {/* Page 3 Footer */}
        <div className="pt-4 text-[10px] text-slate-500 italic text-center leading-tight">
          Regd. Office: {document.companyName} | G22 Deepmala Pimple Saudagar Pune 411027 | INDIA | Tel: +91 8806060538 | sales@theweplm.com | www.theweplm.com | CIN : U72900PN2021FTC203259
        </div>

      </div>

    </div>
  );
};
