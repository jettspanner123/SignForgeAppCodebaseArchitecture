import React, { useState } from 'react';
import { 
  FileText, 
  Briefcase, 
  ShieldCheck, 
  UserCheck, 
  User, 
  Mail, 
  Sparkles, 
  Send,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { OfferDocument, OfferDetails, OfferDocumentField } from '../../Types';
import UploadPDFCON from './Constants/UploadPDFCON';
import UploadPdfDropzoneStaticComponent from './Components/static/UploadPdfDropzoneStaticComponent';
import UploadPdfViewerStaticComponent from './Components/static/UploadPdfViewerStaticComponent';
import ButtonSharedComponent from '../../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../../Shared/Components/PrimaryActionButtonSharedComponent';
import InputSharedComponent from '../../Shared/Components/InputSharedComponent';
import CustomSelectSharedComponent, { SelectOption } from '../../Shared/Components/CustomSelectSharedComponent';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import CreateDepartmentModalController from '../../components/CreateDepartmentModalController';
import CreateDesignationModalController from '../../components/CreateDesignationModalController';
import CreateWorkLocationModalController from '../../components/CreateWorkLocationModalController';
import ApplicationHapticsUtility from '../../Utilities/ApplicationHapticsUtility';
import ApplicationCryptoUtility from '../../Utilities/ApplicationCryptoUtility';
import ConfigurationConstantCON from '../../Constants/ConfigurationConstantCON';
import { useOfferDocumentStore } from '../../Store/OfferDocumentStore';

export interface UploadPDFScreenControllerProps {
  onSaveAndSend: (doc: OfferDocument) => void;
  onCancel: () => void;
  onSwitchToTemplate?: () => void;
}

export default function UploadPDFScreenController({
  onSaveAndSend,
  onCancel,
  onSwitchToTemplate,
}: UploadPDFScreenControllerProps): React.JSX.Element {
  const isFeatureEnabled = useOfferDocumentStore((s) => s.isFeatureEnabled);
  const isBackendFeatureWorking = isFeatureEnabled(ConfigurationConstantCON.KEY_PDF_UPLOAD_FEATURE_WORKING);

  const [documentType, setDocumentType] = useState<'OFFER_LETTER' | 'JOINING_LETTER'>('JOINING_LETTER');
  const [signatureCount, setSignatureCount] = useState<2 | 3>(3);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');

  // Interactive Placed Tag Fields State
  const [fields, setFields] = useState<OfferDocumentField[]>([]);

  // Offer Metadata
  const [companyName, setCompanyName] = useState(UploadPDFCON.DEFAULT_COMPANY_NAME);
  const [companyAddress, setCompanyAddress] = useState(UploadPDFCON.DEFAULT_COMPANY_ADDRESS);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidateDob, setCandidateDob] = useState('');
  const [candidateAddress, setCandidateAddress] = useState('');
  
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [workLocation, setWorkLocation] = useState('Pune Office');
  const [reportingManager, setReportingManager] = useState('Shantanu Jagtap');
  const [probationMonths, setProbationMonths] = useState(3);
  const [equityUnits, setEquityUnits] = useState('');
  const [signOnBonus, setSignOnBonus] = useState('');

  // Director details for 3 signatures
  const [directorName, setDirectorName] = useState(UploadPDFCON.DEFAULT_DIRECTOR_NAME);
  const [directorTitle, setDirectorTitle] = useState(UploadPDFCON.DEFAULT_DIRECTOR_TITLE);
  const [directorEmail, setDirectorEmail] = useState(UploadPDFCON.DEFAULT_DIRECTOR_EMAIL);

  // Executive Routing
  const [hrHeadName, setHrHeadName] = useState(UploadPDFCON.DEFAULT_HR_HEAD_NAME);
  const [hrHeadEmail, setHrHeadEmail] = useState(UploadPDFCON.DEFAULT_HR_HEAD_EMAIL);
  const [ctoName, setCtoName] = useState(UploadPDFCON.DEFAULT_CTO_NAME);
  const [ctoEmail, setCtoEmail] = useState(UploadPDFCON.DEFAULT_CTO_EMAIL);

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
  const [dragOver, setDragOver] = useState(false);
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Field Tag Handlers
  const handleAddField = (newField: OfferDocumentField) => {
    setFields((prev) => [...prev, newField]);
  };

  const handleUpdateFieldPosition = (id: string, xPercent: number, yPercent: number) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, xPercent, yPercent } : f))
    );
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAutoPlaceDefaults = () => {
    ApplicationHapticsUtility.current.triggerHapticFeedback(15);
    if (signatureCount === 3) {
      const defaultFields: OfferDocumentField[] = [
        {
          id: `field-dir-${Date.now()}`,
          type: 'DIRECTOR_SIGNATURE',
          label: 'Director Seal',
          page: 1,
          xPercent: 8,
          yPercent: 78,
          widthPercent: 26,
          heightPercent: 7,
          required: true,
          assignedTo: 'DIRECTOR',
        },
        {
          id: `field-cand-${Date.now()}`,
          type: 'CANDIDATE_SIGNATURE',
          label: 'Candidate Signature',
          page: 1,
          xPercent: 38,
          yPercent: 78,
          widthPercent: 26,
          heightPercent: 7,
          required: true,
          assignedTo: 'CANDIDATE',
        },
        {
          id: `field-hr-${Date.now()}`,
          type: 'HR_SIGNATURE',
          label: 'HR Countersign',
          page: 1,
          xPercent: 68,
          yPercent: 78,
          widthPercent: 26,
          heightPercent: 7,
          required: true,
          assignedTo: 'HR',
        },
        {
          id: `field-date-${Date.now()}`,
          type: 'DATE_SIGNED',
          label: 'Date Signed',
          page: 1,
          xPercent: 38,
          yPercent: 88,
          widthPercent: 26,
          heightPercent: 5,
          required: true,
          assignedTo: 'CANDIDATE',
        },
        {
          id: `field-name-${Date.now()}`,
          type: 'FULL_NAME',
          label: 'Full Name',
          page: 1,
          xPercent: 8,
          yPercent: 88,
          widthPercent: 26,
          heightPercent: 5,
          required: true,
          assignedTo: 'CANDIDATE',
        },
      ];
      setFields(defaultFields);
    } else {
      const defaultFields: OfferDocumentField[] = [
        {
          id: `field-cand-${Date.now()}`,
          type: 'CANDIDATE_SIGNATURE',
          label: 'Candidate Signature',
          page: 1,
          xPercent: 12,
          yPercent: 80,
          widthPercent: 32,
          heightPercent: 7,
          required: true,
          assignedTo: 'CANDIDATE',
        },
        {
          id: `field-hr-${Date.now()}`,
          type: 'HR_SIGNATURE',
          label: 'HR Countersign',
          page: 1,
          xPercent: 56,
          yPercent: 80,
          widthPercent: 32,
          heightPercent: 7,
          required: true,
          assignedTo: 'HR',
        },
        {
          id: `field-date-${Date.now()}`,
          type: 'DATE_SIGNED',
          label: 'Date Signed',
          page: 1,
          xPercent: 12,
          yPercent: 90,
          widthPercent: 32,
          heightPercent: 5,
          required: true,
          assignedTo: 'CANDIDATE',
        },
      ];
      setFields(defaultFields);
    }
  };

  // Auto extract and pre-populate candidate details from uploaded PDF file or text
  const autoExtractAndFill = (filename: string, textContent: string = '') => {
    let parsedName = '';
    let parsedTitle = '';
    let parsedEmail = '';
    let parsedPhone = '';

    if (textContent) {
      const emailMatch = textContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) parsedEmail = emailMatch[0];

      const phoneMatch = textContent.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) parsedPhone = phoneMatch[0];
    }

    const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_\-]/g, " ");
    const words = cleanName.split(/\s+/).filter(w => 
      !['offer', 'letter', 'joining', 'draft', 'signed', 'pdf', 'doc', 'final', 'v1', 'v2', '2025', '2026', 'official', 'external', 'executive'].includes(w.toLowerCase())
    );

    if (words.length >= 2) {
      parsedName = words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      if (words.length > 2) {
        parsedTitle = words.slice(2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    } else if (words.length === 1) {
      parsedName = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    }

    if (parsedName) setCandidateName(parsedName);
    if (parsedEmail) setCandidateEmail(parsedEmail);
    if (parsedPhone) setCandidatePhone(parsedPhone);
    if (parsedTitle) setJobTitle(parsedTitle);
    if (parsedName || parsedEmail || parsedTitle) {
      setIsAutoPopulated(true);
      ApplicationHapticsUtility.current.triggerHapticFeedback(15);
    }
  };

  // Handle PDF file selection
  const handleFileChange = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a valid PDF document (.pdf)');
      return;
    }
    setPdfFile(file);
    setPdfFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (file.text) {
      file.text().then((text) => {
        autoExtractAndFill(file.name, text);
      }).catch(() => {
        autoExtractAndFill(file.name);
      });
    } else {
      autoExtractAndFill(file.name);
    }
  };

  // Helper to load sample PDF if user wants to test quickly without uploading own file
  const handleLoadSamplePdf = () => {
    setPdfUrl(UploadPDFCON.SAMPLE_PDF_BASE64);
    setPdfFileName(UploadPDFCON.SAMPLE_PDF_FILENAME);
    autoExtractAndFill(UploadPDFCON.SAMPLE_PDF_FILENAME, UploadPDFCON.SAMPLE_PDF_TEXT_PROMPT);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!pdfUrl) {
      newErrors.pdfFile = 'Please upload a PDF document before submitting';
      alert('Please upload a PDF document before submitting.');
      return false;
    }
    if (!candidateName.trim()) newErrors.candidateName = 'Candidate Name is required';
    if (!candidateEmail.trim()) newErrors.candidateEmail = 'Candidate Email is required';
    if (!jobTitle.trim()) newErrors.jobTitle = 'Job Title is required';
    if (!annualSalary.trim()) newErrors.annualSalary = 'Annual Salary is required';
    if (!joiningDate.trim()) newErrors.joiningDate = 'Start Date is required';
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

  const handleIssuePdfOffer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const docId = ApplicationCryptoUtility.current.generateUUID();
    const docPrefix = documentType === 'JOINING_LETTER' ? 'JOIN' : 'OFF';
    const docNum = ApplicationCryptoUtility.current.generateDocNumber(docPrefix);
    const now = new Date().toISOString();
    const ip = ApplicationCryptoUtility.current.getSimulatedIP();

    const offerDetails: OfferDetails = {
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      candidatePhone: candidatePhone.trim(),
      candidateDob: candidateDob.trim(),
      candidateAddress: candidateAddress.trim(),
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      annualSalary: annualSalary.trim(),
      joiningDate: joiningDate.trim(),
      workLocation: workLocation.trim() || 'Pune Office',
      reportingManager: reportingManager.trim(),
      probationMonths: probationMonths,
      equityUnits: equityUnits.trim(),
      signOnBonus: signOnBonus.trim(),
      directorName: signatureCount === 3 ? directorName.trim() : undefined,
      directorTitle: signatureCount === 3 ? directorTitle.trim() : undefined,
      directorEmail: signatureCount === 3 ? directorEmail.trim() : undefined,
    };

    const initialChecksum = await ApplicationCryptoUtility.current.generateSHA256(
      `${docNum}-${candidateName}-UPLOADED-PDF-${now}`
    );

    const docTitle = documentType === 'JOINING_LETTER' 
      ? `Uploaded Joining Letter — ${jobTitle} (${candidateName})`
      : `Uploaded Offer Letter — ${jobTitle} (${candidateName})`;

    // If user hasn't explicitly placed tags, auto-generate standard tags
    const finalFields: OfferDocumentField[] = fields.length > 0 ? fields : (
      signatureCount === 3 ? [
        { id: 'f-pdf-dir', type: 'DIRECTOR_SIGNATURE', label: 'Director Seal', page: 1, xPercent: 10, yPercent: 78, required: true, assignedTo: 'DIRECTOR' },
        { id: 'f-pdf-cand', type: 'CANDIDATE_SIGNATURE', label: 'Candidate Signature', page: 1, xPercent: 40, yPercent: 78, required: true, assignedTo: 'CANDIDATE' },
        { id: 'f-pdf-hr', type: 'HR_SIGNATURE', label: 'HR Countersign', page: 1, xPercent: 70, yPercent: 78, required: true, assignedTo: 'HR' },
      ] : [
        { id: 'f-pdf-cand', type: 'CANDIDATE_SIGNATURE', label: 'Candidate Signature', page: 1, xPercent: 15, yPercent: 78, required: true, assignedTo: 'CANDIDATE' },
        { id: 'f-pdf-hr', type: 'HR_SIGNATURE', label: 'HR Countersign', page: 1, xPercent: 55, yPercent: 78, required: true, assignedTo: 'HR' },
      ]
    );

    const newDoc: OfferDocument = {
      id: docId,
      documentNumber: docNum,
      documentType,
      signatureCount,
      title: docTitle,
      status: 'OUT_FOR_CANDIDATE_SIGN',
      createdAt: now,
      updatedAt: now,
      createdBy: 'HR Talent Acquisition (admin@theweplm.com)',
      companyName: companyName.trim() || UploadPDFCON.DEFAULT_COMPANY_NAME,
      companyAddress: companyAddress.trim() || UploadPDFCON.DEFAULT_COMPANY_ADDRESS,
      candidateEmail: candidateEmail.trim(),
      hrHeadEmail: hrHeadEmail.trim(),
      ctoEmail: ctoEmail.trim(),
      isUploadedPdf: true,
      pdfUrl: pdfUrl || undefined,
      pdfFileName: pdfFileName || 'Uploaded_Document.pdf',
      sha256Checksum: initialChecksum,
      offerDetails,
      fields: finalFields,
      executives: {
        hrHead: {
          name: hrHeadName.trim(),
          role: 'HR_HEAD',
          email: hrHeadEmail.trim(),
          status: 'NOT_SENT',
        },
        cto: {
          name: ctoName.trim(),
          role: 'CTO',
          email: ctoEmail.trim(),
          status: 'NOT_SENT',
        },
        director: signatureCount === 3 ? {
          name: directorName.trim(),
          role: 'DIRECTOR',
          email: directorEmail.trim(),
          status: 'SENT_SUCCESSFULLY',
          notifiedAt: now,
        } : undefined,
      },
      directorSignature: signatureCount === 3 ? {
        type: 'TYPE',
        value: directorName.trim(),
        fontFamily: 'Great Vibes',
        signedBy: `${directorName.trim()} (${directorTitle.trim()})`,
        email: directorEmail.trim(),
        role: 'DIRECTOR',
        timestamp: now,
        ipAddress: ip,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        sha256Hash: initialChecksum,
      } : undefined,
      auditTrail: [
        {
          id: ApplicationCryptoUtility.current.generateUUID(),
          timestamp: now,
          action: `External PDF ${documentType === 'JOINING_LETTER' ? 'Joining Letter' : 'Offer Letter'} Uploaded with ${finalFields.length} Coordinate Tags`,
          actor: 'HR Admin (admin@theweplm.com)',
          actorRole: 'HR Representative',
          ipAddress: ip,
          details: `Uploaded file "${pdfFileName || 'Document.pdf'}" for candidate ${candidateName} with interactive field tags`,
          checksum: initialChecksum,
        },
        ...(signatureCount === 3 ? [{
          id: ApplicationCryptoUtility.current.generateUUID(),
          timestamp: now,
          action: 'Director Authorization Seal Applied',
          actor: `${directorName} (${directorEmail})`,
          actorRole: 'Director',
          ipAddress: ip,
          details: `Director ${directorName} pre-signed uploaded document`,
          checksum: initialChecksum,
        }] : []),
        {
          id: ApplicationCryptoUtility.current.generateUUID(),
          timestamp: now,
          action: 'Issued PDF & Routed for Signatures',
          actor: 'SignForge eSign Engine',
          actorRole: 'System Dispatcher',
          ipAddress: ip,
          details: `Routed PDF eSign request to ${candidateEmail}`,
          checksum: initialChecksum,
        }
      ]
    };

    setTimeout(() => {
      onSaveAndSend(newDoc);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      
      {/* 1. Standard Page Header matching /documents & /create-offer */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-headline tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
              Upload External <br className="sm:hidden" />PDF Offer Letter
            </h1>
            {Boolean(import.meta.env.DEV) && !isBackendFeatureWorking && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs">
                [DEV OVERRIDE]
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 max-w-2xl">
            {UploadPDFCON.FEATURE_SUBTITLE}
          </p>
        </div>

        {/* Switch Mode Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onSwitchToTemplate && (
            <ButtonSharedComponent
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-3.5 h-3.5" />}
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={onSwitchToTemplate}
            >
              Use Draft Template Instead
            </ButtonSharedComponent>
          )}

          <ButtonSharedComponent
            variant="outline"
            size="sm"
            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
            onClick={onCancel}
          >
            Cancel
          </ButtonSharedComponent>
        </div>
      </div>

      {/* 2. Main 2-Column Split Layout matching DocumentEditor 1:1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        
        {/* Left Column: Unified Form Card */}
        <div className="w-full">
          <div className="rounded-xl bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 shadow-xs px-3.5 py-5 sm:p-6 space-y-6 sm:space-y-8">
            
            {/* Section 0: PDF Dropzone & Upload Target */}
            <UploadPdfDropzoneStaticComponent
              pdfUrl={pdfUrl}
              pdfFileName={pdfFileName}
              dragOver={dragOver}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onFileSelect={handleFileChange}
              onLoadSample={handleLoadSamplePdf}
            />

            {/* Section 1: Document Type & eSignature Workflow */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <FileText className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                <span>Document Type &amp; eSignature Workflow</span>
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
                      onClick={() => setDocumentType('OFFER_LETTER')}
                      className="relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                    >
                      {documentType === 'OFFER_LETTER' && (
                        <motion.div
                          layoutId="activeUploadDocType"
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
                      onClick={() => setDocumentType('JOINING_LETTER')}
                      className="relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
                    >
                      {documentType === 'JOINING_LETTER' && (
                        <motion.div
                          layoutId="activeUploadDocType"
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
                        <span className="hidden sm:inline truncate">Joining Letter &amp; Appointment</span>
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
                          layoutId="activeUploadSigCount"
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
                          layoutId="activeUploadSigCount"
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

            {/* Section 2: Candidate Identity & Contact */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <User className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                <span>Candidate Identity &amp; Contact</span>
              </h4>

              {/* Auto-extracted metadata banner */}
              {isAutoPopulated && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 p-3.5 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs animate-in fade-in duration-200 shadow-xs">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold">Offer details auto-populated from PDF!</p>
                    <p className="text-[11px] opacity-90">Extracted candidate details from the uploaded document. You can review and adjust any field below.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputSharedComponent
                  label="Candidate Full Name *"
                  name="candidateName"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  error={errors.candidateName}
                />

                <InputSharedComponent
                  label="Candidate Email *"
                  name="candidateEmail"
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="e.g. alex.rivera@example.com"
                  error={errors.candidateEmail}
                />

                <InputSharedComponent
                  label="Contact Phone"
                  name="candidatePhone"
                  type="tel"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                />

                <InputSharedComponent
                  label="Date of Birth"
                  name="candidateDob"
                  type="date"
                  value={candidateDob}
                  onChange={(e) => setCandidateDob(e.target.value)}
                />

                <div className="sm:col-span-2">
                  <InputSharedComponent
                    label="Candidate Residential Address"
                    name="candidateAddress"
                    value={candidateAddress}
                    onChange={(e) => setCandidateAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Royal Palms, Pune - 411027"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Designation, Compensation & Terms */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <Briefcase className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                <span>Designation, Compensation &amp; Terms</span>
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

                <CustomSelectSharedComponent
                  label="Official Designation / Job Title *"
                  value={jobTitle}
                  onChange={setJobTitle}
                  options={designationOptions}
                  placeholder={
                    designationOptions.length === 0
                      ? 'No roles yet — click below to add'
                      : 'Select designation...'
                  }
                  searchable={true}
                  searchPlaceholder="Search designations..."
                  size="md"
                  footerAction={{
                    label: 'Create New Designation',
                    icon: <Plus className="w-3.5 h-3.5" />,
                    onClick: () => setIsCreateDesignationOpen(true),
                  }}
                />

                <InputSharedComponent
                  label="Annual CTC Compensation *"
                  name="annualSalary"
                  required
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  placeholder="e.g. ₹28,00,000 INR"
                  error={errors.annualSalary}
                />

                <InputSharedComponent
                  label="Start Date *"
                  name="joiningDate"
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  error={errors.joiningDate}
                />

                <InputSharedComponent
                  label="Reporting Manager"
                  name="reportingManager"
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                  placeholder="e.g. Shantanu Jagtap"
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Probation Period (Months)
                  </label>
                  <select
                    value={probationMonths}
                    onChange={(e) => setProbationMonths(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0C2086]/20 transition-all font-sans cursor-pointer"
                  >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                  </select>
                </div>

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
                  name="equityUnits"
                  value={equityUnits}
                  onChange={(e) => setEquityUnits(e.target.value)}
                  placeholder="e.g. 5,000 RSUs"
                />

                <div className="sm:col-span-2">
                  <InputSharedComponent
                    label="Sign-on / Joining Bonus"
                    name="signOnBonus"
                    value={signOnBonus}
                    onChange={(e) => setSignOnBonus(e.target.value)}
                    placeholder="e.g. 1,00,000 INR"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Director / Authorized Signer (Conditional on 3 Signatures) */}
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
                    onChange={(e) => setDirectorName(e.target.value)}
                    placeholder="e.g. Shantanu Jagtap"
                    error={errors.directorName}
                  />

                  <InputSharedComponent
                    label="Official Designation *"
                    name="directorTitle"
                    required={signatureCount === 3}
                    value={directorTitle}
                    onChange={(e) => setDirectorTitle(e.target.value)}
                    placeholder="e.g. Director & VP"
                    error={errors.directorTitle}
                  />

                  <div className="sm:col-span-2">
                    <InputSharedComponent
                      label="Director Email *"
                      name="directorEmail"
                      type="email"
                      required={signatureCount === 3}
                      value={directorEmail}
                      onChange={(e) => setDirectorEmail(e.target.value)}
                      placeholder="e.g. director@weplm.com"
                      error={errors.directorEmail}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Executive Dispatch Routing */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <Mail className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
                <span>Executive Dispatch Routing</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    name="hrHeadName"
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
                    onChange={(e) => setHrHeadEmail(e.target.value)}
                    placeholder="e.g. hr@theweplm.com"
                    error={errors.hrHeadEmail}
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
                    name="ctoName"
                    value={ctoName}
                    onChange={(e) => setCtoName(e.target.value)}
                    placeholder="e.g. David K. Chen"
                  />

                  <InputSharedComponent
                    label="CTO Email *"
                    name="ctoEmail"
                    type="email"
                    required
                    value={ctoEmail}
                    onChange={(e) => setCtoEmail(e.target.value)}
                    placeholder="e.g. cto@theweplm.com"
                    error={errors.ctoEmail}
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
                onClick={() => handleIssuePdfOffer()}
                label="Issue Uploaded PDF Offer &amp; Dispatch"
                icon={<Send className="w-4 h-4 sm:w-3.5 sm:h-3.5 !text-white" />}
                isLoading={isSubmitting}
                loadingText="Dispatching..."
                className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-6 text-sm sm:text-xs font-bold"
              />
            </div>

          </div>
        </div>

        {/* Right Column: Sticky Dark Executive PDF Canvas with Interactive Tagging */}
        <div className="w-full sticky top-24">
          <UploadPdfViewerStaticComponent
            pdfUrl={pdfUrl}
            pdfFileName={pdfFileName}
            signatureCount={signatureCount}
            fields={fields}
            onAddField={handleAddField}
            onUpdateFieldPosition={handleUpdateFieldPosition}
            onRemoveField={handleRemoveField}
            onAutoPlaceDefaults={handleAutoPlaceDefaults}
          />
        </div>

      </div>

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
}
