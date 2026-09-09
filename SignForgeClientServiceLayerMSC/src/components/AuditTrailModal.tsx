import EmptyStateSharedComponent from '../Shared/Components/EmptyStateSharedComponent';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Download,
  ExternalLink
} from 'lucide-react';
import { OfferDocument } from '../Types';
import ApplicationPDFGeneratorUtility from '../Utilities/ApplicationPDFGeneratorUtility';
import ApplicationCryptoUtility from '../Utilities/ApplicationCryptoUtility';

interface AuditTrailModalProps {
  isOpen: boolean;
  document: OfferDocument;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, document, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  const [exitDirection, setExitDirection] = useState<'down' | 'up'>('down');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadReady, setDownloadReady] = useState<{ blobUrl: string; fileName: string } | null>(null);
  const isClosingRef = useRef(false);

  useEffect(() => {
    setInternalIsOpen(isOpen);
    if (isOpen) {
      isClosingRef.current = false;
      setExitDirection('down');
      setDownloadReady(null);
    }
  }, [isOpen]);

  const handleHeaderOrBackdropClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setExitDirection('down');
    setInternalIsOpen(false);
    setTimeout(() => onClose(), 550);
  };

  const handleCancel = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setExitDirection('up');
    setInternalIsOpen(false);
    setTimeout(() => onClose(), 550);
  };

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

  return (
    <ModalSharedComponent
      isOpen={internalIsOpen}
      onClose={handleHeaderOrBackdropClose}
      exitDirection={exitDirection}
      headerCloseDirection="down"
      title="Certificate of Completion & Audit Trail"
      subtitle="ESIGN Act §101 & eIDAS Tamper-Evident SHA-256 Audit Seal"
      maxWidth="4xl"
      scrollMode="body"
      zIndex={60}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          {downloadReady && (
            <a
              href={downloadReady.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-[#0C2086] dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-900/60"
            >
              <span>Open PDF in New Tab</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <ButtonSharedComponent
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            type="button"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            isLoading={isDownloading}
            loadingText="Generating PDF..."
            icon={<Download className="w-3.5 h-3.5 !text-white" />}
          >
            Download Stamped PDF
          </PrimaryActionButtonSharedComponent>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-0.5">Document Title & ID</span>
            <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{document.title}</p>
            <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">GUID: {document.id}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-0.5">Status & Execution</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
              {document.status}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Ref: {document.documentNumber}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-0.5">SHA-256 Cryptographic Hash</span>
            <p className="text-[10px] font-mono text-[#0C2086] dark:text-blue-400 break-all leading-tight font-semibold">
              {document.sha256Checksum || 'HASH_PENDING_COUNTER_SIGN'}
            </p>
          </div>
        </div>

        {/* Executive Contact Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              <span>HR Head Routing: {document.executives?.hrHead?.name || 'HR Head'}</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-bold">
                {document.executives?.hrHead?.status === 'SENT_SUCCESSFULLY' ? 'NOTIFIED & SENT' : 'PENDING COUNTERSIGN'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium">Email: {document.executives?.hrHead?.email || document.hrHeadEmail || 'hr@theweplm.com'}</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Auto-Dispatches PDF payload immediately upon final HR signature.</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-blue-800 dark:text-blue-400">
              <span>CTO Routing: {document.executives?.cto?.name || 'CTO'}</span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-bold">
                {document.executives?.cto?.status === 'SENT_SUCCESSFULLY' ? 'NOTIFIED & SENT' : 'PENDING COUNTERSIGN'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium">Email: {document.executives?.cto?.email || document.ctoEmail || 'cto@theweplm.com'}</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Auto-Dispatches PDF payload immediately upon final HR signature.</p>
          </div>
        </div>

        {/* Chronological Audit Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#0C2086] dark:text-blue-400" />
            <span>Chronological Legal Event Log</span>
          </h4>

          {(!document.auditTrail || document.auditTrail.length === 0) ? (
            <EmptyStateSharedComponent
              icon={<Clock className="w-6 h-6" />}
              title="No Audit Events Recorded"
              description="No legal event logs have been recorded for this document yet."
            />
          ) : (
            <div className="bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-zinc-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Timestamp (UTC)</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3 min-w-[200px]">Actor & Role</th>
                    <th className="px-4 py-3 whitespace-nowrap">IP Address</th>
                    <th className="px-4 py-3 whitespace-nowrap">SHA-256 Checksum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {document.auditTrail.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                        {ApplicationCryptoUtility.current.formatTimestamp(item.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-zinc-100">
                        {item.action}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-zinc-300 break-words max-w-xs">
                        {item.actor} <span className="text-slate-500 dark:text-zinc-400 text-[10px] font-medium block sm:inline">({item.actorRole})</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                        {item.ipAddress}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#0C2086] dark:text-blue-400 font-semibold text-[10px] whitespace-nowrap">
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
    </ModalSharedComponent>
  );
};
