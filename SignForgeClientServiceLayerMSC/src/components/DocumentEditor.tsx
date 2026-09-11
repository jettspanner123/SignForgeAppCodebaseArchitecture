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
  Upload,
  CheckCircle2,
  Award,
  Plus,
  AlertCircle
} from 'lucide-react';
import { OfferDocument, OfferDetails } from '../Types';
import ApplicationCryptoUtility from '../Utilities/ApplicationCryptoUtility';
import ApplicationUrlEncoderUtility from '../Utilities/ApplicationUrlEncoderUtility';
import { OfferLetterPaper } from './OfferLetterPaper';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import InputSharedComponent from '../Shared/Components/InputSharedComponent';
import CustomSelectSharedComponent, { SelectOption } from '../Shared/Components/CustomSelectSharedComponent';
import TanstackQueryClientService from '../Services/TanstackQueryClientService';
import CreateDepartmentModalController from './CreateDepartmentModalController';
import CreateDesignationModalController from './CreateDesignationModalController';
import CreateWorkLocationModalController from './CreateWorkLocationModalController';
import ApplicationHapticsUtility from '../Utilities/ApplicationHapticsUtility';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import DocumentEditorFormModeEnumModel from '../Models/DocumentEditorFormModeEnumModel';
import OfferLetterInteractiveStateInterfaceModel from '../Models/OfferLetterInteractiveStateInterfaceModel';

interface DocumentEditorProps {
  initialDocument?: OfferDocument | null;
  onSaveAndSend: (doc: OfferDocument) => void | Promise<void>;
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

  const [formMode, setFormMode] = useState<DocumentEditorFormModeEnumModel>(
    DocumentEditorFormModeEnumModel.STANDARD
  );
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
    initialDocument?.companyAddress || 'G22 Deepmala Pimple Saudagar Pune 411027'
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
  const initialAddressLines = (initialDocument?.offerDetails.candidateAddress || '').split('\n');
  const [candidateAddressLine1, setCandidateAddressLine1] = useState(initialAddressLines[0] || '');
  const [candidateAddressLine2, setCandidateAddressLine2] = useState(initialAddressLines[1] || '');
  const [candidateAddressLine3, setCandidateAddressLine3] = useState(
    initialAddressLines.slice(2).join('\n') || ''
  );
  const candidateAddress = [candidateAddressLine1, candidateAddressLine2, candidateAddressLine3]
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
  const setCandidateAddress = (fullAddress: string) => {
    const parts = fullAddress.split('\n');
    setCandidateAddressLine1(parts[0] || '');
    setCandidateAddressLine2(parts[1] || '');
    setCandidateAddressLine3(parts.slice(2).join('\n') || '');
  };

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
  const [probationMonths, setProbationMonths] = useState<number | string>(
    initialDocument?.offerDetails.probationMonths || 3
  );
  const [equityUnits, setEquityUnits] = useState(
    initialDocument?.offerDetails.equityUnits || ''
  );
  const [signOnBonus, setSignOnBonus] = useState(
    initialDocument?.offerDetails.signOnBonus || ''
  );

  // Signatory & Executive Routing
  const [directorName, setDirectorName] = useState(
    initialDocument?.offerDetails.directorName || 'Shantanu Jagtap'
  );
  const [directorTitle, setDirectorTitle] = useState(
    initialDocument?.offerDetails.directorTitle || 'Director & VP'
  );
  const [directorEmail, setDirectorEmail] = useState(
    initialDocument?.directorSignature?.email || 'shantanu.j@weplm.com'
  );

  const [hrHeadName, setHrHeadName] = useState(
    initialDocument?.executives?.hrHead?.name || 'Sonal Singh'
  );
  const [hrHeadEmail, setHrHeadEmail] = useState(
    initialDocument?.executives?.hrHead?.email || 'hr@theweplm.com'
  );
  const [ctoName, setCtoName] = useState(
    initialDocument?.executives?.cto?.name || 'Shantanu Jagtap'
  );
  const [ctoEmail, setCtoEmail] = useState(
    initialDocument?.executives?.cto?.email || 'cto@theweplm.com'
  );

  // Live Designations & Work Locations from AS_ConfigurationConstantTBL (1:1 with AssetSphere)
  const { data: designationsMap = {} } =
    TanstackQueryClientService.current.configurationConstant.useDesignationsQuery();

  const { data: workLocations = [] } =
    TanstackQueryClientService.current.configurationConstant.useWorkLocationsQuery();

