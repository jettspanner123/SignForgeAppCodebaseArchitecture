import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Send, 
  Sparkles,
  ShieldCheck,
  FileText,
  UserCheck,
  Upload
} from 'lucide-react';
import { OfferDocument, OfferDetails } from '../Types';
import { generateUUID, generateDocNumber, getSimulatedIP, generateSHA256 } from '../utils/crypto';
import { OfferLetterPaper } from './OfferLetterPaper';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import InputSharedComponent from '../Shared/Components/InputSharedComponent';
import { motion } from 'motion/react';

interface DocumentEditorProps {
  initialDocument?: OfferDocument | null;
  onSaveAndSend: (doc: OfferDocument) => void;
  onCancel: () => void;
  onSwitchToUpload?: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  initialDocument, 
  onSaveAndSend, 
  onCancel, 
  onSwitchToUpload 
}) => {
  const isEditing = !!initialDocument;

  const [documentType, setDocumentType] = useState<'OFFER_LETTER' | 'JOINING_LETTER'>(
    initialDocument?.documentType || 'OFFER_LETTER'
  );
  const [signatureCount, setSignatureCount] = useState<2 | 3>(
    initialDocument?.signatureCount || 2
  );

  const [companyName, setCompanyName] = useState(
    initialDocument?.companyName || ''
  );
  const [companyAddress, setCompanyAddress] = useState(
    initialDocument?.companyAddress || ''
  );
  const [candidateName, setCandidateName] = useState(
    initialDocument?.offerDetails.candidateName || ''
  );
  const [candidateEmail, setCandidateEmail] = useState(
    initialDocument?.offerDetails.candidateEmail || ''
  );
  const [candidatePhone, setCandidatePhone] = useState(
    initialDocument?.offerDetails.candidatePhone || ''
  );
  const [candidateDob, setCandidateDob] = useState(
    initialDocument?.offerDetails.candidateDob || ''
  );
  const [candidateAddress, setCandidateAddress] = useState(
    initialDocument?.offerDetails.candidateAddress || ''
  );
  
  const [jobTitle, setJobTitle] = useState(
    initialDocument?.offerDetails.jobTitle || ''
  );
  const [department, setDepartment] = useState(
    initialDocument?.offerDetails.department || ''
  );
  const [annualSalary, setAnnualSalary] = useState(
    initialDocument?.offerDetails.annualSalary || ''
  );
  const [joiningDate, setJoiningDate] = useState(
    initialDocument?.offerDetails.joiningDate || ''
  );
  const [workLocation, setWorkLocation] = useState(
    initialDocument?.offerDetails.workLocation || ''
  );
  const [reportingManager, setReportingManager] = useState(
    initialDocument?.offerDetails.reportingManager || ''
  );
  const [probationMonths, setProbationMonths] = useState(
    initialDocument?.offerDetails.probationMonths || 3
  );
  const [equityUnits, setEquityUnits] = useState(
    initialDocument?.offerDetails.equityUnits || ''
  );
  const [signOnBonus, setSignOnBonus] = useState(
    initialDocument?.offerDetails.signOnBonus || ''
  );

  // Director / Company Signer details for 3 signatures
  const [directorName, setDirectorName] = useState(
    initialDocument?.offerDetails.directorName || ''
  );
  const [directorTitle, setDirectorTitle] = useState(
    initialDocument?.offerDetails.directorTitle || ''
  );
  const [directorEmail, setDirectorEmail] = useState(
    initialDocument?.offerDetails.directorEmail || ''
  );

  // Executive Contacts for automatic notification once all sign
  const [hrHeadName, setHrHeadName] = useState(
    initialDocument?.executives?.hrHead?.name || ''
  );
  const [hrHeadEmail, setHrHeadEmail] = useState(
    initialDocument?.executives?.hrHead?.email || ''
  );
  const [ctoName, setCtoName] = useState(
    initialDocument?.executives?.cto?.name || ''
  );
  const [ctoEmail, setCtoEmail] = useState(
    initialDocument?.executives?.cto?.email || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDocTypeChange = (type: 'OFFER_LETTER' | 'JOINING_LETTER') => {
    setDocumentType(type);
  };

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const now = new Date().toISOString();
    const ip = getSimulatedIP();

    const offerDetails: OfferDetails = {
      candidateName,
      candidateEmail,
      candidatePhone,
      candidateDob,
      candidateAddress,
      jobTitle,
      department,
      annualSalary,
      joiningDate,
      workLocation,
      reportingManager,
      probationMonths,
      equityUnits,
      signOnBonus,
      directorName,
      directorTitle,
      directorEmail
    };

    const docTitle = documentType === 'JOINING_LETTER' 
      ? `Joining Letter — ${jobTitle} (${candidateName})`
      : `Offer Letter — ${jobTitle} (${candidateName})`;

    if (isEditing && initialDocument) {
      const updateChecksum = await generateSHA256(`UPDATED-${initialDocument.documentNumber}-${candidateName}-${now}`);
      
      const updatedDoc: OfferDocument = {
        ...initialDocument,
        title: docTitle,
        documentType,
        signatureCount,
        companyName,
        companyAddress,
        offerDetails,
        updatedAt: now,
        executives: {
          ...initialDocument.executives,
          hrHead: {
            name: hrHeadName,
            role: 'HR_HEAD',
            email: hrHeadEmail,
            status: initialDocument.executives.hrHead.status
          },
          cto: {
            name: ctoName,
            role: 'CTO',
            email: ctoEmail,
            status: initialDocument.executives.cto.status
          }
        },
        auditTrail: [
          ...initialDocument.auditTrail,
          {
            id: generateUUID(),
            timestamp: now,
            action: 'Offer Details Updated by Admin',
            actor: 'HR Admin (ananya.sharma@theweplm.com)',
            actorRole: 'HR Administrator',
            ipAddress: ip,
            details: `Updated offer parameters for ${candidateName} (${jobTitle}, Salary: ${annualSalary})`,
            checksum: updateChecksum
          }
        ]
      };

      setTimeout(() => {
        onSaveAndSend(updatedDoc);
        setIsSubmitting(false);
      }, 300);
      return;
    }

    const docId = generateUUID();
    const docPrefix = documentType === 'JOINING_LETTER' ? 'JOIN' : 'OFF';
    const docNum = generateDocNumber(docPrefix);

    const initialChecksum = await generateSHA256(`${docNum}-${candidateName}-${jobTitle}-${now}`);

    const newDoc: OfferDocument = {
      id: docId,
      documentNumber: docNum,
      documentType,
      signatureCount,
      title: docTitle,
      status: 'OUT_FOR_CANDIDATE_SIGN',
      createdAt: now,
      updatedAt: now,
      createdBy: 'HR Talent Acquisition (admin@signcorp.com)',
      companyName,
      companyAddress,
      offerDetails,
      executives: {
        hrHead: {
          name: hrHeadName,
          role: 'HR_HEAD',
          email: hrHeadEmail,
          status: 'NOT_SENT'
        },
        cto: {
          name: ctoName,
          role: 'CTO',
          email: ctoEmail,
          status: 'NOT_SENT'
        },
        director: signatureCount === 3 ? {
          name: directorName,
          role: 'DIRECTOR',
          email: directorEmail,
          status: 'SENT_SUCCESSFULLY',
          notifiedAt: now
        } : undefined
      },
      directorSignature: signatureCount === 3 ? {
        type: 'TYPE',
        value: directorName,
        fontFamily: 'Great Vibes',
        signedBy: `${directorName} (${directorTitle})`,
        email: directorEmail,
        role: 'DIRECTOR',
        timestamp: now,
        ipAddress: ip,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        sha256Hash: initialChecksum
      } : undefined,
      fields: signatureCount === 3 ? [
        {
          id: 'f-dir-sig',
          type: 'DIRECTOR_SIGNATURE',
          label: 'Director Authorization Signature',
          page: 1,
          xPercent: 10,
          yPercent: 75,
          required: true
        },
        {
          id: 'f-cand-sig',
          type: 'CANDIDATE_SIGNATURE',
          label: 'Candidate Acceptance Signature',
          page: 3,
          xPercent: 10,
          yPercent: 78,
          required: true
        },
        {
          id: 'f-hr-sig',
          type: 'HR_SIGNATURE',
          label: 'HR Counter-Signature',
          page: 3,
          xPercent: 55,
          yPercent: 78,
          required: true
        }
      ] : [
        {
          id: 'f-cand-sig',
          type: 'CANDIDATE_SIGNATURE',
          label: 'Candidate Signature',
          page: 1,
          xPercent: 10,
          yPercent: 78,
          required: true
        },
        {
          id: 'f-hr-sig',
          type: 'HR_SIGNATURE',
          label: 'HR Representative Signature',
          page: 1,
          xPercent: 55,
          yPercent: 78,
          required: true
        }
      ],
      auditTrail: [
        {
          id: generateUUID(),
          timestamp: now,
          action: `${documentType === 'JOINING_LETTER' ? 'Joining Letter' : 'Offer Letter'} Created (${signatureCount} eSignatures)`,
          actor: 'HR Admin (admin@signcorp.com)',
          actorRole: 'HR Representative',
          ipAddress: ip,
          details: `Generated ${documentType} for ${candidateName} with ${signatureCount} eSign roles required`,
          checksum: initialChecksum
        },
        ...(signatureCount === 3 ? [{
          id: generateUUID(),
          timestamp: now,
          action: 'Director Pre-Authorization Applied',
          actor: `${directorName} (${directorEmail})`,
          actorRole: 'Director',
          ipAddress: ip,
          details: `Director ${directorName} pre-signed ${documentType}`,
          checksum: initialChecksum
        }] : []),
        {
          id: generateUUID(),
          timestamp: now,
          action: 'Issued & Sent to Candidate',
          actor: 'HR Admin System',
          actorRole: 'System Dispatcher',
          ipAddress: ip,
          details: `Dispatched eSign link to ${candidateEmail}`,
          checksum: initialChecksum
        }
      ]
    };

    setTimeout(() => {
      onSaveAndSend(newDoc);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      
      {/* 1. Standard Page Header (No Card, with bottom divider matching /documents) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-headline tracking-tight text-slate-900 dark:text-zinc-100">
            {isEditing ? `Edit Offer Document: ${initialDocument?.documentNumber}` : 'Create Enterprise Employment Offer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            {isEditing 
              ? 'Update salary, designation, candidate information, and executive dispatch emails.'
              : 'Configure offer letter details, recipient candidate email, and executive routing (HR Head & CTO).'
            }
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {!isEditing && onSwitchToUpload && (
            <PrimaryActionButtonSharedComponent
              label="Upload PDF Instead"
              onClick={onSwitchToUpload}
              icon={<Upload className="w-3.5 h-3.5 !text-white" />}
            />
          )}
        </div>
      </div>

      <form onSubmit={handleIssueOffer} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left Column: Form Fields (Single Unified Card Container 1:1 AssetSphere) */}
        <div className="w-full">
          <div className="rounded-xl bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 shadow-xs p-6 space-y-8">
            
            {/* Section 0: Document Type & eSignature Setup */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <FileText className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                <span>Document Type & eSignature Workflow</span>
              </h4>

              <div className="space-y-4">
                {/* Line 1: Document Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Document Type
                  </label>
                  <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-9 w-full">
                    <button
                      type="button"
                      onClick={() => handleDocTypeChange('OFFER_LETTER')}
                      className="relative flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 h-7 rounded-md text-xs font-medium transition-colors cursor-pointer select-none"
                    >
                      {documentType === 'OFFER_LETTER' && (
                        <motion.div
                          layoutId="activeDocType"
                          className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-md shadow-xs"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className={`relative z-10 flex items-center gap-1.5 ${
                        documentType === 'OFFER_LETTER'
                          ? 'text-[#0C2086] dark:text-white font-bold'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}>
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate">Offer Letter Package (Full Terms)</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDocTypeChange('JOINING_LETTER')}
                      className="relative flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 h-7 rounded-md text-xs font-medium transition-colors cursor-pointer select-none"
                    >
                      {documentType === 'JOINING_LETTER' && (
                        <motion.div
                          layoutId="activeDocType"
                          className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-md shadow-xs"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className={`relative z-10 flex items-center gap-1.5 ${
                        documentType === 'JOINING_LETTER'
                          ? 'text-[#0C2086] dark:text-white font-bold'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}>
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate">Joining Letter & Appointment</span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Line 2: Required eSignature Workflow */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Required eSignature Workflow
                  </label>
                  <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-9 w-full">
                    <button
                      type="button"
                      onClick={() => setSignatureCount(2)}
                      className="relative flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 h-7 rounded-md text-xs font-medium transition-colors cursor-pointer select-none"
                    >
                      {signatureCount === 2 && (
                        <motion.div
                          layoutId="activeSigWorkflow"
                          className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-md shadow-xs"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className={`relative z-10 flex items-center gap-1.5 ${
                        signatureCount === 2
                          ? 'text-[#0C2086] dark:text-white font-bold'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="truncate">2 Signatures (Candidate + HR)</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureCount(3)}
                      className="relative flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 h-7 rounded-md text-xs font-medium transition-colors cursor-pointer select-none"
                    >
                      {signatureCount === 3 && (
                        <motion.div
                          layoutId="activeSigWorkflow"
                          className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-md shadow-xs"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className={`relative z-10 flex items-center gap-1.5 ${
                        signatureCount === 3
                          ? 'text-[#0C2086] dark:text-white font-bold'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="truncate">3 Signatures (Director + Candidate + HR)</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Candidate & Entity Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <User className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                <span>1. Candidate & Entity Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputSharedComponent
                  label="Candidate Full Name *"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Uddeshya Singh"
                />

                <InputSharedComponent
                  label="Candidate Email *"
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="e.g. candidate@example.com"
                />

                <InputSharedComponent
                  label="Date of Birth (DOB)"
                  value={candidateDob}
                  onChange={(e) => setCandidateDob(e.target.value)}
                  placeholder="e.g. 16/09/2003"
                />

                <InputSharedComponent
                  label="Phone Number"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                />

                <div className="sm:col-span-2">
                  <InputSharedComponent
                    label="Candidate Full Address"
                    value={candidateAddress}
                    onChange={(e) => setCandidateAddress(e.target.value)}
                    placeholder="Street, City, State, Pincode"
                  />
                </div>

                <InputSharedComponent
                  label="Issuing Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. We.PLM India (P) Ltd."
                />

                <InputSharedComponent
                  label="Registered Office Address / Tel"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="e.g. Pune, Maharashtra / +91-20-4100..."
                />
              </div>
            </div>

            {/* Director Authorization Sub-Section if 3 Signatures */}
            {signatureCount === 3 && (
              <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Director / Authorized Signer (3rd Signatory)</span>
                  </h4>
                  <span className="text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-300">
                    Signing Authority #3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputSharedComponent
                    label="Director Full Name *"
                    required={signatureCount === 3}
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    placeholder="e.g. Shantanu Jagtap"
                  />

                  <InputSharedComponent
                    label="Official Designation *"
                    required={signatureCount === 3}
                    value={directorTitle}
                    onChange={(e) => setDirectorTitle(e.target.value)}
                    placeholder="e.g. Director & VP"
                  />

                  <InputSharedComponent
                    label="Director Email *"
                    type="email"
                    required={signatureCount === 3}
                    value={directorEmail}
                    onChange={(e) => setDirectorEmail(e.target.value)}
                    placeholder="e.g. director@weplm.com"
                  />
                </div>
              </div>
            )}

            {/* Section 2: Position & Compensation Terms */}
            <div className="space-y-4 mt-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <Briefcase className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                <span>2. Position & Compensation Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputSharedComponent
                  label="Job Designation / Title *"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Lead PLM Solutions Architect"
                />

                <InputSharedComponent
                  label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Enterprise PLM Practice"
                />

                <InputSharedComponent
                  label="Annual Compensation (CTC) *"
                  required
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  placeholder="e.g. ₹34,50,000 CTC"
                />

                <InputSharedComponent
                  label="Joining Date *"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  placeholder="e.g. 2026-10-15"
                />

                <InputSharedComponent
                  label="Work Location"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="e.g. Bengaluru / Hybrid"
                />

                <InputSharedComponent
                  label="Reporting Manager"
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                  placeholder="e.g. Rajesh K. Mehta (VP Tech)"
                />

                <InputSharedComponent
                  label="Equity / RSUs (Optional)"
                  value={equityUnits}
                  onChange={(e) => setEquityUnits(e.target.value)}
                  placeholder="e.g. 5,000 RSUs"
                />

                <InputSharedComponent
                  label="Sign-On Bonus (Optional)"
                  value={signOnBonus}
                  onChange={(e) => setSignOnBonus(e.target.value)}
                  placeholder="e.g. ₹2,00,000"
                />
              </div>
            </div>

            {/* Section 3: Executive Dispatch Routing */}
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                  <span>3. Executive Dispatch Routing</span>
                </h4>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono hidden sm:inline">
                  Auto-Encrypted PDF Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-mono">
                      HR Head Routing
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                      Executive #1
                    </span>
                  </div>

                  <InputSharedComponent
                    label="HR Head Name"
                    value={hrHeadName}
                    onChange={(e) => setHrHeadName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                  />

                  <InputSharedComponent
                    label="HR Head Email *"
                    type="email"
                    required
                    value={hrHeadEmail}
                    onChange={(e) => setHrHeadEmail(e.target.value)}
                    placeholder="e.g. s.jenkins@weplm.com"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-mono">
                      CTO Routing
                    </span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold">
                      Executive #2
                    </span>
                  </div>

                  <InputSharedComponent
                    label="CTO Name"
                    value={ctoName}
                    onChange={(e) => setCtoName(e.target.value)}
                    placeholder="e.g. David Miller"
                  />

                  <InputSharedComponent
                    label="CTO Email *"
                    type="email"
                    required
                    value={ctoEmail}
                    onChange={(e) => setCtoEmail(e.target.value)}
                    placeholder="e.g. d.miller@weplm.com"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-end">
              <PrimaryActionButtonSharedComponent
                type="submit"
                label={isEditing ? 'Update Offer' : 'Issue Offer'}
                icon={<Send className="w-3.5 h-3.5 !text-white" />}
                isLoading={isSubmitting}
                loadingText={isEditing ? 'Updating...' : 'Dispatching...'}
              />
            </div>

          </div>
        </div>

        {/* Right Column: Live Document Preview (50-50) */}
        <div className="w-full">
          <div className="sticky top-24">
            {/* Document Paper Mockup using exact We.PLM Joining/Offer Letter format */}
            <div className="max-h-[780px] overflow-y-auto pr-2 rounded-lg border border-slate-700 dark:border-zinc-800 bg-slate-900/50 p-2">
              <OfferLetterPaper
                document={{
                  id: 'preview-draft',
                  documentNumber: initialDocument?.documentNumber || 'WE-PLM-2026-001',
                  companyName: companyName || 'We.PLM Global Technologies (P) Ltd.',
                  documentType: documentType,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  status: 'OUT_FOR_CANDIDATE_SIGN',
                  auditTrail: [],
                  sha256Checksum: 'PREVIEW-DRAFT-CHECKSUM',
                  executives: {
                    hrHead: { name: hrHeadName || 'HR Head', email: hrHeadEmail || 'hr@theweplm.com', title: 'HR Head', status: 'PENDING_TRIGGER' },
                    cto: { name: ctoName || 'CTO', email: ctoEmail || 'cto@theweplm.com', title: 'CTO', status: 'PENDING_TRIGGER' }
                  },
                  offerDetails: {
                    candidateName: candidateName || 'Candidate Full Name',
                    candidateEmail: candidateEmail || 'candidate@example.com',
                    candidateAddress: candidateAddress || 'Candidate Residential Address',
                    candidateDob: candidateDob || 'DD/MM/YYYY',
                    jobTitle: jobTitle || 'Designation / Job Title',
                    department: department || 'Department',
                    annualSalary: annualSalary || 'Annual Compensation',
                    joiningDate: joiningDate || 'Joining Date',
                    workLocation: workLocation || 'Work Location',
                    reportingManager: reportingManager || 'Reporting Manager',
                    probationMonths: probationMonths || 3,
                    equityUnits: equityUnits || '',
                    signOnBonus: signOnBonus || '',
                    directorName: directorName || 'Director Full Name',
                    directorTitle: directorTitle || 'Director'
                  }
                }}
                isPreview={true}
              />
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};
