import EmptyStateSharedComponent from '../Shared/Components/EmptyStateSharedComponent';
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PenTool, 
  Send, 
  CheckCircle2, 
  UserCheck, 
  FileCheck, 
  Download,
  Mail,
  Sparkles,
  Lock,
  X,
  ExternalLink
} from 'lucide-react';
import { OfferDocument, SignatureData } from '../Types';
import { SignatureCanvasModal } from './SignatureCanvas';
import ApplicationCryptoUtility from '../Utilities/ApplicationCryptoUtility';
import { ExecutiveDispatchModal } from './ExecutiveDispatchModal';
import ApplicationPDFGeneratorUtility from '../Utilities/ApplicationPDFGeneratorUtility';
import ApplicationHapticsUtility from '../Utilities/ApplicationHapticsUtility';
import { OfferLetterPaper } from './OfferLetterPaper';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import CardSharedComponent from '../Shared/Components/CardSharedComponent';

interface HRCounterSignPortalProps {
  document: OfferDocument;
  onUpdateDocument: (updatedDoc: OfferDocument) => void;
}

export const HRCounterSignPortal: React.FC<HRCounterSignPortalProps> = ({
  document,
  onUpdateDocument
}) => {
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadReady, setDownloadReady] = useState<{ blobUrl: string; fileName: string } | null>(null);

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyStateSharedComponent
          icon={<ShieldCheck className="w-6 h-6" />}
          title="No Offer Selected for Counter-Signing"
          description="There are currently no documents pending HR counter-signature. Please select or create an offer letter in the main dashboard."
        />
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const result = await ApplicationPDFGeneratorUtility.current.downloadExecutedPDF(document);
    setIsDownloading(false);

    if (result.success && result.blobUrl && result.fileName) {
      setDownloadReady({ blobUrl: result.blobUrl, fileName: result.fileName });
    } else if (result.error) {
      alert(`Could not generate PDF: ${result.error}`);
    }
  };

  const isCandidateSigned = !!document.candidateSignature;
  const isHRSigned = !!document.hrSignature;
  const isFullyExecuted = document.status === 'FULLY_EXECUTED';

  const handleApplyHRSignature = async (sigData: SignatureData) => {
    const now = new Date().toISOString();
    const ip = ApplicationCryptoUtility.current.getSimulatedIP();

    const finalChecksum = await ApplicationCryptoUtility.current.generateSHA256(
      `FULLY_EXECUTED-${document.id}-${document.candidateSignature?.sha256Hash}-${sigData.sha256Hash}`
    );

    const updatedDoc: OfferDocument = {
      ...document,
      status: 'FULLY_EXECUTED',
      updatedAt: now,
      hrSignature: sigData,
      sha256Checksum: finalChecksum,
      executives: {
        hrHead: {
          ...document.executives.hrHead,
          status: 'SENT_SUCCESSFULLY',
          notifiedAt: now
        },
        cto: {
          ...document.executives.cto,
          status: 'SENT_SUCCESSFULLY',
          notifiedAt: now
        }
      },
      auditTrail: [
        {
          id: `audit-${Date.now()}-exec`,
          timestamp: now,
          action: 'Automated Executive Dispatch Triggered',
          actor: 'SignCorp Dispatcher Engine',
          actorRole: 'System',
          ipAddress: ip,
          details: `Sent encrypted signed PDF payload to HR Head (${document.executives.hrHead.email}) and CTO (${document.executives.cto.email})`,
          checksum: finalChecksum
        },
        {
          id: `audit-${Date.now()}-hr`,
          timestamp: now,
          action: 'HR Representative Counter-Signed Offer',
          actor: `${sigData.signedBy} (${sigData.email})`,
          actorRole: 'HR Representative',
          ipAddress: sigData.ipAddress,
          details: 'Applied company seal and counter-signature',
          checksum: finalChecksum
        },
        ...document.auditTrail
      ]
    };

    onUpdateDocument(updatedDoc);
    // Automatically launch executive dispatch modal preview!
    setShowDispatchModal(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      
      {/* 1. Editorial Header (Standard AssetSphere Layout with Divider) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-headline tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Counter-Sign <br className="sm:hidden" />Employment Offer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 max-w-2xl">
            Candidate: <strong className="text-slate-800 dark:text-zinc-200">{document.offerDetails.candidateName}</strong> • Position:{' '}
            <strong className="text-[#0C2086] dark:text-blue-400">{document.offerDetails.jobTitle}</strong>
          </p>
        </div>

        {/* Action Status Controls Widget */}
        <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:items-center sm:w-auto sm:shrink-0">
          {isFullyExecuted ? (
            <button
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={() => setShowDispatchModal(true)}
              className="col-span-1 flex items-center justify-center space-x-2 px-4 py-2.5 !h-11 sm:!h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-xs shadow-sm transition-colors cursor-pointer w-full sm:w-auto"
            >
              <Send className="h-4 w-4 shrink-0" />
              <span className="truncate">Dispatch Logs</span>
            </button>
          ) : isCandidateSigned ? (
            <PrimaryActionButtonSharedComponent
              id="hr-countersign-btn"
              label="Counter Sign"
              icon={<ShieldCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5 !text-white" />}
              onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
              onClick={() => setIsSignModalOpen(true)}
              className="col-span-1 w-full sm:w-auto justify-center !h-11 sm:!h-9 px-4 text-sm sm:text-xs font-bold"
            />
          ) : (
            <div className="col-span-1 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 !h-11 sm:!h-9 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center justify-center space-x-1.5 w-full sm:w-auto">
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate">Awaiting Candidate</span>
            </div>
          )}

          <ButtonSharedComponent
            variant="outline"
            size="sm"
            disabled={isDownloading}
            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
            onClick={handleDownloadPdf}
            icon={<Download className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-600 dark:text-zinc-400" />}
            className="col-span-1 w-full sm:w-auto justify-center !h-11 sm:!h-9 px-4 text-sm sm:text-xs font-bold"
          >
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </ButtonSharedComponent>
        </div>
      </div>

      {/* Download Success Toast */}
      {downloadReady && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start space-x-3 max-w-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-white text-sm">PDF Generated & Download Initiated</p>
            <p className="text-slate-300 truncate mt-0.5">{downloadReady.fileName}</p>
            <a 
              href={downloadReady.blobUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 mt-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <span>Open & Save PDF in New Tab</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <button onClick={() => setDownloadReady(null)} className="text-slate-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Workflow Progress Section 1:1 AssetSphere */}
      <CardSharedComponent className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#0C2086]/10 dark:bg-blue-500/15 text-[#0C2086] dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-headline font-bold text-sm text-slate-900 dark:text-zinc-100 leading-tight">
                Multi-Party eSignature Workflow Progress
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                Sequential cryptographic signing pipeline & automated routing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {(1 + (isCandidateSigned ? 1 : 0) + (isHRSigned ? 1 : 0) + (isFullyExecuted ? 1 : 0))} of 4 Steps Complete
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Step 1: Director Authorization */}
          <div className="p-3.5 rounded-xl border bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-slate-900 dark:text-zinc-100 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Step 1 • Completed
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="font-bold font-serif-headline text-xs text-slate-900 dark:text-zinc-100">
                Director Authorization
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                Pre-Signed by {document.offerDetails.directorName || 'Director'}
              </p>
            </div>
          </div>

          {/* Step 2: Candidate Signature */}
          <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 ${
            isCandidateSigned
              ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-slate-900 dark:text-zinc-100'
              : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-zinc-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isCandidateSigned
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}>
                Step 2 • {isCandidateSigned ? 'Completed' : 'Pending'}
              </span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                isCandidateSigned
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold'
              }`}>
                {isCandidateSigned ? <CheckCircle2 className="w-3.5 h-3.5" /> : '2'}
              </div>
            </div>
            <div>
              <p className="font-bold font-serif-headline text-xs text-slate-900 dark:text-zinc-100">
                Candidate Signature
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                {isCandidateSigned ? `Signed by ${document.offerDetails.candidateName}` : 'Awaiting Candidate Acceptance'}
              </p>
            </div>
          </div>

          {/* Step 3: HR Counter-Sign */}
          <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 ${
            isHRSigned
              ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-slate-900 dark:text-zinc-100'
              : isCandidateSigned
              ? 'bg-[#0C2086]/5 dark:bg-blue-500/10 border-[#0C2086]/30 dark:border-blue-500/40 text-slate-900 dark:text-zinc-100'
              : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-500'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isHRSigned
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : isCandidateSigned
                  ? 'text-[#0C2086] dark:text-blue-400 font-semibold'
                  : 'text-slate-400 dark:text-zinc-500'
              }`}>
                Step 3 • {isHRSigned ? 'Completed' : isCandidateSigned ? 'Action Required' : 'Queued'}
              </span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                isHRSigned
                  ? 'bg-emerald-600 text-white'
                  : isCandidateSigned
                  ? 'bg-[#0C2086] text-white font-mono text-[10px] font-bold'
                  : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 font-mono text-[10px] font-bold'
              }`}>
                {isHRSigned ? <CheckCircle2 className="w-3.5 h-3.5" /> : '3'}
              </div>
            </div>
            <div>
              <p className="font-bold font-serif-headline text-xs text-slate-900 dark:text-zinc-100">
                HR Counter-Sign
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                {isHRSigned ? 'Company Seal & Signature Applied' : isCandidateSigned ? 'Ready for Representative Execution' : 'Waiting for Candidate Signature'}
              </p>
            </div>
          </div>

          {/* Step 4: Executive Auto-Dispatch */}
          <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 ${
            isFullyExecuted
              ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-slate-900 dark:text-zinc-100'
              : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-500'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isFullyExecuted
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-zinc-500'
              }`}>
                Step 4 • {isFullyExecuted ? 'Dispatched' : 'Queued'}
              </span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                isFullyExecuted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 font-mono text-[10px] font-bold'
              }`}>
                {isFullyExecuted ? <CheckCircle2 className="w-3.5 h-3.5" /> : '4'}
              </div>
            </div>
            <div>
              <p className="font-bold font-serif-headline text-xs text-slate-900 dark:text-zinc-100">
                Executive Dispatch
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                {isFullyExecuted ? 'Encrypted Copies Sent to HR Head & CTO' : 'Auto-Dispatches upon Counter-Sign'}
              </p>
            </div>
          </div>
        </div>
      </CardSharedComponent>

      {/* Document Sheet Viewer using exact We.PLM Joining/Offer Letter format */}
      <OfferLetterPaper
        document={document}
        isHRView={true}
      />

      {/* Signature Modal */}
      <SignatureCanvasModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleApplyHRSignature}
        signerName="Sarah Jenkins (HR Representative)"
        signerEmail="hr@signcorp.com"
        signerRole="HR_REPRESENTATIVE"
      />

      {/* Executive Dispatch Simulation Modal */}
      {showDispatchModal && (
        <ExecutiveDispatchModal
          document={document}
          onClose={() => setShowDispatchModal(false)}
        />
      )}

    </div>
  );
};
