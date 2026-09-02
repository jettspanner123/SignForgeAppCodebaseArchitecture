import React from 'react';
import { OfferDocument } from '../Types';
import { PenTool, ShieldCheck, UserCheck, Mail, Building2, Calendar, MapPin, DollarSign, Award, Briefcase, User } from 'lucide-react';
import { WePlmLogo } from './WePlmLogo';
import OfferLetterInteractiveStateInterfaceModel from '../Models/OfferLetterInteractiveStateInterfaceModel';

interface OfferLetterPaperProps {
  document: OfferDocument;
  onOpenSignModal?: () => void;
  isCandidateView?: boolean;
  isHRView?: boolean;
  isPreview?: boolean;
  isInteractiveForm?: boolean;
  interactive?: OfferLetterInteractiveStateInterfaceModel;
  layoutMode?: 'grid' | 'stack';
}

export const OfferLetterPaper: React.FC<OfferLetterPaperProps> = ({
  document,
  onOpenSignModal,
  isCandidateView = false,
  isHRView = false,
  isPreview = false,
  isInteractiveForm = false,
  interactive,
  layoutMode = 'grid',
}) => {
  const isCandidateSigned = !!document.candidateSignature;
  const isHRSigned = !!document.hrSignature;
  const docTypeTitle = document.documentType === 'JOINING_LETTER' ? 'JOINING LETTER' : 'OFFER LETTER';
  
  const currentCandidateName = isInteractiveForm 
    ? interactive?.candidateName || '' 
    : document.offerDetails.candidateName;

  const candidateFirstName = currentCandidateName.split(' ')[0] || currentCandidateName || 'Candidate';
  const currentCompanyName = isInteractiveForm 
    ? interactive?.companyName || 'We.PLM Global Operations Pvt Ltd'
    : document.companyName;

  const signatureCount = isInteractiveForm 
    ? interactive?.signatureCount || 2
    : document.signatureCount || 2;

  const errors = interactive?.errors || {};

  return (
    <div className={`${layoutMode === 'stack' ? 'flex flex-col gap-8' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'} w-full font-sans text-slate-900`}>
      
      {/* PAGE 1: APPOINTMENT & OFFER DETAILS */}
      <div 
        id="offer-letter-page-1"
        className={`bg-white rounded-lg shadow-xl p-6 sm:p-10 md:p-12 border border-slate-200 relative overflow-hidden flex flex-col justify-between transition-all ${layoutMode === 'grid' ? 'h-full' : ''}`}
      >
        <div className="space-y-6 flex-1">
          {/* Header: We.PLM Logo & Title */}
        <div className="relative flex items-center justify-between pb-5 sm:pb-6 border-b-2 border-slate-900 min-h-[58px] sm:min-h-[64px]">
          {/* Logo */}
          <WePlmLogo className="h-9 sm:h-12 md:h-14 w-auto shrink-0 z-10" />

          {/* Centered Title */}
          <div className="absolute inset-x-0 mx-auto text-center pointer-events-none flex flex-col items-center justify-center">
            <h1
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-sm sm:text-xl md:text-2xl font-serif-headline font-bold text-slate-900 uppercase tracking-wider sm:tracking-widest leading-tight whitespace-nowrap"
            >
              {docTypeTitle}
            </h1>
            <div className="w-8 sm:w-12 h-0.5 bg-[#0C2086] mx-auto mt-1 rounded-full" />
            <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mt-1 truncate max-w-[190px] sm:max-w-none">
              Ref: {document.documentNumber}
            </p>
          </div>

          {/* Date */}
          <div className="text-right shrink-0 z-10">
            <p className="font-mono text-[10px] sm:text-xs text-slate-700 font-bold bg-slate-100 px-2 sm:px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap">
              {new Date(document.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Recipient Address Block */}
        <div className="space-y-2 text-xs text-slate-800 leading-relaxed pt-2">
          <p className="font-bold text-slate-900 text-sm">To,</p>
          
          {isInteractiveForm && interactive ? (
            <div className="space-y-2 max-w-xl">
              <div>
                <input
                  type="text"
                  name="candidateName"
                  value={interactive.candidateName}
                  onChange={(e) => interactive.setCandidateName(e.target.value)}
                  placeholder="Candidate Full Name *"
                  className={`w-full px-2.5 py-1.5 text-sm font-extrabold text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border rounded transition-all outline-none ${
                    errors.candidateName 
                      ? 'border-red-500 ring-2 ring-red-500/20' 
                      : 'border-slate-300 focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20'
                  }`}
                />
                {errors.candidateName && (
                  <span className="text-[10px] text-red-600 font-bold mt-0.5 block">{errors.candidateName}</span>
                )}
              </div>

              <div>
                <textarea
                  name="candidateAddress"
                  value={interactive.candidateAddress}
                  onChange={(e) => interactive.setCandidateAddress(e.target.value)}
                  placeholder="Candidate Residential Address (e.g. Pune, Maharashtra - 411027)"
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Candidate Email *</span>
                  <input
                    type="email"
                    name="candidateEmail"
                    value={interactive.candidateEmail}
                    onChange={(e) => interactive.setCandidateEmail(e.target.value)}
                    placeholder="candidate@email.com"
                    className={`w-full px-2 py-1 text-xs text-slate-800 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border rounded transition-all outline-none ${
                      errors.candidateEmail 
                        ? 'border-red-500 ring-2 ring-red-500/20' 
                        : 'border-slate-300 focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20'
                    }`}
                  />
                  {errors.candidateEmail && (
                    <span className="text-[9px] text-red-600 font-bold block">{errors.candidateEmail}</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Contact Phone</span>
                  <input
                    type="tel"
                    value={interactive.candidatePhone}
                    onChange={(e) => interactive.setCandidatePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-2 py-1 text-xs text-slate-800 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Date of Birth</span>
                  <input
                    type="date"
                    value={interactive.candidateDob}
                    onChange={(e) => interactive.setCandidateDob(e.target.value)}
                    className="w-full px-2 py-1 text-xs text-slate-800 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="font-extrabold text-slate-900 text-sm">{document.offerDetails.candidateName || '[Candidate Full Name]'}</p>
              <p className="whitespace-pre-line text-slate-700 font-medium">
                {document.offerDetails.candidateAddress || 'Pune, Maharashtra - 411027'}
              </p>
              {document.offerDetails.candidateDob && (
                <p className="font-bold text-slate-900 pt-1">
                  DOB: <span className="font-mono">{document.offerDetails.candidateDob}</span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Salutation & Main Body Paragraphs */}
        <div className="space-y-3.5 text-xs sm:text-[13px] text-slate-800 leading-relaxed pt-2 text-justify">
          <p className="font-bold text-slate-900 text-left">Dear {candidateFirstName},</p>
          
          {isInteractiveForm && interactive ? (
            <div className="space-y-3 text-left">
              <p className="flex flex-wrap items-center gap-1.5 leading-loose">
                <span>We are pleased to appoint you as</span>
                <input
                  type="text"
                  name="jobTitle"
                  value={interactive.jobTitle}
                  onChange={(e) => interactive.setJobTitle(e.target.value)}
                  placeholder="Official Designation / Job Title *"
                  className={`inline-block w-64 px-2 py-1 text-xs sm:text-sm font-extrabold text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border rounded transition-all outline-none ${
                    errors.jobTitle 
                      ? 'border-red-500 ring-2 ring-red-500/20' 
                      : 'border-slate-300 focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20'
                  }`}
                />
                <span>in</span>
                <input
                  type="text"
                  value={interactive.companyName}
                  onChange={(e) => interactive.setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="inline-block w-60 px-2 py-1 text-xs sm:text-sm font-extrabold text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                />
                <span>. During your engagement, you may be deputed at our</span>
                <input
                  type="text"
                  value={interactive.workLocation}
                  onChange={(e) => interactive.setWorkLocation(e.target.value)}
                  placeholder="e.g. Pune Office / Client Onsite"
                  className="inline-block w-52 px-2 py-1 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                />
                <span>. Your assignment with the Company will be Effective from</span>
                <input
                  type="date"
                  name="joiningDate"
                  value={interactive.joiningDate}
                  onChange={(e) => interactive.setJoiningDate(e.target.value)}
                  className={`inline-block w-40 px-2 py-1 text-xs sm:text-sm font-extrabold text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border rounded transition-all outline-none ${
                    errors.joiningDate 
                      ? 'border-red-500 ring-2 ring-red-500/20' 
                      : 'border-slate-300 focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20'
                  }`}
                />
                <span>.</span>
              </p>
            </div>
          ) : (
            <p className="text-justify">
              We are pleased to appoint you as <strong className="text-slate-900 font-extrabold">{document.offerDetails.jobTitle || '[Job Title]'}</strong> in{' '}
              <strong className="text-slate-900 font-extrabold">{currentCompanyName}</strong>. During your engagement, you may be deputed at our{' '}
              <strong className="text-slate-900 font-semibold">{document.offerDetails.workLocation || 'Pune office'}</strong>. Your assignment with the Company will be Effective from{' '}
              <strong className="text-slate-900 font-extrabold">{document.offerDetails.joiningDate || '[Joining Date]'}</strong>.
            </p>
          )}

          <p className="text-justify">
            We are looking forward to a wonderful journey together.
          </p>

          <p className="text-justify">
            We wish you all the best and are very confident that you will successfully deliver your responsibilities.
          </p>
        </div>

        {/* Offer Highlights Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 text-xs">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[#0C2086]">KEY ENGAGEMENT TERMS</span>
            {isInteractiveForm && interactive ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Annual CTC Compensation *:</span>
                <input
                  type="text"
                  name="annualSalary"
                  value={interactive.annualSalary}
                  onChange={(e) => interactive.setAnnualSalary(e.target.value)}
                  placeholder="e.g. 18,50,000 INR"
                  className={`px-2.5 py-1 text-xs font-extrabold text-emerald-800 bg-white border rounded transition-all outline-none ${
                    errors.annualSalary 
                      ? 'border-red-500 ring-2 ring-red-500/20' 
                      : 'border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
            ) : (
              <span className="text-emerald-700 font-extrabold text-sm">{document.offerDetails.annualSalary || '[Annual Salary]'}</span>
            )}
          </div>

          {isInteractiveForm && interactive ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">Department</span>
                <input
                  type="text"
                  value={interactive.department}
                  onChange={(e) => interactive.setDepartment(e.target.value)}
                  placeholder="e.g. PLM Engineering"
                  className="w-full px-2 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                />
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">Reporting Manager</span>
                <input
                  type="text"
                  value={interactive.reportingManager}
                  onChange={(e) => interactive.setReportingManager(e.target.value)}
                  placeholder="e.g. Shantanu Jagtap"
                  className="w-full px-2 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                />
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">Probation Period</span>
                <select
                  value={interactive.probationMonths}
                  onChange={(e) => interactive.setProbationMonths(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20 cursor-pointer"
                >
                  <option value={1}>1 Month</option>
                  <option value={2}>2 Months</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                </select>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">Equity / Stock Units</span>
                <input
                  type="text"
                  value={interactive.equity}
                  onChange={(e) => interactive.setEquity(e.target.value)}
                  placeholder="e.g. 5,000 RSUs"
                  className="w-full px-2 py-1 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                />
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">Sign-on Bonus</span>
                <input
                  type="text"
                  value={interactive.signOnBonus}
                  onChange={(e) => interactive.setSignOnBonus(e.target.value)}
                  placeholder="e.g. 1,00,000 INR"
                  className="w-full px-2 py-1 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                />
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-semibold">Work Arrangement</span>
                <span className="block px-2 py-1 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded">
                  Full-Time Onsite/Hybrid
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 flex flex-col justify-center">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Department</span>
                <span className="font-bold text-slate-900 text-xs sm:text-[13px] mt-0.5">{document.offerDetails.department || 'PLM Engineering'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 flex flex-col justify-center">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Reporting Manager</span>
                <span className="font-bold text-slate-900 text-xs sm:text-[13px] mt-0.5">{document.offerDetails.reportingManager || 'Management'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 flex flex-col justify-center">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Probation Period</span>
                <span className="font-bold text-slate-900 text-xs sm:text-[13px] mt-0.5">{document.offerDetails.probationMonths || 3} Month(s)</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 flex flex-col justify-center">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Work Location</span>
                <span className="font-bold text-slate-900 text-xs sm:text-[13px] mt-0.5">{document.offerDetails.workLocation || 'Pune Office / Hybrid'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sign-off */}
        <div className="pt-4 space-y-1 text-xs text-slate-800">
          <p className="font-medium text-slate-600">Yours truly,</p>
          <p className="font-extrabold text-slate-900">For {currentCompanyName}</p>
          <div className="pt-6">
            <p className="font-bold text-slate-900">{isInteractiveForm ? interactive?.directorName || 'Shantanu Jagtap' : document.offerDetails.directorName || 'Shantanu Jagtap'}</p>
            <p className="text-slate-600 font-medium">{isInteractiveForm ? interactive?.directorTitle || 'Director & VP' : document.offerDetails.directorTitle || 'Director'}</p>
          </div>
        </div>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-6 mt-6 border-t border-slate-200 text-[10px] text-slate-500 italic text-center leading-tight">
          Regd. Office: {currentCompanyName} | {isInteractiveForm ? interactive?.companyAddress || 'G22 Deepmala Pimple Saudagar Pune 411027' : document.companyAddress || 'G22 Deepmala Pimple Saudagar Pune 411027'} | INDIA | Tel: +91 8806060538 | sales@theweplm.com | www.theweplm.com | CIN : U72900PN2021FTC203259
        </div>
      </div>

      {/* PAGE 2: TERMS AND CONDITIONS */}
      <div 
        id="offer-letter-page-2"
        className={`bg-white rounded-lg shadow-xl p-6 sm:p-10 md:p-12 border border-slate-200 relative overflow-hidden flex flex-col justify-between transition-all ${layoutMode === 'grid' ? 'h-full' : ''}`}
      >
        <div className="space-y-6 flex-1">
          {/* Header */}
        <div className="relative flex items-center justify-between pb-4 sm:pb-5 border-b-2 border-slate-900 min-h-[54px] sm:min-h-[60px]">
          <WePlmLogo className="h-8 sm:h-10 md:h-12 w-auto shrink-0 z-10" />
          <div className="absolute inset-x-0 mx-auto text-center pointer-events-none flex flex-col items-center justify-center">
            <h2
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-xs sm:text-base md:text-lg font-serif-headline font-bold text-slate-900 uppercase tracking-wider leading-tight whitespace-nowrap"
            >
              TERMS & CONDITIONS
            </h2>
            <div className="w-8 sm:w-10 h-0.5 bg-[#0C2086] mx-auto mt-1 rounded-full" />
            <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mt-1 truncate max-w-[200px] sm:max-w-none">
              Page 2 of 3 • Ref: {document.documentNumber}
            </p>
          </div>
          <div className="text-right shrink-0 z-10">
            <span className="font-mono text-[10px] sm:text-xs text-slate-700 font-bold bg-slate-100 px-2 sm:px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap">
              Pg 2 of 3
            </span>
          </div>
        </div>

        {/* Candidate Agreement Header */}
        <div className="space-y-2 text-xs text-slate-900">
          <p className="font-bold text-sm">I {currentCandidateName || '[Candidate Full Name]'},</p>
          <p className="font-semibold text-slate-700">Hereby agree to the following terms and conditions:</p>
        </div>

        {/* Terms Bullet Points */}
        <div className="space-y-3 text-xs text-slate-800 leading-relaxed text-justify">
          <div className="flex items-start space-x-2">
            <span className="font-bold text-blue-900 shrink-0 mt-0.5">➢</span>
            <p>
              <strong>Inventory & Asset Management:</strong> During your tenure at {currentCompanyName} or client deputation offices, any electronic devices (including laptops, computer peripherals, headphones, hard disks, mobiles, etc.) must be handled with utmost care and returned in fully operational condition upon request or exit. The ownership of all devices, tools, and consumables remains solely with {currentCompanyName}. In case of loss or damaged inventory, the company retains the right to recover total costs from the employee or withhold final settlements.
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
              <strong>Onsite Deputation & Obligations:</strong> Once deputed onsite or to client locations, you are expected to comply with all legal, statutory, and moral obligations while representing {currentCompanyName} at the highest professional standards.
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
        </div>

        {/* Page 2 Footer */}
        <div className="pt-6 mt-6 border-t border-slate-200 text-[10px] text-slate-500 italic text-center leading-tight">
          Regd. Office: {currentCompanyName} | {isInteractiveForm ? interactive?.companyAddress || 'G22 Deepmala Pimple Saudagar Pune 411027' : document.companyAddress || 'G22 Deepmala Pimple Saudagar Pune 411027'} | INDIA | Tel: +91 8806060538 | sales@theweplm.com | www.theweplm.com | CIN : U72900PN2021FTC203259
        </div>
      </div>

      {/* PAGE 3: TERM, TERMINATION & SIGNATURE EXECUTION */}
      <div 
        id="offer-letter-page-3"
        className={`bg-white rounded-lg shadow-xl p-6 sm:p-10 md:p-12 border border-slate-200 relative overflow-hidden space-y-6 transition-all ${layoutMode === 'grid' ? 'lg:col-span-1' : ''}`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between pb-4 sm:pb-5 border-b-2 border-slate-900 min-h-[54px] sm:min-h-[60px]">
          <WePlmLogo className="h-8 sm:h-10 md:h-12 w-auto shrink-0 z-10" />
          <div className="absolute inset-x-0 mx-auto text-center pointer-events-none flex flex-col items-center justify-center">
            <h2
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-xs sm:text-base md:text-lg font-serif-headline font-bold text-slate-900 uppercase tracking-wider leading-tight whitespace-nowrap"
            >
              EXECUTION & ACCEPTANCE
            </h2>
            <div className="w-8 sm:w-10 h-0.5 bg-[#0C2086] mx-auto mt-1 rounded-full" />
            <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mt-1 truncate max-w-[200px] sm:max-w-none">
              Page 3 of 3 • Ref: {document.documentNumber}
            </p>
          </div>
          <div className="text-right shrink-0 z-10">
            <span className="font-mono text-[10px] sm:text-xs text-slate-700 font-bold bg-slate-100 px-2 sm:px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap">
              Pg 3 of 3
            </span>
          </div>
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
              <strong>Confidentiality & Non-Disclosure:</strong> You shall not disclose any proprietary or confidential information of {currentCompanyName} to third parties. All intellectual property generated during your employment belongs exclusively to the Company.
            </p>
          </div>
        </div>

        {/* Candidate Acceptance Header */}
        <div className="pt-4 border-t border-slate-200 space-y-1">
          <h3 className="font-extrabold text-slate-900 text-sm">Acceptance</h3>
          <p className="text-xs font-semibold text-slate-700">I agree to abide by the terms of the Engagement Letter</p>
          <p className="text-xs font-bold text-slate-900 pt-1">{currentCandidateName || '[Candidate Full Name]'}</p>
        </div>

        {/* Director Authorization Section (if 3 Signatures) */}
        {signatureCount === 3 && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 text-amber-700">
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Director / Authorized Signer (3rd Signatory)</span>
              </h4>
              <span className="text-[10px] bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">
                Signing Authority #3
              </span>
            </div>

            {isInteractiveForm && interactive ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Director Full Name *</span>
                  <input
                    type="text"
                    value={interactive.directorName}
                    onChange={(e) => interactive.setDirectorName(e.target.value)}
                    placeholder="e.g. Shantanu Jagtap"
                    className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Official Designation *</span>
                  <input
                    type="text"
                    value={interactive.directorTitle}
                    onChange={(e) => interactive.setDirectorTitle(e.target.value)}
                    placeholder="e.g. Director & VP"
                    className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-500 block font-semibold">Director Email *</span>
                  <input
                    type="email"
                    name="directorEmail"
                    value={interactive.directorEmail}
                    onChange={(e) => interactive.setDirectorEmail(e.target.value)}
                    placeholder="director@weplm.com"
                    className={`w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border rounded transition-all outline-none ${
                      errors.directorEmail 
                        ? 'border-red-500 ring-2 ring-red-500/20' 
                        : 'border-slate-300 focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20'
                    }`}
                  />
                  {errors.directorEmail && (
                    <span className="text-[9px] text-red-600 font-bold block">{errors.directorEmail}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[10px]">Director Name:</span>
                  <span className="font-bold text-slate-900">{document.offerDetails.directorName || 'Shantanu Jagtap'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Designation:</span>
                  <span className="font-bold text-slate-900">{document.offerDetails.directorTitle || 'Director & VP'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* eSignature Execution Grid */}
        <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Candidate Signature Box */}
          <div
            onClick={() => isCandidateView && !isCandidateSigned && onOpenSignModal && onOpenSignModal()}
            className={`border-2 rounded-xl p-4 flex flex-col justify-between transition-all ${
              isCandidateSigned
                ? 'border-emerald-500 bg-emerald-50/70'
                : isCandidateView
                ? 'border-dashed border-blue-500 bg-blue-50/60 hover:bg-blue-100/70 cursor-pointer shadow-sm'
                : 'border-dashed border-slate-300 bg-slate-50'
            }`}
          >
            <div className="mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">CANDIDATE eSIGNATURE</span>
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
              <div className="py-5 text-center space-y-1">
                <PenTool className={`h-6 w-6 mx-auto ${isCandidateView ? 'text-blue-600 opacity-90' : 'text-slate-400 opacity-60'}`} />
                <p className={`text-xs font-bold whitespace-nowrap truncate ${isCandidateView ? 'text-blue-700' : 'text-slate-500'}`}>
                  {isCandidateView ? 'Click to eSign' : 'Pending Signature'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {isInteractiveForm ? interactive?.candidateEmail || 'candidate@email.com' : document.candidateEmail}
                </p>
              </div>
            )}

            {/* Bottom Full-Width Badge */}
            <div className="mt-3 pt-2 border-t border-slate-200/60">
              {isCandidateSigned ? (
                <span className="w-full block text-center text-[10px] font-bold text-emerald-700 bg-emerald-100 py-1 rounded border border-emerald-300 font-mono">
                  VERIFIED eSIGN
                </span>
              ) : isCandidateView ? (
                <span className="w-full block text-center text-[10px] font-bold text-blue-700 bg-blue-100 py-1 rounded animate-pulse border border-blue-300 font-mono">
                  CLICK TO SIGN
                </span>
              ) : (
                <span className="w-full block text-center text-[10px] font-medium text-slate-500 bg-slate-200 py-1 rounded font-mono">
                  PENDING
                </span>
              )}
            </div>
          </div>

          {/* HR Representative Counter-Signature Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
            <div className="mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">HR AUTHORIZED SIGNER</span>
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
              <div className="py-5 text-center text-slate-400 space-y-1">
                <ShieldCheck className="h-6 w-6 mx-auto opacity-50" />
                <p className="text-xs font-semibold text-slate-600 whitespace-nowrap truncate">
                  Pending Counter-Sign
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {isInteractiveForm ? interactive?.hrHeadEmail || 'hr@theweplm.com' : document.hrHeadEmail}
                </p>
              </div>
            )}

            {/* Bottom Full-Width Badge */}
            <div className="mt-3 pt-2 border-t border-slate-200/60">
              <span className={`w-full block text-center text-[10px] font-bold py-1 rounded font-mono ${
                isHRSigned ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-200 text-slate-600'
              }`}>
                {isHRSigned ? 'COUNTERSIGNED' : 'PENDING COUNTERSIGN'}
              </span>
            </div>
          </div>

        </div>

        {/* Executive Dispatch & Verification Routing Section */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0C2086]" />
              <span>Executive Dispatch & Verification Routing</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">Corporate Authority</span>
          </div>

          {isInteractiveForm && interactive ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">HR Head Full Name *</span>
                <input
                  type="text"
                  value={interactive.hrHeadName}
                  onChange={(e) => interactive.setHrHeadName(e.target.value)}
                  placeholder="e.g. Sonal Singh"
                  className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">HR Head Dispatch Email *</span>
                <input
                  type="email"
                  name="hrHeadEmail"
                  value={interactive.hrHeadEmail}
                  onChange={(e) => interactive.setHrHeadEmail(e.target.value)}
                  placeholder="hr@theweplm.com"
                  className={`w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border rounded transition-all outline-none ${
                    errors.hrHeadEmail 
                      ? 'border-red-500 ring-2 ring-red-500/20' 
                      : 'border-slate-300 focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20'
                  }`}
                />
                {errors.hrHeadEmail && (
                  <span className="text-[9px] text-red-600 font-bold block">{errors.hrHeadEmail}</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">CTO Full Name *</span>
                <input
                  type="text"
                  value={interactive.ctoName}
                  onChange={(e) => interactive.setCtoName(e.target.value)}
                  placeholder="e.g. Shantanu Jagtap"
                  className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded transition-all outline-none focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">CTO Dispatch Email *</span>
                <input
                  type="email"
                  name="ctoEmail"
                  value={interactive.ctoEmail}
                  onChange={(e) => interactive.setCtoEmail(e.target.value)}
                  placeholder="cto@theweplm.com"
                  className={`w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border rounded transition-all outline-none ${
                    errors.ctoEmail 
                      ? 'border-red-500 ring-2 ring-red-500/20' 
                      : 'border-slate-300 focus:border-[#0C2086] focus:ring-2 focus:ring-[#0C2086]/20'
                  }`}
                />
                {errors.ctoEmail && (
                  <span className="text-[9px] text-red-600 font-bold block">{errors.ctoEmail}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-500 block text-[10px]">HR Head Email:</span>
                <span className="font-mono text-slate-900 font-bold">{document.hrHeadEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">CTO Email:</span>
                <span className="font-mono text-slate-900 font-bold">{document.ctoEmail}</span>
              </div>
            </div>
          )}
        </div>

        {/* Watermark Security Seal */}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
          <span>SignCorp eSignature Engine • ESIGN & eIDAS Verified</span>
          <span className="font-mono">SHA-256 AUDIT STAMP: {document.sha256Checksum?.slice(0, 16) || 'SECURE'}...</span>
        </div>

        {/* Page 3 Footer */}
        <div className="pt-4 text-[10px] text-slate-500 italic text-center leading-tight">
          Regd. Office: {currentCompanyName} | {isInteractiveForm ? interactive?.companyAddress || 'G22 Deepmala Pimple Saudagar Pune 411027' : document.companyAddress || 'G22 Deepmala Pimple Saudagar Pune 411027'} | INDIA | Tel: +91 8806060538 | sales@theweplm.com | www.theweplm.com | CIN : U72900PN2021FTC203259
        </div>

      </div>

    </div>
  );
};
