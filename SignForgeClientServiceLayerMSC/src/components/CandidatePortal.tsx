import React, { useState } from 'react';
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
  Clock,
  Send,
  Sparkles,
  ArrowRight,
  X,
  ExternalLink
} from 'lucide-react';
import { OfferDocument, SignatureData } from '../types';
import { SignatureCanvasModal } from './SignatureCanvas';
import { downloadExecutedPDF } from '../utils/pdfGenerator';
import { generateSHA256, getSimulatedIP } from '../utils/crypto';
import { OfferLetterPaper } from './OfferLetterPaper';

interface CandidatePortalProps {
  document: OfferDocument;
  onUpdateDocument: (updatedDoc: OfferDocument) => void;
  onSwitchToHRView?: () => void;
}

export const CandidatePortal: React.FC<CandidatePortalProps> = ({
  document,
  onUpdateDocument,
  onSwitchToHRView
}) => {
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadReady, setDownloadReady] = useState<{ blobUrl: string; fileName: string } | null>(null);

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Offer Letter Loaded</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          This offer link may have expired or was removed from storage. You can create a new offer or switch to the main dashboard.
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          {onSwitchToHRView && (
            <button
              onClick={onSwitchToHRView}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Go to HR Dashboard
            </button>
          )}
        </div>
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

  const isAlreadySigned = !!document.candidateSignature;

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleApplySignature = async (sigData: SignatureData) => {
    const now = new Date().toISOString();
    const ip = getSimulatedIP();

    const auditChecksum = await generateSHA256(`CANDIDATE_SIGNED-${document.id}-${sigData.sha256Hash}`);

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

    onUpdateDocument(updatedDoc);
    triggerCelebration();
  };

  const handleRejectOffer = async () => {
    if (!rejectReason.trim()) return;
    const now = new Date().toISOString();
    const ip = getSimulatedIP();

    const updatedDoc: OfferDocument = {
      ...document,
      status: 'REJECTED',
      updatedAt: now,
      rejectionReason: rejectReason,
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          action: 'Offer Declined by Candidate',
          actor: document.offerDetails.candidateName,
          actorRole: 'Candidate',
          ipAddress: ip,
          details: `Reason: ${rejectReason}`,
          checksum: await generateSHA256(`REJECTED-${document.id}`)
        },
        ...document.auditTrail
      ]
    };

    onUpdateDocument(updatedDoc);
    setIsRejecting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome Candidate Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              CANDIDATE SIGNING PORTAL
            </span>
            <span className="text-xs text-slate-500">Ref: {document.documentNumber}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Employment Offer for {document.offerDetails.candidateName}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Issued by <strong className="text-slate-900">{document.companyName}</strong> for the role of{' '}
            <strong className="text-blue-600">{document.offerDetails.jobTitle}</strong>.
          </p>
        </div>

        {/* Action Status Widget */}
        <div className="flex items-center space-x-3">
          {isAlreadySigned ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-3 text-emerald-700">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">Offer Accepted & eSigned!</p>
                <p className="text-[11px] text-emerald-700 font-medium">Pending HR Counter-Signature</p>
              </div>
            </div>
          ) : document.status === 'REJECTED' ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center space-x-3 text-rose-700">
              <XCircle className="h-6 w-6 text-rose-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">Offer Declined</p>
                <p className="text-[11px] text-rose-600">{document.rejectionReason}</p>
              </div>
            </div>
          ) : (
            <button
              id="candidate-sign-btn"
              onClick={() => setIsSignModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors"
            >
              <PenTool className="h-4 w-4" />
              <span>Review & Sign Offer</span>
            </button>
          )}

          <button
            disabled={isDownloading}
            onClick={handleDownloadPdf}
            className="flex items-center space-x-1.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
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

      {/* Download Success Toast Banner */}
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

      {/* Offer Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Position / Role</span>
          <span className="font-bold text-slate-900 text-sm block truncate">{document.offerDetails.jobTitle}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Annual Compensation</span>
          <span className="font-extrabold text-emerald-600 text-base block">{document.offerDetails.annualSalary}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Target Start Date</span>
          <span className="font-bold text-slate-900 text-sm block">{document.offerDetails.joiningDate}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Work Location</span>
          <span className="font-bold text-slate-900 text-sm block truncate">{document.offerDetails.workLocation}</span>
        </div>
      </div>

      {/* Post-Signature Next Steps Card */}
      {isAlreadySigned && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Congratulations, {document.offerDetails.candidateName}!</h3>
                <p className="text-xs text-emerald-800 font-medium">Your electronic signature has been cryptographically recorded with SHA-256 seal.</p>
              </div>
            </div>

            {onSwitchToHRView && (
              <button
                onClick={onSwitchToHRView}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <span>Switch to HR Counter-Sign Step</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Document Viewer (Uploaded PDF vs Generated Template) */}
      {document.isUploadedPdf && document.pdfUrl ? (
        <div className="bg-white text-slate-900 rounded-2xl shadow-lg p-6 border border-slate-200 font-sans space-y-6 max-w-4xl mx-auto relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  UPLOADED PDF OFFER DOCUMENT
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {document.pdfFileName || document.documentNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Please review the uploaded PDF below and apply your candidate eSignature inside the document.
              </p>
            </div>
            
            <button
              onClick={() => downloadExecutedPDF(document)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center space-x-1.5 self-start sm:self-auto"
            >
              <Download className="h-4 w-4 text-slate-600" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Embedded PDF Viewer */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md relative">
            <object
              data={document.pdfUrl}
              type="application/pdf"
              className="w-full h-[520px] bg-white"
            >
              <div className="p-8 text-center text-slate-300 space-y-2">
                <p className="font-bold">Uploaded PDF Document</p>
                <p className="text-xs text-slate-400">{document.pdfFileName}</p>
              </div>
            </object>

            {/* Interactive eSign Floating Overlay Bar on top of PDF Viewer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-100">
              <div className="flex items-center space-x-2 text-xs">
                <PenTool className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold">Interactive eSignature Field inside PDF:</span>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => !isAlreadySigned && setIsSignModalOpen(true)}
                  disabled={isAlreadySigned}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isAlreadySigned
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md animate-pulse cursor-pointer'
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
                      <span>Click to eSign Candidate Signature inside PDF</span>
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
              className={`border-2 rounded-xl p-4 transition-all ${
                isAlreadySigned
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-dashed border-emerald-500 bg-emerald-50/50 hover:bg-emerald-100/60 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">1. Candidate eSignature inside PDF</span>
                {isAlreadySigned ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">VERIFIED</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded animate-pulse">CLICK TO SIGN</span>
                )}
              </div>
              {document.candidateSignature ? (
                <div className="space-y-1 text-xs">
                  {document.candidateSignature.type === 'TYPE' ? (
                    <p className="text-xl font-bold text-slate-900 py-1" style={{ fontFamily: document.candidateSignature.fontFamily }}>
                      {document.candidateSignature.value}
                    </p>
                  ) : (
                    <img src={document.candidateSignature.value} alt="Signature" className="max-h-12 py-1 object-contain" />
                  )}
                  <p className="font-bold text-slate-900">Signed: {document.candidateSignature.signedBy}</p>
                  <p className="text-[10px] text-slate-500">IP: {document.candidateSignature.ipAddress}</p>
                </div>
              ) : (
                <div className="py-4 text-center text-emerald-700 space-y-1">
                  <PenTool className="h-5 w-5 mx-auto opacity-75" />
                  <p className="text-xs font-bold">Apply Candidate Signature</p>
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">2. HR Counter-Sign inside PDF</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${document.hrSignature ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {document.hrSignature ? 'COUNTERSIGNED' : 'PENDING COUNTERSIGN'}
                </span>
              </div>
              {document.hrSignature ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Signed by HR: {document.hrSignature.signedBy}</p>
                  <p className="text-[10px] text-slate-500">IP: {document.hrSignature.ipAddress}</p>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-400">
                  <ShieldCheck className="h-5 w-5 mx-auto opacity-50 mb-1" />
                  <p className="text-xs italic">Pending HR Counter-Signature</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
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
            onClick={() => setIsRejecting(true)}
            className="text-xs text-slate-500 hover:text-rose-600 underline transition-colors font-medium"
          >
            Decline Offer or Request Terms Revision
          </button>
        </div>
      )}

      {/* Decline Modal */}
      {isRejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-slate-900 shadow-xl">
            <h3 className="text-base font-bold text-rose-600">Decline Employment Offer</h3>
            <p className="text-xs text-slate-500">Please provide feedback or the reason for declining this offer.</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Accepted another offer, start date conflict..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsRejecting(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOffer}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

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
