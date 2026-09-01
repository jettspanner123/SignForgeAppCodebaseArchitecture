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
    initialDocument?.companyName || 'We.PLM Global Technologies (P) Ltd.'
  );
  const [companyAddress, setCompanyAddress] = useState(
    initialDocument?.companyAddress || 'G22 Deepmala Pimple Saudagar Pune 411027 | Tel: +91 8806060538'
  );
  const [candidateName, setCandidateName] = useState(
    initialDocument?.offerDetails.candidateName || 'Aarav Deshmukh'
  );
  const [candidateEmail, setCandidateEmail] = useState(
    initialDocument?.offerDetails.candidateEmail || 'aarav.deshmukh@example.in'
  );
  const [candidatePhone, setCandidatePhone] = useState(
    initialDocument?.offerDetails.candidatePhone || '+91 98230 11223'
  );
  const [candidateDob, setCandidateDob] = useState(
    initialDocument?.offerDetails.candidateDob || '16/09/2003'
  );
  const [candidateAddress, setCandidateAddress] = useState(
    initialDocument?.offerDetails.candidateAddress || 'C-49 Dadhichi Nagar, Near Krishna Dental Hospital, Murlipura, Jaipur, Rajasthan - 302039'
  );
  
  const [jobTitle, setJobTitle] = useState(
    initialDocument?.offerDetails.jobTitle || 'Senior Enterprise Infrastructure Consultant'
  );
  const [department, setDepartment] = useState(
    initialDocument?.offerDetails.department || 'Enterprise PLM & Cloud Integration'
  );
  const [annualSalary, setAnnualSalary] = useState(
    initialDocument?.offerDetails.annualSalary || '₹18,50,000 INR (€95,000 EUR)'
  );
  const [joiningDate, setJoiningDate] = useState(
    initialDocument?.offerDetails.joiningDate || '20th August 2026'
  );
  const [workLocation, setWorkLocation] = useState(
    initialDocument?.offerDetails.workLocation || 'Pune Innovation Hub / Amsterdam Deputation'
  );
  const [reportingManager, setReportingManager] = useState(
    initialDocument?.offerDetails.reportingManager || 'Shantanu Jagtap (Director)'
  );
  const [probationMonths, setProbationMonths] = useState(
    initialDocument?.offerDetails.probationMonths || 3
  );
  const [equityUnits, setEquityUnits] = useState(
    initialDocument?.offerDetails.equityUnits || '12,000 RSUs'
  );
  const [signOnBonus, setSignOnBonus] = useState(
    initialDocument?.offerDetails.signOnBonus || '₹2,50,000 INR'
  );

  // Director / Company Signer details for 3 signatures
  const [directorName, setDirectorName] = useState(
    initialDocument?.offerDetails.directorName || 'Shantanu Jagtap'
  );
  const [directorTitle, setDirectorTitle] = useState(
    initialDocument?.offerDetails.directorTitle || 'Director'
  );
  const [directorEmail, setDirectorEmail] = useState(
    initialDocument?.offerDetails.directorEmail || 'shantanu.jagtap@theweplm.com'
  );

  // Executive Contacts for automatic notification once all sign
  const [hrHeadName, setHrHeadName] = useState(
    initialDocument?.executives?.hrHead?.name || 'Ananya Sharma'
  );
  const [hrHeadEmail, setHrHeadEmail] = useState(
    initialDocument?.executives?.hrHead?.email || 'ananya.sharma@theweplm.com'
  );
  const [ctoName, setCtoName] = useState(
    initialDocument?.executives?.cto?.name || 'Jean-Luc Dubois'
  );
  const [ctoEmail, setCtoEmail] = useState(
    initialDocument?.executives?.cto?.email || 'jeanluc.dubois@theweplm.eu'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // When changing document type to Joining Letter, default signatureCount to 3
  const handleDocTypeChange = (type: 'OFFER_LETTER' | 'JOINING_LETTER') => {
    setDocumentType(type);
    if (type === 'JOINING_LETTER') {
      setSignatureCount(3);
      if (jobTitle === 'Staff Software Engineer — Distributed Systems') {
        setJobTitle('Junior Infrastructure Consultant');
      }
    }
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {isEditing ? 'EDIT OFFER DETAILS' : 'OFFER CREATION STUDIO'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isEditing ? `Modifying #${initialDocument?.documentNumber}` : 'Step 1 of 3: Draft & Configure Routing'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
            {isEditing ? `Edit Offer Document: ${initialDocument?.documentNumber}` : 'Create Enterprise Employment Offer'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isEditing 
              ? 'Update salary, designation, candidate information, and executive dispatch emails.'
              : 'Configure offer letter details, recipient candidate email, and executive routing (HR Head & CTO).'
            }
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {!isEditing && onSwitchToUpload && (
            <button
              type="button"
              onClick={onSwitchToUpload}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-colors"
            >
              <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Upload External PDF Offer Instead</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleIssueOffer} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 0: Document Type & eSignature Configuration */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center space-x-2 pb-2 border-b border-blue-700/50">
              <FileText className="h-5 w-5 text-blue-300" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-100">Document Type & eSignature Setup</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document Type */}
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-2">Document Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDocTypeChange('OFFER_LETTER')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      documentType === 'OFFER_LETTER'
                        ? 'bg-blue-500 text-white border-blue-400 shadow'
                        : 'bg-blue-950/60 text-blue-200 border-blue-700/50 hover:bg-blue-900'
                    }`}
                  >
                    Offer Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDocTypeChange('JOINING_LETTER')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      documentType === 'JOINING_LETTER'
                        ? 'bg-blue-500 text-white border-blue-400 shadow'
                        : 'bg-blue-950/60 text-blue-200 border-blue-700/50 hover:bg-blue-900'
                    }`}
                  >
                    Joining Letter
                  </button>
                </div>
              </div>

              {/* Signature Count */}
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-2">Required eSignature Workflow *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignatureCount(2)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      signatureCount === 2
                        ? 'bg-indigo-500 text-white border-indigo-400 shadow'
                        : 'bg-blue-950/60 text-blue-200 border-blue-700/50 hover:bg-blue-900'
                    }`}
                  >
                    2 Signatures (Candidate + HR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureCount(3)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      signatureCount === 3
                        ? 'bg-indigo-500 text-white border-indigo-400 shadow'
                        : 'bg-blue-950/60 text-blue-200 border-blue-700/50 hover:bg-blue-900'
                    }`}
                  >
                    3 Signatures (Director + Candidate + HR)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Candidate Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 text-blue-600 pb-2 border-b border-slate-200">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Candidate Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Candidate Email *</label>
                <input
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth (DOB)</label>
                <input
                  type="text"
                  placeholder="e.g. 16/09/2003"
                  value={candidateDob}
                  onChange={(e) => setCandidateDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Candidate Full Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State, Pincode"
                  value={candidateAddress}
                  onChange={(e) => setCandidateAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Issuing Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Registered Office Address / Tel</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Director Authorization Section if 3 Signatures */}
          {signatureCount === 3 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 text-amber-800 pb-2 border-b border-amber-200">
                <UserCheck className="h-5 w-5 text-amber-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Director / Authorized Signer (3rd Signatory)</h2>
                  <p className="text-[11px] text-amber-800 font-normal">Signs on the Joining / Offer Letter along with Candidate and HR</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Director Full Name *</label>
                  <input
                    type="text"
                    required={signatureCount === 3}
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Official Designation *</label>
                  <input
                    type="text"
                    required={signatureCount === 3}
                    value={directorTitle}
                    onChange={(e) => setDirectorTitle(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Director Email *</label>
                  <input
                    type="email"
                    required={signatureCount === 3}
                    value={directorEmail}
                    onChange={(e) => setDirectorEmail(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Position & Compensation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 text-indigo-600 pb-2 border-b border-slate-200">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Position & Compensation Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Job Designation / Title *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Annual Compensation (CTC) *</label>
                <input
                  type="text"
                  required
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Joining Date *</label>
                <input
                  type="text"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Location</label>
                <input
                  type="text"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Reporting Manager</label>
                <input
                  type="text"
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Equity / RSUs (Optional)</label>
                <input
                  type="text"
                  value={equityUnits}
                  onChange={(e) => setEquityUnits(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sign-On Bonus (Optional)</label>
                <input
                  type="text"
                  value={signOnBonus}
                  onChange={(e) => setSignOnBonus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Executive Notification Routing (HR Head & CTO) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-600 pb-2 border-b border-slate-200">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">3. Executive Dispatch Routing</h2>
                <p className="text-[11px] text-slate-500 font-normal">Automated encrypted PDF dispatch upon final signature completion</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>HR Head Email</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">Executive #1</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={hrHeadName}
                    onChange={(e) => setHrHeadName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={hrHeadEmail}
                    onChange={(e) => setHrHeadEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>CTO Email</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">Executive #2</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={ctoName}
                    onChange={(e) => setCtoName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={ctoEmail}
                    onChange={(e) => setCtoEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
            >
              <Send className="h-4 w-4" />
              <span>{isEditing ? 'Save & Update Offer Details' : 'Issue Offer & Dispatch to Candidate'}</span>
            </button>
          </div>

        </div>

        {/* Right Column: Live Document Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Document Sheet Preview</span>
              <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Real-time Rendering</span>
              </span>
            </div>

            {/* Document Paper Mockup using exact We.PLM Joining/Offer Letter format */}
            <div className="max-h-[750px] overflow-y-auto pr-2 rounded-2xl border border-slate-700 bg-slate-900/50 p-2">
              <OfferLetterPaper
                document={{
                  id: 'preview-draft',
                  documentNumber: initialDocument?.documentNumber || 'WE-PLM-2026-001',
                  companyName: companyName || 'We.PLM India Pvt Ltd',
                  documentType: documentType,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  status: 'OUT_FOR_CANDIDATE_SIGN',
                  auditTrail: [],
                  sha256Checksum: 'PREVIEW-DRAFT-CHECKSUM',
                  executives: {
                    hrHead: { name: hrHeadName, email: hrHeadEmail, title: 'HR Head', status: 'PENDING_TRIGGER' },
                    cto: { name: ctoName, email: ctoEmail, title: 'CTO', status: 'PENDING_TRIGGER' }
                  },
                  offerDetails: {
                    candidateName: candidateName || 'Uddeshya SINGH',
                    candidateEmail: candidateEmail || 'candidate@example.com',
                    candidateAddress: candidateAddress || '1/13 Girish Ghosh Road, Belur, Howrah - 711202',
                    candidateDob: candidateDob || '02-06-2004',
                    jobTitle: jobTitle || 'Graduate Trainee Engineer',
                    department: department || 'Engineering',
                    annualSalary: annualSalary || '₹6,50,000 INR',
                    joiningDate: joiningDate || '03-08-2026',
                    workLocation: workLocation || 'Pune, Maharashtra',
                    reportingManager: reportingManager || 'Rajesh Sharma',
                    probationMonths: probationMonths || 6,
                    equityUnits: equityUnits,
                    signOnBonus: signOnBonus,
                    directorName: directorName || 'Shantanu Jagtap',
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
