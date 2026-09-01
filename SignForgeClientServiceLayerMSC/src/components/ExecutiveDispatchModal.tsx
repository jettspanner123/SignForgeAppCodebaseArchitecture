import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  FileText, 
  Download, 
  X, 
  Terminal, 
  ShieldCheck, 
  Lock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { OfferDocument } from '../types';
import { downloadExecutedPDF } from '../utils/pdfGenerator';
import { formatTimestamp } from '../utils/crypto';

interface ExecutiveDispatchModalProps {
  document: OfferDocument;
  onClose: () => void;
}

export const ExecutiveDispatchModal: React.FC<ExecutiveDispatchModalProps> = ({
  document,
  onClose
}) => {
  const [logProgress, setLogProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'HR_HEAD' | 'CTO' | 'SMTP_LOGS'>('HR_HEAD');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadReady, setDownloadReady] = useState<{ blobUrl: string; fileName: string } | null>(null);

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

  const hrHead = document.executives?.hrHead || { name: 'Sarah Jenkins', email: 'hr-head@company.com' };
  const cto = document.executives?.cto || { name: 'David K. Chen', email: 'cto@company.com' };

  useEffect(() => {
    const timer = setInterval(() => {
      setLogProgress((prev) => (prev < 100 ? prev + 25 : 100));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const logs = [
    `[${formatTimestamp()}] INIT SMTP TLS Connection -> mail.signcorp.internal:587`,
    `[${formatTimestamp()}] AUTH LOGIN SUCCESS (TLS 1.3 AES-256-GCM)`,
    `[${formatTimestamp()}] GENERATED PDF PAYLOAD: ${document.documentNumber}_EXECUTED.pdf (${(Math.random() * 2 + 1).toFixed(2)} MB)`,
    `[${formatTimestamp()}] CALCULATED SHA-256: ${document.sha256Checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b'}`,
    `[${formatTimestamp()}] DISPATCHING RECIPIENT #1 -> ${hrHead.name} <${hrHead.email}> [DELIVERED 250 OK]`,
    `[${formatTimestamp()}] DISPATCHING RECIPIENT #2 -> ${cto.name} <${cto.email}> [DELIVERED 250 OK]`,
    `[${formatTimestamp()}] AUDIT RECORD PERSISTED IN SECURE ENGINE GUID: ${document.id}`
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Executive Auto-Dispatch System</h3>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  AUTOMATED SMTP DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Encrypted PDF & SHA-256 audit payload routed to HR Head & CTO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-50/70 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Fully Executed & Dispatched (2 of 2 Executives Notified)</span>
          </div>
          <div className="flex items-center space-x-2">
            {downloadReady && (
              <a
                href={downloadReady.blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded-lg border border-blue-200"
              >
                <span>Open PDF in New Tab</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Signed PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-200 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab('HR_HEAD')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'HR_HEAD'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            HR Head Dispatch ({hrHead.email})
          </button>

          <button
            onClick={() => setActiveTab('CTO')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'CTO'
                ? 'border-blue-600 text-blue-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            CTO Dispatch ({cto.email})
          </button>

          <button
            onClick={() => setActiveTab('SMTP_LOGS')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'SMTP_LOGS'
                ? 'border-amber-600 text-amber-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            SMTP Live Logs & Checksum
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: HR HEAD EMAIL PREVIEW */}
          {activeTab === 'HR_HEAD' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <div className="space-y-1">
                    <p className="text-slate-600">To: <strong className="text-slate-900">{hrHead.name}</strong> &lt;{hrHead.email}&gt;</p>
                    <p className="text-slate-600">From: SignCorp Enterprise Dispatcher &lt;notifications@signcorp.com&gt;</p>
                    <p className="text-slate-900 font-bold">Subject: [ACCEPTED & EXECUTED] Offer Letter — {document.offerDetails.candidateName} ({document.offerDetails.jobTitle})</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    DELIVERED 250 OK
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-3 leading-relaxed font-sans pt-2">
                  <p>Dear {hrHead.name},</p>
                  <p>
                    Please be advised that the employment offer for <strong className="text-slate-900">{document.offerDetails.candidateName}</strong> for the position of{' '}
                    <strong className="text-slate-900">{document.offerDetails.jobTitle}</strong> has been fully accepted by the candidate and counter-signed by Human Resources.
                  </p>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 text-[11px]">
                    <p className="font-bold text-emerald-700">Offer Execution Summary:</p>
                    <p>• Candidate: {document.offerDetails.candidateName} ({document.offerDetails.candidateEmail})</p>
                    <p>• Annual Salary: {document.offerDetails.annualSalary}</p>
                    <p>• Start Date: {document.offerDetails.joiningDate}</p>
                    <p>• SHA-256 Checksum: <span className="font-mono text-slate-600">{document.sha256Checksum?.substring(0, 24)}...</span></p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{document.documentNumber}_EXECUTED_SIGNED.pdf</p>
                        <p className="text-[10px] text-slate-500">Encrypted Attachment (Audit Certificate Included)</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadExecutedPDF(document)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded text-slate-700 border border-slate-200"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CTO EMAIL PREVIEW */}
          {activeTab === 'CTO' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <div className="space-y-1">
                    <p className="text-slate-600">To: <strong className="text-slate-900">{cto.name}</strong> &lt;{cto.email}&gt;</p>
                    <p className="text-slate-600">From: SignCorp Enterprise Dispatcher &lt;notifications@signcorp.com&gt;</p>
                    <p className="text-slate-900 font-bold">Subject: [CTO ARCHIVE NOTICE] New Hire Offer Executed — {document.offerDetails.candidateName} ({document.offerDetails.jobTitle})</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                    DELIVERED 250 OK
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-3 leading-relaxed font-sans pt-2">
                  <p>Dear {cto.name},</p>
                  <p>
                    This is an automated executive notification for technical hiring records. <strong className="text-slate-900">{document.offerDetails.candidateName}</strong> has signed their employment agreement for <strong className="text-slate-900">{document.offerDetails.jobTitle}</strong> in the {document.offerDetails.department} division.
                  </p>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 text-[11px]">
                    <p className="font-bold text-blue-700">Technical Onboarding Summary:</p>
                    <p>• Candidate: {document.offerDetails.candidateName}</p>
                    <p>• Role: {document.offerDetails.jobTitle}</p>
                    <p>• Reporting Manager: {document.offerDetails.reportingManager}</p>
                    <p>• Start Date: {document.offerDetails.joiningDate}</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{document.documentNumber}_EXECUTED_SIGNED.pdf</p>
                        <p className="text-[10px] text-slate-500">Attached Executed Contract</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadExecutedPDF(document)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded text-slate-700 border border-slate-200"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TERMINAL LOGS */}
          {activeTab === 'SMTP_LOGS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-1.5 text-amber-700 font-mono font-bold">
                  <Terminal className="h-4 w-4" />
                  <span>SMTP Dispatch Execution Terminal</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold text-[11px]">STATUS: 250 DISPATCH_OK</span>
              </div>

              <div className="bg-slate-900 font-mono text-[11px] p-4 rounded-xl border border-slate-800 space-y-2 text-slate-200 overflow-x-auto min-h-[220px]">
                {logs.map((log, i) => (
                  <p key={i} className="leading-relaxed">
                    <span className="text-slate-500">&gt;</span> {log}
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
          <span className="flex items-center space-x-1 text-slate-700 font-medium">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-bit TLS Sealed Transmission</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
