import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  PenTool, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  Building2, 
  MapPin, 
  Download,
  Sparkles, 
  ArrowRight, 
  X, 
  ExternalLink,
  Lock,
  FileSignature,
  FileEdit,
  Clock
} from 'lucide-react';
import { OfferDocument, SignatureData } from '../Types';
import { SignatureCanvasModal } from './SignatureCanvas';
import ApplicationPDFGeneratorUtility from '../Utilities/ApplicationPDFGeneratorUtility';
import ApplicationHapticsUtility from '../Utilities/ApplicationHapticsUtility';
import PDFGeneratorService from '../Services/PDFGeneratorService';
import ApplicationCryptoUtility from '../Utilities/ApplicationCryptoUtility';
import { OfferLetterPaper } from './OfferLetterPaper';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import BadgeSharedComponent from '../Shared/Components/BadgeSharedComponent';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import EmptyStateSharedComponent from '../Shared/Components/EmptyStateSharedComponent';
import TanstackQueryClientService from '../Services/TanstackQueryClientService';
import useAuthenticationStateStore from '../Store/AuthenticationStateStore';

export interface CandidatePortalProps {
  documentId?: string | null;
  document?: OfferDocument | null;
  onUpdateDocument: (updatedDoc: OfferDocument) => void;
  onSwitchToHRView?: () => void;
}

