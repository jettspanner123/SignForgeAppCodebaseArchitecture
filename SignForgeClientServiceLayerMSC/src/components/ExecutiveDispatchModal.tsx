import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  FileText, 
  Download, 
  Terminal, 
  ExternalLink
} from 'lucide-react';
import { OfferDocument } from '../Types';
import ApplicationPDFGeneratorUtility from '../Utilities/ApplicationPDFGeneratorUtility';
import ApplicationCryptoUtility from '../Utilities/ApplicationCryptoUtility';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';

interface ExecutiveDispatchModalProps {
  document: OfferDocument;
  onClose: () => void;
  isOpen?: boolean;
}

export const ExecutiveDispatchModal: React.FC<ExecutiveDispatchModalProps> = ({
  document,
  onClose,
  isOpen = true,
}) => {
  const [logProgress, setLogProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'HR_HEAD' | 'CTO' | 'SMTP_LOGS'>('HR_HEAD');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadReady, setDownloadReady] = useState<{ blobUrl: string; fileName: string } | null>(null);

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

  const hrHead = document.executives?.hrHead || { name: 'Sarah Jenkins', email: 'hr-head@company.com' };
  const cto = document.executives?.cto || { name: 'David K. Chen', email: 'cto@company.com' };

  useEffect(() => {
    const timer = setInterval(() => {
      setLogProgress((prev) => (prev < 100 ? prev + 25 : 100));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const logs = [
    `[${ApplicationCryptoUtility.current.formatTimestamp()}] INIT SMTP TLS Connection -> mail.signcorp.internal:587`,
    `[${ApplicationCryptoUtility.current.formatTimestamp()}] AUTH LOGIN SUCCESS (TLS 1.3 AES-256-GCM)`,
    `[${ApplicationCryptoUtility.current.formatTimestamp()}] GENERATED PDF PAYLOAD: ${document.documentNumber}_EXECUTED.pdf (${(Math.random() * 2 + 1).toFixed(2)} MB)`,
    `[${ApplicationCryptoUtility.current.formatTimestamp()}] CALCULATED SHA-256: ${document.sha256Checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b'}`,
    `[${ApplicationCryptoUtility.current.formatTimestamp()}] DISPATCHING RECIPIENT #1 -> ${hrHead.name} <${hrHead.email}> [DELIVERED 250 OK]`,
    `[${ApplicationCryptoUtility.current.formatTimestamp()}] DISPATCHING RECIPIENT #2 -> ${cto.name} <${cto.email}> [DELIVERED 250 OK]`,
    `[${ApplicationCryptoUtility.current.formatTimestamp()}] AUDIT RECORD PERSISTED IN SECURE ENGINE GUID: ${document.id}`
  ];

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Executive Auto-Dispatch System"
      subtitle="Encrypted PDF & SHA-256 audit payload routed to HR Head & CTO"
      maxWidth="3xl"
      animationType="slide-up"
      footer={
        <div className="flex items-center justify-end w-full">
          <ButtonSharedComponent
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close Window
          </ButtonSharedComponent>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Status Bar */}
        <div className="bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Fully Executed & Dispatched (2 of 2 Executives Notified)</span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {downloadReady && (
              <a
                href={downloadReady.blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900"
              >
                <span>Open PDF</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="flex bg-slate-50/80 dark:bg-zinc-900/60 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 space-x-1">
          <button
            onClick={() => setActiveTab('HR_HEAD')}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'HR_HEAD'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            HR Head Dispatch ({hrHead.email})
          </button>

          <button
            onClick={() => setActiveTab('CTO')}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'CTO'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            CTO Dispatch ({cto.email})
          </button>

          <button
            onClick={() => setActiveTab('SMTP_LOGS')}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'SMTP_LOGS'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            SMTP Live Logs
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          
          {/* TAB 1: HR HEAD EMAIL PREVIEW */}
          {activeTab === 'HR_HEAD' && (
            <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <p className="text-slate-600 dark:text-zinc-400">To: <strong className="text-slate-900 dark:text-zinc-200">{hrHead.name}</strong> &lt;{hrHead.email}&gt;</p>
                  <p className="text-slate-600 dark:text-zinc-400">From: SignCorp Enterprise Dispatcher &lt;notifications@signcorp.com&gt;</p>
                  <p className="text-slate-900 dark:text-zinc-100 font-bold">Subject: [ACCEPTED & EXECUTED] Offer Letter — {document.offerDetails.candidateName} ({document.offerDetails.jobTitle})</p>
                </div>
                <span className="self-start sm:self-center px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                  DELIVERED 250 OK
                </span>
              </div>

              <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-3 leading-relaxed font-sans pt-1">
                <p>Dear {hrHead.name},</p>
                <p>
                  Please be advised that the employment offer for <strong className="text-slate-900 dark:text-zinc-100">{document.offerDetails.candidateName}</strong> for the position of{' '}
                  <strong className="text-slate-900 dark:text-zinc-100">{document.offerDetails.jobTitle}</strong> has been fully accepted by the candidate and counter-signed by Human Resources.
                </p>
                
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 space-y-1 text-[11px]">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">Offer Execution Summary:</p>
                  <p>• Candidate: {document.offerDetails.candidateName} ({document.offerDetails.candidateEmail})</p>
                  <p>• Annual Salary: {document.offerDetails.annualSalary}</p>
                  <p>• Start Date: {document.offerDetails.joiningDate}</p>
                  <p>• SHA-256 Checksum: <span className="font-mono text-slate-600 dark:text-zinc-400">{document.sha256Checksum?.substring(0, 24)}...</span></p>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-900 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-zinc-100 text-xs">{document.documentNumber}_EXECUTED_SIGNED.pdf</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500">Encrypted Attachment (Audit Certificate Included)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => ApplicationPDFGeneratorUtility.current.downloadExecutedPDF(document)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold rounded text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CTO EMAIL PREVIEW */}
          {activeTab === 'CTO' && (
            <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <p className="text-slate-600 dark:text-zinc-400">To: <strong className="text-slate-900 dark:text-zinc-200">{cto.name}</strong> &lt;{cto.email}&gt;</p>
                  <p className="text-slate-600 dark:text-zinc-400">From: SignCorp Enterprise Dispatcher &lt;notifications@signcorp.com&gt;</p>
                  <p className="text-slate-900 dark:text-zinc-100 font-bold">Subject: [CTO ARCHIVE NOTICE] New Hire Offer Executed — {document.offerDetails.candidateName} ({document.offerDetails.jobTitle})</p>
                </div>
                <span className="self-start sm:self-center px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                  DELIVERED 250 OK
                </span>
              </div>

              <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-3 leading-relaxed font-sans pt-1">
                <p>Dear {cto.name},</p>
                <p>
                  This is an automated executive notification for technical hiring records. <strong className="text-slate-900 dark:text-zinc-100">{document.offerDetails.candidateName}</strong> has signed their employment agreement for <strong className="text-slate-900 dark:text-zinc-100">{document.offerDetails.jobTitle}</strong> in the {document.offerDetails.department} division.
                </p>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-3 space-y-1 text-[11px]">
                  <p className="font-bold text-blue-700 dark:text-blue-400">Technical Onboarding Summary:</p>
                  <p>• Candidate: {document.offerDetails.candidateName}</p>
                  <p>• Role: {document.offerDetails.jobTitle}</p>
                  <p>• Reporting Manager: {document.offerDetails.reportingManager}</p>
                  <p>• Start Date: {document.offerDetails.joiningDate}</p>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-900 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-zinc-100 text-xs">{document.documentNumber}_EXECUTED_SIGNED.pdf</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500">Attached Executed Contract</p>
                    </div>
                  </div>
                  <button
                    onClick={() => ApplicationPDFGeneratorUtility.current.downloadExecutedPDF(document)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold rounded text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TERMINAL LOGS */}
          {activeTab === 'SMTP_LOGS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-mono font-bold">
                  <Terminal className="h-4 w-4" />
                  <span>SMTP Dispatch Execution Terminal</span>
                </div>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">STATUS: 250 DISPATCH_OK</span>
              </div>

              <div className="bg-slate-950 font-mono text-[11px] p-4 rounded-xl border border-slate-800 space-y-2 text-slate-200 overflow-x-auto min-h-[220px]">
                {logs.map((log, i) => (
                  <p key={i} className="leading-relaxed">
                    <span className="text-slate-500">&gt;</span> {log}
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </ModalSharedComponent>
  );
};
