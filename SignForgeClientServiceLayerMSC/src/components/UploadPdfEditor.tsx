import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  User, 
  Mail, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  FileCheck2,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { OfferDocument, OfferDetails } from '../types';
import { generateUUID, generateDocNumber, getSimulatedIP, generateSHA256 } from '../utils/crypto';

interface UploadPdfEditorProps {
  onSaveAndSend: (doc: OfferDocument) => void;
  onCancel: () => void;
  onSwitchToTemplate?: () => void;
}

export const UploadPdfEditor: React.FC<UploadPdfEditorProps> = ({
  onSaveAndSend,
  onCancel,
  onSwitchToTemplate
}) => {
  const [documentType, setDocumentType] = useState<'OFFER_LETTER' | 'JOINING_LETTER'>('JOINING_LETTER');
  const [signatureCount, setSignatureCount] = useState<2 | 3>(3);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');

  // Offer Metadata
  const [companyName, setCompanyName] = useState('We.PLM India (P) Ltd.');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidateDob, setCandidateDob] = useState('');
  const [candidateAddress, setCandidateAddress] = useState('');
  
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [reportingManager, setReportingManager] = useState('');
  const [probationMonths, setProbationMonths] = useState(3);

  // Director details for 3 signatures
  const [directorName, setDirectorName] = useState('');
  const [directorTitle, setDirectorTitle] = useState('Director');
  const [directorEmail, setDirectorEmail] = useState('');

  // Executive Routing
  const [hrHeadName, setHrHeadName] = useState('Sarah Jenkins');
  const [hrHeadEmail, setHrHeadEmail] = useState('hr-head@theweplm.com');
  const [ctoName, setCtoName] = useState('David K. Chen');
  const [ctoEmail, setCtoEmail] = useState('cto@theweplm.com');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [isAutoPopulated, setIsAutoPopulated] = useState(false);

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
    // A minimal valid 1-page PDF encoded in Base64 for instant testing
    const samplePdfData = 'data:application/pdf;base64,JVBERi0xLjQKJSDl4uXnCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvQ291bnQgMSAvS2lkcyBbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9SZXNvdXJjZXMgPDwvRm9udCA8PC9GMSA0IDAgUj4+Pj4gL0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2E+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggMTI1Pj4Kc3RyZWFtCkJUMQowIDAgMCByZ2IKL0YxIDI0IFRmCjUwIDcwMCBUZCAoT0ZGRVIgTEVUVEVSIFAgRCAgRUlHIE5BVFVSRSBURVNUKTBUZgoxIDAgMCAxIDUwIDY1MCBUbQooQ2FuZGlkYXRlOiBBbGV4IFJpdmVyYSAtIFByaW5jaXBhbCBTb2x1dGlvbnMgQXJjaGl0ZWN0KVRqCkVUCmVuZHN0cmVhbQplbmRvYmoKdHJhaWxlcgo8PC9Sb290IDEgMCBSL1NpemUgNio+PgpzdGFydHhyZWYKNDkwCiUlRU9G';
    setPdfUrl(samplePdfData);
    setPdfFileName('Executive_Offer_Letter_Alex_Rivera.pdf');
    autoExtractAndFill('Executive_Offer_Letter_Alex_Rivera.pdf', 'Candidate: Alex Rivera - Principal Solutions Architect');
  };

  const handleIssuePdfOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfUrl) {
      alert('Please upload a PDF document before submitting.');
      return;
    }

    setIsSubmitting(true);
    const docId = generateUUID();
    const docPrefix = documentType === 'JOINING_LETTER' ? 'JOIN' : 'OFF';
    const docNum = generateDocNumber(docPrefix);
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
      directorName,
      directorTitle,
      directorEmail
    };

    const initialChecksum = await generateSHA256(`${docNum}-${candidateName}-UPLOADED-PDF-${now}`);

    const docTitle = documentType === 'JOINING_LETTER' 
      ? `Uploaded Joining Letter — ${jobTitle} (${candidateName})`
      : `Uploaded Offer Letter — ${jobTitle} (${candidateName})`;

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
      companyName,
      isUploadedPdf: true,
      pdfUrl: pdfUrl,
      pdfFileName: pdfFileName || 'Uploaded_Document.pdf',
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
          id: 'f-pdf-dir',
          type: 'DIRECTOR_SIGNATURE',
          label: 'Director Signature',
          page: 1,
          xPercent: 10,
          yPercent: 75,
          required: true
        },
        {
          id: 'f-pdf-cand',
          type: 'CANDIDATE_SIGNATURE',
          label: 'Candidate Acceptance Signature',
          page: 1,
          xPercent: 40,
          yPercent: 75,
          required: true
        },
        {
          id: 'f-pdf-hr',
          type: 'HR_SIGNATURE',
          label: 'HR Counter-Signature',
          page: 1,
          xPercent: 70,
          yPercent: 75,
          required: true
        }
      ] : [
        {
          id: 'f-pdf-cand',
          type: 'CANDIDATE_SIGNATURE',
          label: 'Candidate Signature inside PDF',
          page: 1,
          xPercent: 15,
          yPercent: 75,
          required: true
        },
        {
          id: 'f-pdf-hr',
          type: 'HR_SIGNATURE',
          label: 'HR Counter-Signature inside PDF',
          page: 1,
          xPercent: 55,
          yPercent: 75,
          required: true
        }
      ],
      auditTrail: [
        {
          id: generateUUID(),
          timestamp: now,
          action: `External PDF ${documentType === 'JOINING_LETTER' ? 'Joining Letter' : 'Offer Letter'} Uploaded`,
          actor: 'HR Admin (admin@theweplm.com)',
          actorRole: 'HR Representative',
          ipAddress: ip,
          details: `Uploaded file "${pdfFileName || 'Document.pdf'}" for candidate ${candidateName} requiring ${signatureCount} eSignatures`,
          checksum: initialChecksum
        },
        ...(signatureCount === 3 ? [{
          id: generateUUID(),
          timestamp: now,
          action: 'Director Authorization Seal Applied',
          actor: `${directorName} (${directorEmail})`,
          actorRole: 'Director',
          ipAddress: ip,
          details: `Director ${directorName} pre-signed uploaded document`,
          checksum: initialChecksum
        }] : []),
        {
          id: generateUUID(),
          timestamp: now,
          action: 'Issued PDF & Routed for Signatures',
          actor: 'SignCorp eSign Engine',
          actorRole: 'System Dispatcher',
          ipAddress: ip,
          details: `Routed PDF eSign request to ${candidateEmail}`,
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
      
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              PDF UPLOAD & eSIGN PORTAL
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Upload external PDF generated via Word, Canva, or HRIS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">Upload External PDF Offer Letter</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Upload your custom PDF document. Our system will embed interactive candidate & HR eSign fields inside the PDF.
          </p>
        </div>

        {/* Switch Mode Action Buttons */}
        <div className="flex items-center space-x-3">
          {onSwitchToTemplate && (
            <button
              type="button"
              onClick={onSwitchToTemplate}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
            >
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Use Draft Template Instead</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleIssuePdfOffer} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: PDF Drop Area & Candidate Metadata */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Upload PDF File */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">1. Select / Drop PDF Document</h2>
              </div>

              {!pdfUrl && (
                <button
                  type="button"
                  onClick={handleLoadSamplePdf}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline flex items-center space-x-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Use Demo PDF Sample</span>
                </button>
              )}
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                pdfUrl
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : dragOver
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
            >
              {pdfUrl ? (
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{pdfFileName || 'PDF Offer Document Loaded'}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Ready for eSign Placement & Routing</p>
                  </div>
                  <div className="flex justify-center space-x-3 pt-1">
                    <label className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                      <span>Replace PDF File</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-100 dark:border-blue-900">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Drag & drop your generated PDF offer here</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Supports standard PDF files (.pdf) generated from any editor</p>
                  </div>
                  <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-colors">
                    <span>Browse PDF File</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Candidate & Offer Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Offer Details & Signer Info</h2>
              </div>
            </div>

            {/* Auto-populated details notification badge */}
            {isAutoPopulated && (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl flex items-center space-x-3 text-emerald-800 dark:text-emerald-300 text-xs animate-in fade-in duration-200">
                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">Offer details auto-populated from PDF!</p>
                  <p className="text-[11px] opacity-90">Extracted metadata and candidate fields automatically. You can review and adjust any field below.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Candidate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Candidate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. candidate@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Job Designation / Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure Consultant"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Annual Salary / Compensation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹12,50,000 INR / $110,000"
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st October 2026"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. We.PLM India (P) Ltd."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              {signatureCount === 3 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Director / Primary Signer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Executive Director"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Director / Signer Email</label>
                    <input
                      type="email"
                      placeholder="e.g. director@theweplm.com"
                      value={directorEmail}
                      onChange={(e) => setDirectorEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Executive Routing */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 pb-2 border-b border-slate-200 dark:border-slate-800">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">3. Executive Dispatch Routing</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Automated PDF email dispatch to HR Head & CTO upon full completion</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">HR Head Email</span>
                <input
                  type="email"
                  required
                  value={hrHeadEmail}
                  onChange={(e) => setHrHeadEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block">CTO Email</span>
                <input
                  type="email"
                  required
                  value={ctoEmail}
                  onChange={(e) => setCtoEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !pdfUrl}
              className={`w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm transition-colors ${
                pdfUrl
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Issue Uploaded PDF Offer & Request eSigns</span>
            </button>
          </div>

        </div>

        {/* Right Column: PDF Preview Frame */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PDF Document Preview</span>
              {pdfUrl && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Interactive eSign Fields Overlay Ready</span>
                </span>
              )}
            </div>

            {/* Document Viewer Container */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl min-h-[580px] flex flex-col relative">
              {pdfUrl ? (
                <div className="flex-1 flex flex-col h-full relative">
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span className="truncate max-w-[200px] font-mono">{pdfFileName}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      PDF LOADED
                    </span>
                  </div>
                  
                  {/* Embedded PDF View */}
                  <div className="flex-1 bg-slate-800 relative p-2 min-h-[500px]">
                    <object
                      data={pdfUrl}
                      type="application/pdf"
                      className="w-full h-[480px] rounded-lg bg-white"
                    >
                      <div className="p-6 text-center text-slate-300 space-y-2">
                        <FileText className="h-10 w-10 text-emerald-400 mx-auto" />
                        <p className="font-bold">PDF Uploaded Successfully</p>
                        <p className="text-xs text-slate-400">{pdfFileName}</p>
                      </div>
                    </object>

                    {/* Overlay eSign Field Indicators */}
                    <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 grid grid-cols-2 gap-3 text-slate-100 shadow-lg">
                      <div className="border border-dashed border-emerald-500/60 bg-emerald-500/10 rounded-lg p-2 text-center">
                        <span className="text-[10px] font-bold text-emerald-400 block uppercase">Candidate eSign Box</span>
                        <span className="text-[9px] text-slate-300">Placed inside PDF</span>
                      </div>
                      <div className="border border-dashed border-indigo-500/60 bg-indigo-500/10 rounded-lg p-2 text-center">
                        <span className="text-[10px] font-bold text-indigo-400 block uppercase">HR Counter-Sign Box</span>
                        <span className="text-[9px] text-slate-300">Placed inside PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                    <Upload className="h-8 w-8 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-sm">No PDF Selected</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Upload a PDF on the left or click "Use Demo PDF Sample" to preview how eSign fields appear.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};
