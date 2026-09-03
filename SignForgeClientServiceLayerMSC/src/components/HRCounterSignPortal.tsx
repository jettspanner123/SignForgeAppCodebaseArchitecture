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
import { generateSHA256, getSimulatedIP } from '../utils/crypto';
import { ExecutiveDispatchModal } from './ExecutiveDispatchModal';
import { downloadExecutedPDF } from '../utils/pdfGenerator';
import { triggerHapticFeedback } from '../utils/haptics';
import { OfferLetterPaper } from './OfferLetterPaper';

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
    const result = await downloadExecutedPDF(document);
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
    const ip = getSimulatedIP();

    const finalChecksum = await generateSHA256(
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
      
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              HR COUNTER-SIGNATURE & EXECUTIVE ROUTING
            </span>
            <span className="text-xs text-slate-500">Ref: {document.documentNumber}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-headline tracking-tight text-slate-900 mt-2 leading-tight">
            Counter-Sign <br className="sm:hidden" />Employment Offer
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Candidate: <strong className="text-slate-900">{document.offerDetails.candidateName}</strong> • Position:{' '}
            <strong className="text-indigo-600">{document.offerDetails.jobTitle}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:flex sm:items-center gap-3 w-full sm:w-auto">
          {isFullyExecuted ? (
            <button
              onPointerDown={() => triggerHapticFeedback(12)}
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 !h-11 sm:!h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-xs shadow-sm transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>View Executive Dispatch Logs</span>
            </button>
          ) : isCandidateSigned ? (
            <button
              id="hr-countersign-btn"
              onPointerDown={() => triggerHapticFeedback(12)}
              onClick={() => setIsSignModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 !h-11 sm:!h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Counter-Sign & Execute Offer</span>
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 !h-11 sm:!h-9 text-amber-800 text-xs font-semibold flex items-center justify-center space-x-2">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>Awaiting Candidate Signature First</span>
            </div>
          )}

          <button
            disabled={isDownloading}
            onPointerDown={() => triggerHapticFeedback(12)}
            onClick={handleDownloadPdf}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 !h-11 sm:!h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-sm sm:text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-slate-600" />
                <span>Download PDF</span>
              </>
            )}
          </button>
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

      {/* Workflow Progress Tracker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Multi-Party eSignature Workflow Progress</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Step 1: Director Seal */}
          <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">1. Director Authorization</p>
              <p className="text-[11px] text-emerald-700 font-medium">Pre-Signed ({document.offerDetails.directorName || 'Director'})</p>
            </div>
          </div>

          {/* Step 2: Candidate Sign */}
          <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
            isCandidateSigned ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              isCandidateSigned ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">2. Candidate Signature</p>
              <p className="text-[11px]">{isCandidateSigned ? `Signed by ${document.offerDetails.candidateName}` : 'Pending Candidate'}</p>
            </div>
          </div>

          {/* Step 3: HR Counter-Sign */}
          <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
            isHRSigned ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              isHRSigned ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
            }`}>
              3
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">3. HR Counter-Sign</p>
              <p className="text-[11px]">{isHRSigned ? 'Company Seal Applied' : 'Ready for Counter-Signature'}</p>
            </div>
          </div>

          {/* Step 4: Executive Dispatch */}
          <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
            isFullyExecuted ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              isFullyExecuted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              4
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">4. Executive Auto-Dispatch</p>
              <p className="text-[11px]">
                {isFullyExecuted ? 'Sent to HR Head & CTO' : `HR Head: ${document.executives.hrHead.email}`}
              </p>
            </div>
          </div>

        </div>
      </div>

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