export const CandidatePortal: React.FC<CandidatePortalProps> = ({
  documentId,
  document: propDocument,
  onUpdateDocument,
  onSwitchToHRView
}) => {
  const docId = propDocument?.id || documentId;
  // Always fetch the authoritative record for this exact offer, even if a possibly-stale
  // copy is already sitting in the shared document store (populated by unrelated dashboard/
  // list queries). Force a fresh network check on every mount so the signed status shown
  // here can never lag behind reality.
  const { data: remoteDoc, isLoading: isRemoteLoading } =
    TanstackQueryClientService.current.employmentOffer.useEmploymentOfferByIdQuery(docId, {
      refetchOnMount: 'always',
    });

  const [localSignedDoc, setLocalSignedDoc] = useState<OfferDocument | null>(null);
  // Precedence: this session's own just-applied signature > the freshly-fetched record for
  // THIS offer > the caller-supplied document, which may be a stale snapshot from an
  // unrelated dashboard/list query and must never override a fresher, targeted fetch.
  const document = localSignedDoc || remoteDoc || (isRemoteLoading ? null : propDocument);

  const candidateSignMutation =
    TanstackQueryClientService.current.employmentOffer.useCandidateSignMutation();

  const isAuthenticated = useAuthenticationStateStore((s) => s.isAuthenticated);
  const user = useAuthenticationStateStore((s) => s.user);
  const canSwitchToHR =
    isAuthenticated &&
    Boolean(
      user?.role &&
      ['HR', 'ADMIN', 'MANAGER', 'SUPER_ADMIN'].some((r) =>
        user.role.toUpperCase().includes(r)
      )
    );

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectTab, setRejectTab] = useState<'DECLINE' | 'REVISION'>('DECLINE');
  const [rejectReason, setRejectReason] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadReady, setDownloadReady] = useState<{ blobUrl: string; fileName: string } | null>(null);

  if (isRemoteLoading && !document) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4 animate-in fade-in">
        <div className="w-10 h-10 border-3 border-[#0C2086] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 font-serif-headline">Loading Secure Employment Offer Package...</p>
        <p className="text-xs text-slate-400 font-mono">Retrieving cryptographic payload</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyStateSharedComponent
          icon={<FileText className="w-6 h-6" />}
          title="No Offer Letter Loaded"
          description="This offer link may have expired or was removed from storage. You can create a new offer or switch to the main dashboard."
        />
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const result = await PDFGeneratorService.current.generateAndDownloadOfferLetterPDF(document);
    setIsDownloading(false);

    if (result.success && result.blobUrl && result.fileName) {
      setDownloadReady({ blobUrl: result.blobUrl, fileName: result.fileName });
    } else if (result.error) {
      alert(`Could not generate PDF: ${result.error}`);
    }
  };

  const isAlreadySigned = !!document.candidateSignature;

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleApplySignature = async (sigData: SignatureData) => {
    if (!document) return;
    const now = new Date().toISOString();
    const auditChecksum = await ApplicationCryptoUtility.current.generateSHA256(`CANDIDATE_SIGNED-${document.id}-${sigData.sha256Hash}`);

    const newAuditItem = {
      id: `audit-${Date.now()}`,
      timestamp: now,
      action: 'Candidate eSigned & Accepted Offer',
      actor: `${sigData.signedBy} (${sigData.email})`,
      actorRole: 'Candidate',
      ipAddress: sigData.ipAddress,
      details: 'Applied electronic signature to offer document',
      checksum: auditChecksum
    };

    const updatedDoc: OfferDocument = {
      ...document,
      status: 'CANDIDATE_SIGNED',
      updatedAt: now,
      candidateSignature: sigData,
      auditTrail: [newAuditItem, ...document.auditTrail],
      sha256Checksum: auditChecksum
    };

    setLocalSignedDoc(updatedDoc);
    onUpdateDocument(updatedDoc);
    triggerCelebration();

    try {
      const persisted = await candidateSignMutation.mutateAsync({
        offerId: document.id,
        signatureData: sigData.value,
        signMode: sigData.type?.toUpperCase() === 'TYPE' ? 'TYPE' : 'DRAW',
        updatedHtml: document.offerLetterHtml,
        ipAddress: sigData.ipAddress,
        userAgent: navigator.userAgent,
      });
      if (persisted) {
        setLocalSignedDoc(persisted);
        onUpdateDocument(persisted);
      }
    } catch (err) {
      console.warn('Backend candidate sign sync warning:', err);
    }
  };

  const handleRejectOffer = async () => {
    if (!rejectReason.trim()) return;
    const now = new Date().toISOString();
    const ip = ApplicationCryptoUtility.current.getSimulatedIP();
    const isDecline = rejectTab === 'DECLINE';

    const updatedDoc: OfferDocument = {
      ...document,
      status: isDecline ? 'REJECTED' : document.status,
      updatedAt: now,
      rejectionReason: isDecline ? rejectReason : document.rejectionReason,
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          action: isDecline ? 'Offer Declined by Candidate' : 'Terms Revision Requested by Candidate',
          actor: document.offerDetails.candidateName,
          actorRole: 'Candidate',
          ipAddress: ip,
          details: `${isDecline ? 'Reason' : 'Revision Details'}: ${rejectReason}`,
          checksum: await ApplicationCryptoUtility.current.generateSHA256(`${isDecline ? 'REJECTED' : 'REVISION'}-${document.id}`)
        },
        ...document.auditTrail
      ]
    };

    onUpdateDocument(updatedDoc);
    setIsRejecting(false);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      
      {/* 1. Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-headline tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Employment Offer <br className="sm:hidden" />for {document.offerDetails.candidateName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 max-w-2xl">
            Issued by <strong className="text-slate-800 dark:text-zinc-200">{document.companyName}</strong> for the position of{' '}
            <strong className="text-[#0C2086] dark:text-blue-400">{document.offerDetails.jobTitle}</strong>.
          </p>
        </div>

        {/* Action Status Widget */}
        <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:items-center sm:w-auto sm:shrink-0">
          {isAlreadySigned ? (
            <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 w-full sm:w-auto">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">Offer Accepted & eSigned!</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Pending HR Counter-Signature</p>
              </div>
            </div>
          ) : document.status === 'REJECTED' ? (
            <div className="col-span-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-rose-700 dark:text-rose-400 w-full sm:w-auto">
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">Offer Declined</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400">{document.rejectionReason}</p>
              </div>
            </div>
          ) : (
            <PrimaryActionButtonSharedComponent
              label="Review & Sign Offer"
              icon={<PenTool className="w-4 h-4 sm:w-3.5 sm:h-3.5 !text-white" />}
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={() => setIsSignModalOpen(true)}
              className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-4 text-sm sm:text-xs font-bold"
            />
          )}

          <ButtonSharedComponent
            variant="outline"
            size="sm"
            disabled={isDownloading}
            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
            onClick={handleDownloadPdf}
            icon={<Download className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-600 dark:text-zinc-400" />}
            className="w-full sm:w-auto justify-center !h-11 sm:!h-9 px-4 text-sm sm:text-xs font-bold"
          >
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </ButtonSharedComponent>
        </div>
      </div>

      {/* Download Success Toast Banner */}
      {downloadReady && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-zinc-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 dark:border-zinc-700 flex items-start gap-3 max-w-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-white text-sm font-serif-headline">PDF Generated & Download Initiated</p>
            <p className="text-slate-300 dark:text-zinc-400 truncate mt-0.5 font-mono text-[11px]">{downloadReady.fileName}</p>
            <a 
              href={downloadReady.blobUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-[#0C2086] hover:bg-[#0a1b70] text-white font-medium text-xs shadow-xs transition-colors"
            >
              <span>Open & Save PDF in New Tab</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <button onClick={() => setDownloadReady(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Offer Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Position / Role</span>
          <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm block truncate">{document.offerDetails.jobTitle}</span>
        </div>
        <div className="bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Annual Compensation</span>
          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-base block">{document.offerDetails.annualSalary}</span>
        </div>
        <div className="bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Target Start Date</span>
          <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm block">{document.offerDetails.joiningDate}</span>
        </div>
        <div className="bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Work Location</span>
          <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm block truncate">{document.offerDetails.workLocation}</span>
        </div>
      </div>

      {/* Post-Signature Next Steps Card */}
      {isAlreadySigned && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 font-serif-headline">Congratulations, {document.offerDetails.candidateName}!</h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mt-0.5">Your electronic signature has been cryptographically recorded with SHA-256 seal.</p>
              </div>
            </div>

            {onSwitchToHRView && canSwitchToHR && (
              <ButtonSharedComponent
                variant="primary"
                size="sm"
                onClick={onSwitchToHRView}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Switch to HR Counter-Sign Step
              </ButtonSharedComponent>
            )}
          </div>
        </div>
      )}

      {/* Document Viewer (Uploaded PDF vs Generated Template) */}
      {document.isUploadedPdf && document.pdfUrl ? (
        <div className="bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 rounded-xl shadow-xs p-6 border border-slate-200/80 dark:border-zinc-800/80 space-y-6 max-w-4xl mx-auto relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  UPLOADED PDF OFFER DOCUMENT
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                  {document.pdfFileName || document.documentNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Please review the uploaded PDF below and apply your candidate eSignature inside the document.
              </p>
            </div>
            
            <ButtonSharedComponent
              variant="outline"
              size="sm"
              onClick={() => ApplicationPDFGeneratorUtility.current.downloadExecutedPDF(document)}
              icon={<Download className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />}
            >
              Download PDF
            </ButtonSharedComponent>
          </div>

          {/* Embedded PDF Viewer with Interactive Coordinate Overlays */}
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md relative min-h-[560px]">
            <object
              data={document.pdfUrl}
              type="application/pdf"
              className="w-full h-[560px] bg-white pointer-events-none"
            >
              <div className="p-8 text-center text-slate-300 space-y-2">
                <p className="font-bold font-serif-headline">Uploaded PDF Document</p>
                <p className="text-xs text-slate-400 font-mono">{document.pdfFileName}</p>
              </div>
            </object>

            {/* Dynamic Coordinate Tags Overlay Layer */}
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {document.fields && document.fields.length > 0 ? (
                document.fields.map((field) => {
                  const isCandidateField = field.type === 'CANDIDATE_SIGNATURE';
                  const isDirectorField = field.type === 'DIRECTOR_SIGNATURE';
                  const isHRField = field.type === 'HR_SIGNATURE';
                  const isDateField = field.type === 'DATE_SIGNED';
                  const isNameField = field.type === 'FULL_NAME';

                  return (
                    <div
                      key={field.id}
                      style={{
                        left: `${field.xPercent}%`,
                        top: `${field.yPercent}%`,
                      }}
                      className="absolute z-20"
                    >
                      {isCandidateField && (
                        <div
                          onClick={() => !isAlreadySigned && setIsSignModalOpen(true)}
                          className={`p-2.5 rounded-xl border-2 transition-all select-none shadow-lg backdrop-blur-md ${
                            isAlreadySigned
                              ? 'border-emerald-500 bg-emerald-950/90 text-emerald-300'
                              : 'border-emerald-400 bg-emerald-900/90 text-emerald-100 hover:bg-emerald-800 hover:scale-105 cursor-pointer animate-pulse ring-4 ring-emerald-500/20'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                              Candidate Signature
                            </span>
                          </div>
                          {isAlreadySigned ? (
                            <div className="font-serif text-sm font-bold text-emerald-200">
                              {document.candidateSignature?.value || 'Signed'}
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-white flex items-center gap-1">
                              <span>Click to eSign Here</span>
                            </div>
                          )}
                        </div>
                      )}

                      {isDirectorField && (
                        <div className="p-2.5 rounded-xl border border-amber-500/60 bg-amber-950/90 text-amber-300 select-none shadow-md backdrop-blur-sm">
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Director Authorization</span>
                          </div>
                          <p className="text-xs font-bold font-serif text-amber-200">
                            {document.directorSignature?.value || document.offerDetails?.directorName || 'Authorized'}
                          </p>
                        </div>
                      )}

                      {isHRField && (
                        <div className="p-2.5 rounded-xl border border-indigo-500/50 bg-indigo-950/85 text-indigo-300 select-none shadow-md backdrop-blur-sm">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>HR Countersign (Queued)</span>
                          </div>
                        </div>
                      )}

                      {isDateField && (
                        <div className="px-2.5 py-1.5 rounded-lg border border-teal-500/50 bg-teal-950/90 text-teal-300 text-xs font-mono font-bold select-none shadow-md">
                          <span>Date: {document.candidateSignature ? new Date(document.candidateSignature.timestamp).toLocaleDateString() : 'Upon Signature'}</span>
                        </div>
                      )}

                      {isNameField && (
                        <div className="px-2.5 py-1.5 rounded-lg border border-purple-500/50 bg-purple-950/90 text-purple-300 text-xs font-mono font-bold select-none shadow-md">
                          <span>Name: {document.offerDetails.candidateName}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : null}
            </div>

            {/* Bottom Bar prompt */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-100">
              <div className="flex items-center gap-2 text-xs font-mono">
                <PenTool className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold">Interactive Candidate eSign Placement Active</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => !isAlreadySigned && setIsSignModalOpen(true)}
                  disabled={isAlreadySigned}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-xs transition-all ${
                    isAlreadySigned
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer'
                  }`}
                >
                  {isAlreadySigned ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>eSigned by {document.candidateSignature?.signedBy}</span>
                    </>
                  ) : (
                    <>
                      <PenTool className="h-4 w-4" />
                      <span>Click to eSign Candidate Signature</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Signature Status Cards */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => !isAlreadySigned && setIsSignModalOpen(true)}
              className={`border-2 rounded-xl p-4 flex flex-col justify-between transition-all ${
                isAlreadySigned
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-dashed border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer'
              }`}
            >
              <div className="mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase font-mono block">1. Candidate eSignature</span>
              </div>
              {document.candidateSignature ? (
                <div className="space-y-1 text-xs">
                  {document.candidateSignature.type === 'TYPE' ? (
                    <p className="text-xl font-bold text-slate-900 dark:text-zinc-100 py-1" style={{ fontFamily: document.candidateSignature.fontFamily }}>
                      {document.candidateSignature.value}
                    </p>
                  ) : (
                    <img src={document.candidateSignature.value} alt="Signature" className="max-h-12 py-1 object-contain dark:invert" />
                  )}
                  <p className="font-bold text-slate-900 dark:text-zinc-100">Signed: {document.candidateSignature.signedBy}</p>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">IP: {document.candidateSignature.ipAddress}</p>
                </div>
              ) : (
                <div className="py-4 text-center text-emerald-600 dark:text-emerald-400 space-y-1">
                  <PenTool className="h-5 w-5 mx-auto opacity-75" />
                  <p className="text-xs font-bold font-serif-headline whitespace-nowrap truncate">Click to eSign</p>
                </div>
              )}

              {/* Bottom Full-Width Badge */}
              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
                {isAlreadySigned ? (
                  <span className="w-full block text-center text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 py-1 rounded">VERIFIED</span>
                ) : (
                  <span className="w-full block text-center text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 py-1 rounded animate-pulse">CLICK TO SIGN</span>
                )}
              </div>
            </div>

            <div className="border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-4 bg-slate-50 dark:bg-zinc-900/50 text-xs flex flex-col justify-between">
              <div className="mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase font-mono block">2. HR Counter-Sign</span>
              </div>
              {document.hrSignature ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-zinc-100">Signed by HR: {document.hrSignature.signedBy}</p>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">IP: {document.hrSignature.ipAddress}</p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400 dark:text-zinc-500 space-y-1">
                  <ShieldCheck className="h-5 w-5 mx-auto opacity-50 mb-1" />
                  <p className="text-xs font-semibold whitespace-nowrap truncate">Pending Counter-Sign</p>
                </div>
              )}

              {/* Bottom Full-Width Badge */}
              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
                <span className={`w-full block text-center text-[10px] font-bold font-mono py-1 rounded ${document.hrSignature ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}>
                  {document.hrSignature ? 'COUNTERSIGNED' : 'PENDING COUNTERSIGN'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800/80 flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            <span>ESIGN & eIDAS Compliance Engine</span>
            <span>SHA-256 Audit Seal Active</span>
          </div>
        </div>
      ) : (
        /* Standard Document Sheet Viewer using exact We.PLM Joining/Offer Letter format */
        <OfferLetterPaper
          document={document}
          onOpenSignModal={() => !isAlreadySigned && setIsSignModalOpen(true)}
          isCandidateView={true}
        />
      )}

      {/* Decline Option */}
      {!isAlreadySigned && document.status !== 'REJECTED' && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setIsRejecting(true)}
            className="text-xs text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 underline transition-colors font-medium cursor-pointer"
          >
            Decline Offer or Request Terms Revision
          </button>
        </div>
      )}

      {/* Decline / Terms Revision Modal using ModalSharedComponent */}
      <ModalSharedComponent
        isOpen={isRejecting}
        onClose={() => setIsRejecting(false)}
        title={rejectTab === 'DECLINE' ? "Decline Employment Offer" : "Request Terms Revision"}
        subtitle={`Document #${document.documentNumber} • ${rejectTab === 'DECLINE' ? 'Provide feedback for declining' : 'Submit proposed adjustments to HR'}`}
        maxWidth="md"
        footer={
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-3 w-full">
            <ButtonSharedComponent
              variant="outline"
              size="md"
              onClick={() => setIsRejecting(false)}
              className="w-full sm:w-auto justify-center"
            >
              Cancel
            </ButtonSharedComponent>
            <ButtonSharedComponent
              variant={rejectTab === 'DECLINE' ? 'danger' : 'primary'}
              size="md"
              onClick={handleRejectOffer}
              className={`w-full sm:w-auto justify-center ${rejectTab === 'REVISION' ? '!bg-[#0C2086] hover:!bg-[#081765] !text-white border-none shadow-xs font-semibold' : ''}`}
            >
              {rejectTab === 'DECLINE' ? 'Confirm Decline' : 'Confirm Request'}
            </ButtonSharedComponent>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Segmented Capsule Tabs (1:1 AssetSphere Animated Segmented Controller) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9 w-full">
            <button
              type="button"
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={() => setRejectTab('DECLINE')}
              className={`relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none ${
                rejectTab === 'DECLINE' ? 'bg-white dark:bg-zinc-700 shadow-xs sm:bg-transparent sm:dark:bg-transparent sm:shadow-none' : ''
              }`}
            >
              {rejectTab === 'DECLINE' && (
                <motion.div
                  layoutId="declineModalTabPill"
                  className="hidden sm:block absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 whitespace-nowrap ${
                rejectTab === 'DECLINE'
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}>
                <XCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>Decline Offer</span>
              </span>
            </button>

            <button
              type="button"
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={() => setRejectTab('REVISION')}
              className={`relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none ${
                rejectTab === 'REVISION' ? 'bg-white dark:bg-zinc-700 shadow-xs sm:bg-transparent sm:dark:bg-transparent sm:shadow-none' : ''
              }`}
            >
              {rejectTab === 'REVISION' && (
                <motion.div
                  layoutId="declineModalTabPill"
                  className="hidden sm:block absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 whitespace-nowrap ${
                rejectTab === 'REVISION'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}>
                <FileEdit className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>Request Revision</span>
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-400">
            {rejectTab === 'DECLINE'
              ? 'Please provide feedback or the reason for declining this offer:'
              : 'Please specify the terms, compensation, or start date adjustments you would like revised:'}
          </p>
          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={
              rejectTab === 'DECLINE'
                ? 'e.g. Accepted another offer, compensation mismatch, start date conflict...'
                : 'e.g. Requesting adjustment on start date to 15th of next month, or revision on annual compensation...'
            }
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-lg p-3 text-xs text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-[#0C2086] dark:focus:ring-blue-500"
          />
        </div>
      </ModalSharedComponent>

      {/* Signature Canvas Modal */}
      <SignatureCanvasModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleApplySignature}
        signerName={document.offerDetails.candidateName}
        signerEmail={document.offerDetails.candidateEmail}
        signerRole="CANDIDATE"
      />

    </div>
  );
};
export default CandidatePortal;