  const departmentKeys = React.useMemo(() => Object.keys(designationsMap), [designationsMap]);

  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
  const [isCreateDesignationOpen, setIsCreateDesignationOpen] = useState(false);
  const [isCreateWorkLocationOpen, setIsCreateWorkLocationOpen] = useState(false);

  const departmentOptions: SelectOption[] = React.useMemo(() => {
    const opts = departmentKeys.map((dept) => ({ value: dept, label: dept }));
    if (department && !opts.some((o) => o.value === department)) {
      opts.unshift({ value: department, label: department });
    }
    return opts;
  }, [departmentKeys, department]);

  const currentDepartmentDesignations = React.useMemo(() => {
    if (department && designationsMap[department]) {
      return designationsMap[department];
    }
    const all = Object.values(designationsMap).flat();
    return Array.from(new Set(all));
  }, [department, designationsMap]);

  const designationOptions: SelectOption[] = React.useMemo(() => {
    const opts = currentDepartmentDesignations.map((des) => ({ value: des, label: des }));
    if (jobTitle && !opts.some((o) => o.value === jobTitle)) {
      opts.unshift({ value: jobTitle, label: jobTitle });
    }
    return opts;
  }, [currentDepartmentDesignations, jobTitle]);

  const locationOptions: SelectOption[] = React.useMemo(() => {
    const opts = workLocations.map((loc) => ({ value: loc, label: loc }));
    if (workLocation && !opts.some((o) => o.value === workLocation)) {
      opts.unshift({ value: workLocation, label: workLocation });
    }
    return opts;
  }, [workLocations, workLocation]);

  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    const available = designationsMap[newDept] || [];
    if (available.length > 0 && (!jobTitle || !available.includes(jobTitle))) {
      setJobTitle(available[0]);
    }
  };

  const handleDepartmentCreated = (newDept: string) => {
    setDepartment(newDept);
    const available = designationsMap[newDept] || [];
    if (available.length > 0) {
      setJobTitle(available[0]);
    }
  };

  const handleDesignationCreated = (createdDept: string, createdDesignation: string) => {
    setDepartment(createdDept);
    setJobTitle(createdDesignation);
  };

  const handleWorkLocationCreated = (newLoc: string) => {
    setWorkLocation(newLoc);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDocTypeChange = (type: 'OFFER_LETTER' | 'JOINING_LETTER') => {
    setDocumentType(type);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!candidateName.trim()) newErrors.candidateName = 'Candidate Name is required';
    if (!candidateEmail.trim()) newErrors.candidateEmail = 'Candidate Email is required';
    if (!candidateAddressLine1.trim()) newErrors.candidateAddressLine1 = 'Candidate Address Line 1 is required';
    if (!jobTitle.trim()) newErrors.jobTitle = 'Job Title is required';
    if (!annualSalary.trim()) newErrors.annualSalary = 'Annual Salary is required';
    if (!joiningDate.trim()) newErrors.joiningDate = 'Joining Date is required';
    if (!hrHeadEmail.trim()) newErrors.hrHeadEmail = 'HR Head Email is required';
    if (!ctoEmail.trim()) newErrors.ctoEmail = 'CTO Email is required';
    if (signatureCount === 3) {
      if (!directorName.trim()) newErrors.directorName = 'Director Name is required';
      if (!directorTitle.trim()) newErrors.directorTitle = 'Director Title is required';
      if (!directorEmail.trim()) newErrors.directorEmail = 'Director Email is required';
    }

    setErrors(newErrors);
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstField = errorKeys[0];
      const el = document.querySelector(`[name="${firstField}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (el as HTMLElement).focus();
      }
      return false;
    }
    return true;
  };

  const handleIssueOffer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const ip = ApplicationCryptoUtility.current.getSimulatedIP();
    const initialChecksum = await ApplicationCryptoUtility.current.generateSHA256(`${candidateName}-${jobTitle}-${annualSalary}-${now}`);

    const newDoc: OfferDocument = {
      id: initialDocument?.id || ApplicationCryptoUtility.current.generateUUID(),
      documentNumber: initialDocument?.documentNumber || ApplicationCryptoUtility.current.generateDocNumber('WE-PLM-2026'),
      documentType: documentType,
      signatureCount: signatureCount,
      companyName: companyName.trim() || 'We.PLM Global Technologies (P) Ltd.',
      companyAddress: companyAddress.trim() || 'G22 Deepmala Pimple Saudagar Pune 411027',
      candidateEmail: candidateEmail.trim(),
      hrHeadEmail: hrHeadEmail.trim(),
      ctoEmail: ctoEmail.trim(),
      status: 'OUT_FOR_CANDIDATE_SIGN',
      createdAt: initialDocument?.createdAt || now,
      updatedAt: now,
      sha256Checksum: initialChecksum,
      executives: {
        hrHead: {
          name: hrHeadName.trim(),
          email: hrHeadEmail.trim(),
          role: 'Head of Human Resources',
          status: 'PENDING_TRIGGER'
        },
        cto: {
          name: ctoName.trim(),
          email: ctoEmail.trim(),
          role: 'Chief Technology Officer',
          status: 'PENDING_TRIGGER'
        }
      },
      offerDetails: {
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail.trim(),
        candidatePhone: candidatePhone.trim(),
        candidateDob: candidateDob.trim(),
        candidateAddress: candidateAddress.trim(),
        jobTitle: jobTitle.trim(),
        department: department.trim(),
        annualSalary: annualSalary.trim(),
        joiningDate: joiningDate.trim(),
        workLocation: workLocation.trim() || 'Pune office',
        reportingManager: reportingManager.trim(),
        probationMonths: typeof probationMonths === 'number' ? probationMonths : (parseInt(String(probationMonths).replace(/[^0-9]/g, ''), 10) || 3),
        equityUnits: equityUnits.trim(),
        signOnBonus: signOnBonus.trim(),
        directorName: signatureCount === 3 ? directorName.trim() : undefined,
        directorTitle: signatureCount === 3 ? directorTitle.trim() : undefined
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
          id: ApplicationCryptoUtility.current.generateUUID(),
          timestamp: now,
          action: `${documentType === 'JOINING_LETTER' ? 'Joining Letter' : 'Offer Letter'} Created (${signatureCount} eSignatures)`,
          actor: 'HR Admin (admin@signcorp.com)',
          actorRole: 'HR Representative',
          ipAddress: ip,
          details: `Generated ${documentType} for ${candidateName} with ${signatureCount} eSign roles required`,
          checksum: initialChecksum
        },
        ...(signatureCount === 3 ? [{
          id: ApplicationCryptoUtility.current.generateUUID(),
          timestamp: now,
          action: 'Director Pre-Authorization Applied',
          actor: `${directorName} (${directorEmail})`,
          actorRole: 'Director',
          ipAddress: ip,
          details: `Director ${directorName} pre-signed ${documentType}`,
          checksum: initialChecksum
        }] : []),
        {
          id: ApplicationCryptoUtility.current.generateUUID(),
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

    // Attach generated candidate portal URL
    newDoc.generatedCandidateUrl = ApplicationUrlEncoderUtility.current.getCandidateShareLink(newDoc);

    // Extract rendered HTML preview from DOM if available
    const paperElement = document.getElementById('offer-letter-paper') || document.querySelector('.offer-letter-paper-container');
    if (paperElement) {
      newDoc.offerLetterHtml = paperElement.innerHTML;
    }

    try {
      await onSaveAndSend(newDoc);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Failed to create and persist employment offer:', err);
      alert(`Failed to save document to server database: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const interactiveState: OfferLetterInteractiveStateInterfaceModel = {
    candidateName,
    setCandidateName,
    candidateEmail,
    setCandidateEmail,
    candidateAddress,
    setCandidateAddress,
    candidatePhone,
    setCandidatePhone,
    candidateDob,
    setCandidateDob,
    jobTitle,
    setJobTitle,
    department,
    setDepartment,
    annualSalary,
    setAnnualSalary,
    reportingManager,
    setReportingManager,
    probationMonths,
    setProbationMonths,
    joiningDate,
    setJoiningDate,
    workLocation,
    setWorkLocation,
    equity: equityUnits,
    setEquity: setEquityUnits,
    signOnBonus,
    setSignOnBonus,
    companyName,
    setCompanyName,
    companyAddress,
    setCompanyAddress,
    signatureCount,
    setSignatureCount,
    directorName,
    setDirectorName,
    directorTitle,
    setDirectorTitle,
    directorEmail,
    setDirectorEmail,
    hrHeadName,
    setHrHeadName,
    hrHeadEmail,
    setHrHeadEmail,
    ctoName,
    setCtoName,
    ctoEmail,
    setCtoEmail,
    errors,
  };

  const previewDocument: OfferDocument = {
    id: 'preview-draft',
    documentNumber: initialDocument?.documentNumber || 'WE-PLM-2026-001',
    companyName: companyName || 'We.PLM Global Technologies (P) Ltd.',
    documentType: documentType,
    signatureCount: signatureCount,
    candidateEmail: candidateEmail || '',
    hrHeadEmail: hrHeadEmail || 'hr@theweplm.com',
    ctoEmail: ctoEmail || 'cto@theweplm.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'OUT_FOR_CANDIDATE_SIGN',
    auditTrail: [],
    sha256Checksum: 'PREVIEW-DRAFT-CHECKSUM',
    executives: {
      hrHead: { name: hrHeadName || 'HR Head', email: hrHeadEmail || 'hr@theweplm.com', role: 'Head of Human Resources', status: 'PENDING_TRIGGER' },
      cto: { name: ctoName || 'CTO', email: ctoEmail || 'cto@theweplm.com', role: 'Chief Technology Officer', status: 'PENDING_TRIGGER' }
    },
    offerDetails: {
      candidateName: candidateName || '',
      candidateEmail: candidateEmail || '',
      candidateAddress: candidateAddress || '',
      candidateDob: candidateDob || '',
      jobTitle: jobTitle || '',
      department: department || '',
      annualSalary: annualSalary || '',
      joiningDate: joiningDate || '',
      workLocation: workLocation || '',
      reportingManager: reportingManager || '',
      probationMonths: probationMonths || 3,
      equityUnits: equityUnits || '',
      signOnBonus: signOnBonus || '',
      directorName: directorName || '',
      directorTitle: directorTitle || ''
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      
      {/* 1. Standard Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-headline tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            {isEditing ? (
              <>Edit Offer Document: <br className="sm:hidden" />{initialDocument?.documentNumber}</>
            ) : (
              <>Create Enterprise <br className="sm:hidden" />Employment Offer</>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 max-w-2xl">
            {isEditing 
              ? 'Update salary, designation, candidate information, and executive dispatch emails.'
              : 'Configure offer letter details, recipient candidate email, and executive routing (HR Head & CTO).'
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto sm:shrink-0">
          {/* Form Mode Segmented Control (Standard Form vs Interactive Form) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9 w-full sm:w-auto">
            <button
              type="button"
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={() => setFormMode(DocumentEditorFormModeEnumModel.STANDARD)}
              className="flex-1 sm:flex-initial relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
              title="Standard Form Mode"
            >
              {formMode === DocumentEditorFormModeEnumModel.STANDARD && (
                <motion.div
                  layoutId="activeFormModePill"
                  className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${
                formMode === DocumentEditorFormModeEnumModel.STANDARD
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}>
                <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span>Standard Form</span>
              </span>
            </button>
            <button
              type="button"
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={() => setFormMode(DocumentEditorFormModeEnumModel.INTERACTIVE)}
              className="flex-1 sm:flex-initial relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
              title="Interactive Form Mode"
            >
              {formMode === DocumentEditorFormModeEnumModel.INTERACTIVE && (
                <motion.div
                  layoutId="activeFormModePill"
                  className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${
                formMode === DocumentEditorFormModeEnumModel.INTERACTIVE
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}>
                <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span>Interactive Form</span>
              </span>
            </button>
          </div>

          {!isEditing && onSwitchToUpload && (
            <PrimaryActionButtonSharedComponent
              label="Upload PDF Instead"
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={onSwitchToUpload}
              icon={<Upload className="w-4 h-4 sm:w-3.5 sm:h-3.5 !text-white" />}
              className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-4 text-sm sm:text-xs font-bold"
            />
          )}
        </div>
      </div>

      {/* Interactive Top Capsule Bar */}
      <AnimatePresence>
        {formMode === DocumentEditorFormModeEnumModel.INTERACTIVE && (
          <motion.div
            key="interactive-top-bar"
            initial={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24, scale: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.98 }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.25 }}
            className="overflow-hidden sticky top-4 z-20 max-w-4xl mx-auto w-full"
          >
            <div className="flex flex-col items-center gap-3 p-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-zinc-800/80 shadow-md">
              <div className="flex items-center gap-3 w-full">
                {/* Document Type Segmented Control */}
                <div className="flex-1 flex items-center p-1 rounded-xl sm:rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9">
                  <button
                    type="button"
                    onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                    onClick={() => handleDocTypeChange('OFFER_LETTER')}
                    className="flex-1 relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                  >
                    {documentType === 'OFFER_LETTER' && (
                      <motion.div
                        layoutId="activeInteractiveDocTypePill"
                        className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-1.5 ${
                      documentType === 'OFFER_LETTER'
                        ? 'text-[#0C2086] dark:text-white font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}>
                      <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span>Offer Letter</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                    onClick={() => handleDocTypeChange('JOINING_LETTER')}
                    className="flex-1 relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                  >
                    {documentType === 'JOINING_LETTER' && (
                      <motion.div
                        layoutId="activeInteractiveDocTypePill"
                        className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-1.5 ${
                      documentType === 'JOINING_LETTER'
                        ? 'text-[#0C2086] dark:text-white font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}>
                      <Briefcase className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span>Joining Letter</span>
                    </span>
                  </button>
                </div>

                {/* Workflow Signatures Segmented Control */}
                <div className="flex-1 flex items-center p-1 rounded-xl sm:rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9">
                  <button
                    type="button"
                    onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                    onClick={() => setSignatureCount(2)}
                    className="flex-1 relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                  >
                    {signatureCount === 2 && (
                      <motion.div
                        layoutId="activeInteractiveSigCountPill"
                        className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-1.5 ${
                      signatureCount === 2
                        ? 'text-slate-900 dark:text-white font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}>
                      <ShieldCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="sm:hidden">2 Signature</span>
                      <span className="hidden sm:inline">2 Signatures</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                    onClick={() => setSignatureCount(3)}
                    className="flex-1 relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                  >
                    {signatureCount === 3 && (
                      <motion.div
                        layoutId="activeInteractiveSigCountPill"
                        className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-1.5 ${
                      signatureCount === 3
                        ? 'text-amber-700 dark:text-amber-400 font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}>
                      <UserCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="sm:hidden">3 Signature</span>
                      <span className="hidden sm:inline">3 Signatures (Director)</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick Jump Multi-Page Anchors */}
              <div className="flex items-center justify-center flex-wrap gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Jump:</span>
                <button
                  type="button"
                  onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                  onClick={() => document.getElementById('offer-letter-page-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer text-xs font-semibold"
                >
                  Page 1: Terms
                </button>
                <button
                  type="button"
                  onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                  onClick={() => document.getElementById('offer-letter-page-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer text-xs font-semibold"
                >
                  Page 2: Clauses
                </button>
                <button
                  type="button"
                  onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                  onClick={() => document.getElementById('offer-letter-page-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer text-xs font-semibold"
                >
                  Page 3: Execution
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN UNIFIED FLUID LAYOUT (LayoutGroup Spring Transitions) */}
      <LayoutGroup id="document-editor-layout">
        <div className={`transition-none items-start ${
          formMode === DocumentEditorFormModeEnumModel.STANDARD 
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' 
            : 'max-w-4xl mx-auto w-full space-y-6 pb-28'
        }`}>
          
          {/* Left Column: Form Fields with AnimatePresence */}
          <AnimatePresence mode="popLayout">
            {formMode === DocumentEditorFormModeEnumModel.STANDARD && (
              <motion.div
                key="standard-form-column"
                layout
                initial={{ opacity: 0, x: -30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ type: 'spring', duration: 0.8, bounce: 0.25 }}
                className="w-full"
              >
                <div className="rounded-xl bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 shadow-xs px-3.5 py-5 sm:p-6 space-y-6 sm:space-y-8">
                  
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
                        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9 w-full">
                          <button
                            type="button"
                            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                            onClick={() => handleDocTypeChange('OFFER_LETTER')}
                            className="relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                          >
                            {documentType === 'OFFER_LETTER' && (
                              <motion.div
                                layoutId="activeDocType"
                                className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              />
                            )}
                            <span className={`relative z-10 flex items-center gap-1.5 ${
                              documentType === 'OFFER_LETTER'
                                ? 'text-[#0C2086] dark:text-white font-bold'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                            }`}>
                              <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                              <span className="sm:hidden">Offer Letter</span>
                              <span className="hidden sm:inline truncate">Offer Letter Package (Full Terms)</span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                            onClick={() => handleDocTypeChange('JOINING_LETTER')}
                            className="relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                          >
                            {documentType === 'JOINING_LETTER' && (
                              <motion.div
                                layoutId="activeDocType"
                                className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              />
                            )}
                            <span className={`relative z-10 flex items-center gap-1.5 ${
                              documentType === 'JOINING_LETTER'
                                ? 'text-[#0C2086] dark:text-white font-bold'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                            }`}>
                              <Briefcase className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                              <span className="sm:hidden">Joining Letter</span>
                              <span className="hidden sm:inline truncate">Joining Letter & Appointment</span>
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Line 2: Signature Workflow Routing */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Required eSignature Workflow
                        </label>
                        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9 w-full">
                          <button
                            type="button"
                            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                            onClick={() => setSignatureCount(2)}
                            className="relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                          >
                            {signatureCount === 2 && (
                              <motion.div
                                layoutId="activeSigCount"
                                className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              />
                            )}
                            <span className={`relative z-10 flex items-center gap-1.5 ${
                              signatureCount === 2
                                ? 'text-slate-900 dark:text-white font-bold'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                            }`}>
                              <ShieldCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400" />
                              <span className="sm:hidden">2 Signature</span>
                              <span className="hidden sm:inline truncate">2 Signatures (Candidate + HR)</span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                            onClick={() => setSignatureCount(3)}
                            className="relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                          >
                            {signatureCount === 3 && (
                              <motion.div
                                layoutId="activeSigCount"
                                className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              />
                            )}
                            <span className={`relative z-10 flex items-center gap-1.5 ${
                              signatureCount === 3
                                ? 'text-amber-700 dark:text-amber-400 font-bold'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                            }`}>
                              <UserCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-600 dark:text-amber-400" />
                              <span className="sm:hidden">3 Signature</span>
                              <span className="hidden sm:inline truncate">3 Signatures (Director + Candidate + HR)</span>
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Candidate Information */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                      <User className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                      <span>Candidate Identity & Contact</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputSharedComponent
                        label="Candidate Full Name *"
                        name="candidateName"
                        required
                        value={candidateName}
                        onChange={(e) => {
                          setCandidateName(e.target.value);
                          setErrors((prev) => ({ ...prev, candidateName: '' }));
                        }}
                        error={errors.candidateName}
                        placeholder="e.g. Uddeshya Singh"
                      />

                      <InputSharedComponent
                        label="Candidate Email *"
                        name="candidateEmail"
                        type="email"
                        required
                        value={candidateEmail}
                        onChange={(e) => {
                          setCandidateEmail(e.target.value);
                          setErrors((prev) => ({ ...prev, candidateEmail: '' }));
                        }}
                        error={errors.candidateEmail}
                        placeholder="e.g. uddeshya.singh@example.com"
                      />

                      <InputSharedComponent
                        label="Contact Phone"
                        type="tel"
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                      />

                      <InputSharedComponent
                        label="Date of Birth"
                        type="date"
                        value={candidateDob}
                        onChange={(e) => setCandidateDob(e.target.value)}
                      />

                      <div className="sm:col-span-2">
                        <InputSharedComponent
                          label="Candidate Address Line 1 *"
                          name="candidateAddressLine1"
                          required
                          value={candidateAddressLine1}
                          onChange={(e) => {
                            setCandidateAddressLine1(e.target.value);
                            setErrors((prev) => ({ ...prev, candidateAddressLine1: '' }));
                          }}
                          error={errors.candidateAddressLine1}
                          placeholder="e.g. Flat 402, Royal Palms, Pimple Saudagar"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <InputSharedComponent
                          label="Candidate Address Line 2"
                          value={candidateAddressLine2}
                          onChange={(e) => setCandidateAddressLine2(e.target.value)}
                          placeholder="e.g. Near Aundh-Ravet BRTS Road"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <InputSharedComponent
                          label="Candidate Address Line 3"
                          value={candidateAddressLine3}
                          onChange={(e) => setCandidateAddressLine3(e.target.value)}
                          placeholder="e.g. Pune, Maharashtra - 411027"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Offer Terms */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                      <Briefcase className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                      <span>Designation, Compensation & Terms</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CustomSelectSharedComponent
                        label="Department"
                        value={department}
                        onChange={handleDepartmentChange}
                        options={departmentOptions}
                        placeholder="Select department..."
                        searchable={true}
                        searchPlaceholder="Search departments..."
                        size="md"
                        footerAction={{
                          label: 'Create New Department',
                          icon: <Plus className="w-3.5 h-3.5" />,
                          onClick: () => setIsCreateDepartmentOpen(true),
                        }}
                      />

                      <div>
                        <CustomSelectSharedComponent
                          label="Official Designation / Job Title *"
                          value={jobTitle}
                          onChange={(val) => {
                            setJobTitle(val);
                            setErrors((prev) => ({ ...prev, jobTitle: '' }));
                          }}
                          options={designationOptions}
                          placeholder={
                            designationOptions.length === 0
                              ? 'No roles yet — click below to add'
                              : 'Select designation...'
                          }
                          searchable={true}
                          searchPlaceholder="Search designations..."
                          size="md"
                          triggerClassName={errors.jobTitle ? '!border-rose-300 dark:!border-rose-800' : ''}
                          footerAction={{
                            label: 'Create New Designation',
                            icon: <Plus className="w-3.5 h-3.5" />,
                            onClick: () => setIsCreateDesignationOpen(true),
                          }}
                        />
                        {errors.jobTitle && (
                          <p className="text-[11px] text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{errors.jobTitle}</span>
                          </p>
                        )}
                      </div>

                      <InputSharedComponent
                        label="Annual CTC Compensation *"
                        name="annualSalary"
                        required
                        value={annualSalary}
                        onChange={(e) => {
                          setAnnualSalary(e.target.value);
                          setErrors((prev) => ({ ...prev, annualSalary: '' }));
                        }}
                        error={errors.annualSalary}
                        placeholder="e.g. 2400000"
                      />

                      <InputSharedComponent
                        label="Joining Date *"
                        name="joiningDate"
                        type="date"
                        required
                        value={joiningDate}
                        onChange={(e) => {
                          setJoiningDate(e.target.value);
                          setErrors((prev) => ({ ...prev, joiningDate: '' }));
                        }}
                        error={errors.joiningDate}
                      />

                      <InputSharedComponent
                        label="Reporting Manager"
                        value={reportingManager}
                        onChange={(e) => setReportingManager(e.target.value)}
                        placeholder="e.g. Shantanu Jagtap"
                      />

                      <CustomSelectSharedComponent
                        label="Probation Period"
                        value={String(probationMonths)}
                        onChange={(val) => {
                          const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                          setProbationMonths(!isNaN(num) && num > 0 ? num : (val || 3));
                        }}
                        options={[
                          { value: '1', label: '1 Month' },
                          { value: '2', label: '2 Months' },
                          { value: '3', label: '3 Months' },
                          { value: '6', label: '6 Months' },
                          { value: '12', label: '12 Months' },
                        ]}
                        enableCustomValue={true}
                        searchPlaceholder="Search or type custom probation..."
                        formatDisplayValue={(val) => {
                          const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                          if (!isNaN(num) && num > 0 && !val.toLowerCase().includes('month') && !val.toLowerCase().includes('day')) {
                            return `${num} Month${num === 1 ? '' : 's'}`;
                          }
                          return val;
                        }}
                      />

                      <CustomSelectSharedComponent
                        label="Work Location"
                        value={workLocation}
                        onChange={setWorkLocation}
                        options={locationOptions}
                        placeholder="Select work location..."
                        searchable={true}
                        searchPlaceholder="Search work locations..."
                        size="md"
                        footerAction={{
                          label: 'Create New Work Location',
                          icon: <Plus className="w-3.5 h-3.5" />,
                          onClick: () => setIsCreateWorkLocationOpen(true),
                        }}
                      />

                      <InputSharedComponent
                        label="Equity / Stock Units"
                        value={equityUnits}
                        onChange={(e) => setEquityUnits(e.target.value)}
                        placeholder="e.g. 5000 RSUs"
                        helperText="Leave empty if none"
                      />

                      <div className="sm:col-span-2">
                        <InputSharedComponent
                          label="Sign-on / Joining Bonus"
                          value={signOnBonus}
                          onChange={(e) => setSignOnBonus(e.target.value)}
                          placeholder="e.g. 100000"
                          helperText="Leave empty if none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Director Authorization Sub-Section if 3 Signatures */}
                  {signatureCount === 3 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="text-amber-700 dark:text-amber-400">Director / Authorized Signer (3rd Signatory)</span>
                        </h4>
                        <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">
                          Signing Authority #3
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputSharedComponent
                          label="Director Full Name *"
                          name="directorName"
                          required={signatureCount === 3}
                          value={directorName}
                          onChange={(e) => {
                            setDirectorName(e.target.value);
                            setErrors((prev) => ({ ...prev, directorName: '' }));
                          }}
                          error={errors.directorName}
                          placeholder="e.g. Shantanu Jagtap"
                        />

                        <InputSharedComponent
                          label="Official Designation *"
                          name="directorTitle"
                          required={signatureCount === 3}
                          value={directorTitle}
                          onChange={(e) => {
                            setDirectorTitle(e.target.value);
                            setErrors((prev) => ({ ...prev, directorTitle: '' }));
                          }}
                          error={errors.directorTitle}
                          placeholder="e.g. Director & VP"
                        />

                        <div className="sm:col-span-2">
                          <InputSharedComponent
                            label="Director Email *"
                            name="directorEmail"
                            type="email"
                            required={signatureCount === 3}
                            value={directorEmail}
                            onChange={(e) => {
                              setDirectorEmail(e.target.value);
                              setErrors((prev) => ({ ...prev, directorEmail: '' }));
                            }}
                            error={errors.directorEmail}
                            placeholder="e.g. director@weplm.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Executive Dispatch Routing */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                      <Mail className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                      <span>Executive Dispatch Routing</span>
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-mono">
                            HR Head Routing
                          </span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold">
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
                          name="hrHeadEmail"
                          type="email"
                          required
                          value={hrHeadEmail}
                          onChange={(e) => {
                            setHrHeadEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, hrHeadEmail: '' }));
                          }}
                          error={errors.hrHeadEmail}
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
                          name="ctoEmail"
                          type="email"
                          required
                          value={ctoEmail}
                          onChange={(e) => {
                            setCtoEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, ctoEmail: '' }));
                          }}
                          error={errors.ctoEmail}
                          placeholder="e.g. d.miller@weplm.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Form Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-end">
                    <PrimaryActionButtonSharedComponent
                      type="button"
                      size="md"
                      onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                      onClick={() => handleIssueOffer()}
                      label={isEditing ? 'Update Offer' : 'Issue Offer'}
                      icon={<Send className="w-4 h-4 sm:w-3.5 sm:h-3.5 !text-white" />}
                      isLoading={isSubmitting}
                      loadingText={isEditing ? 'Updating...' : 'Dispatching...'}
                      className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-6 text-sm sm:text-xs font-bold"
                    />
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right/Center Column: Fluid Document Canvas with Layout Animation */}
          <motion.div
            layout
            transition={{ type: 'spring', duration: 0.8, bounce: 0.25 }}
            className={`w-full ${
              formMode === DocumentEditorFormModeEnumModel.STANDARD
                ? 'sticky top-24'
                : ''
            }`}
          >
            {/* Document Paper Container */}
            <motion.div
              layout
              transition={{ type: 'spring', duration: 0.8, bounce: 0.25 }}
              className={`rounded-xl border ${
                formMode === DocumentEditorFormModeEnumModel.STANDARD
                  ? 'border-slate-700 dark:border-zinc-800 bg-slate-900/50 p-2 max-h-[780px] overflow-y-auto pr-2'
                  : 'border-slate-300 dark:border-zinc-800 bg-slate-900/40 p-3 sm:p-4 shadow-xl'
              }`}
            >
              <OfferLetterPaper
                document={previewDocument}
                isPreview={true}
                layoutMode="stack"
                isInteractiveForm={formMode === DocumentEditorFormModeEnumModel.INTERACTIVE}
                interactive={interactiveState}
              />
            </motion.div>
          </motion.div>

        </div>
      </LayoutGroup>

      {/* Sticky Bottom Floating Action Bar in Interactive Mode */}
      <AnimatePresence>
        {formMode === DocumentEditorFormModeEnumModel.INTERACTIVE && (
          <motion.div
            key="interactive-sticky-bottom"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-4xl w-[92%] sm:w-[85%] md:w-[75%] p-3.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-zinc-100">
                  {candidateName || 'New Candidate'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                  {documentType === 'JOINING_LETTER' ? 'Joining Letter' : 'Offer Letter'} • {signatureCount} Signatures
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PrimaryActionButtonSharedComponent
                type="button"
                size="md"
                onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
                onClick={() => handleIssueOffer()}
                label={isEditing ? 'Update Offer' : 'Issue Offer & Dispatch'}
                icon={<Send className="w-4 h-4 sm:w-3.5 sm:h-3.5 !text-white" />}
                isLoading={isSubmitting}
                loadingText={isEditing ? 'Updating...' : 'Dispatching...'}
                className="!h-11 sm:!h-9 px-5 text-sm sm:text-xs font-bold"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCreateDepartmentOpen && (
        <CreateDepartmentModalController
          isOpen={isCreateDepartmentOpen}
          onClose={() => setIsCreateDepartmentOpen(false)}
          onCreated={handleDepartmentCreated}
        />
      )}

      {isCreateDesignationOpen && (
        <CreateDesignationModalController
          isOpen={isCreateDesignationOpen}
          initialDepartment={department || (departmentKeys[0] || 'Engineering')}
          onClose={() => setIsCreateDesignationOpen(false)}
          onCreated={handleDesignationCreated}
        />
      )}

      {isCreateWorkLocationOpen && (
        <CreateWorkLocationModalController
          isOpen={isCreateWorkLocationOpen}
          onClose={() => setIsCreateWorkLocationOpen(false)}
          onCreated={handleWorkLocationCreated}
        />
      )}

    </div>
  );
};
