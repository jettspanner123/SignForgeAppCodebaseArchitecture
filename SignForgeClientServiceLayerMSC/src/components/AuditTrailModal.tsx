import EmptyStateSharedComponent from '../Shared/Components/EmptyStateSharedComponent';
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Globe, 
  Lock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { OfferDocument } from '../Types';
import { downloadExecutedPDF } from '../utils/pdfGenerator';
import { formatTimestamp } from '../utils/crypto';

interface AuditTrailModalProps {
  document: OfferDocument;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ document, onClose }) => {
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Certificate of Completion & Audit Trail
              </h3>
              <p className="text-xs text-slate-600">
                ESIGN Act §101 & eIDAS Tamper-Evident SHA-256 Audit Seal
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

        {/* Document Overview Summary */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Document Title & ID</span>
              <p className="text-xs font-bold text-slate-900 truncate">{document.title}</p>
              <p className="text-[10px] font-mono text-slate-500">GUID: {document.id}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Status & Execution</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {document.status}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Ref: {document.documentNumber}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">SHA-256 Cryptographic Hash</span>
              <p className="text-[10px] font-mono text-blue-600 break-all leading-tight font-semibold">
                {document.sha256Checksum || 'HASH_PENDING_COUNTER_SIGN'}
              </p>
            </div>
          </div>

          {/* Executive Contact Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-emerald-800">
                <span>HR Head Routing: {document.executives.hrHead.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  {document.executives.hrHead.status === 'SENT_SUCCESSFULLY' ? 'NOTIFIED & SENT' : 'PENDING COUNTERSIGN'}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium">Email: {document.executives.hrHead.email}</p>
              <p className="text-[10px] text-slate-500">Auto-Dispatches PDF payload immediately upon final HR signature.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-blue-800">
                <span>CTO Routing: {document.executives.cto.name}</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
                  {document.executives.cto.status === 'SENT_SUCCESSFULLY' ? 'NOTIFIED & SENT' : 'PENDING COUNTERSIGN'}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium">Email: {document.executives.cto.email}</p>
              <p className="text-[10px] text-slate-500">Auto-Dispatches PDF payload immediately upon final HR signature.</p>
            </div>
          </div>

          {/* Chronological Audit Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Chronological Legal Event Log</span>
            </h4>

            {(!document.auditTrail || document.auditTrail.length === 0) ? (
              <EmptyStateSharedComponent
                icon={<Clock className="w-6 h-6" />}
                title="No Audit Events Recorded"
                description="No legal event logs have been recorded for this document yet."
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Timestamp (UTC)</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3 min-w-[200px]">Actor & Role</th>
                    <th className="px-4 py-3 whitespace-nowrap">IP Address</th>
                    <th className="px-4 py-3 whitespace-nowrap">SHA-256 Checksum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {document.auditTrail.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {formatTimestamp(item.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {item.action}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 break-words max-w-xs">
                        {item.actor} <span className="text-slate-500 dark:text-slate-400 text-[10px] font-medium block sm:inline">({item.actorRole})</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {item.ipAddress}
                      </td>
                      <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400 font-semibold text-[10px] whitespace-nowrap">
                        {item.checksum ? item.checksum.substring(0, 16) + '...' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span>Tamper-evident hash logged to immutable audit ledger</span>
          </div>

          <div className="flex items-center space-x-3">
            {downloadReady && (
              <a
                href={downloadReady.blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
              >
                <span>Open PDF in New Tab</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download Stamped PDF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
