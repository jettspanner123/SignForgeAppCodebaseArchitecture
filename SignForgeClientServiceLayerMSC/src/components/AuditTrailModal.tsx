import EmptyStateSharedComponent from '../Shared/Components/EmptyStateSharedComponent';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import BadgeSharedComponent from '../Shared/Components/BadgeSharedComponent';
import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Download,
  ExternalLink,
  Mail
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
        {/* Document Overview Strip */}
        <div className="hairline-border-strong rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
              {document.documentNumber}
              <span className="font-normal text-slate-400 dark:text-zinc-500"> · {document.title}</span>
            </p>
            <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
              SHA-256 {document.sha256Checksum || 'HASH_PENDING_COUNTER_SIGN'}
            </p>
          </div>
          <BadgeSharedComponent status={document.status} size="sm" className="shrink-0" />
        </div>

        {/* Executive Routing */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#0C2086] dark:text-blue-400" />
            <span>Executive Routing</span>
          </h4>
          <div className="bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-zinc-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Role</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-zinc-100 whitespace-nowrap">HR Head</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-900 dark:text-zinc-100 font-medium">{document.executives?.hrHead?.name || 'HR Head'}</span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500">{document.executives?.hrHead?.email || document.hrHeadEmail || 'hr@theweplm.com'}</span>
                  </td>
                  <td className={`px-4 py-3 font-semibold text-[11px] whitespace-nowrap ${document.executives?.hrHead?.status === 'SENT_SUCCESSFULLY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                    {document.executives?.hrHead?.status === 'SENT_SUCCESSFULLY' ? 'Notified & Sent' : 'Pending Countersign'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-zinc-100 whitespace-nowrap">CTO</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-900 dark:text-zinc-100 font-medium">{document.executives?.cto?.name || 'CTO'}</span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500">{document.executives?.cto?.email || document.ctoEmail || 'cto@theweplm.com'}</span>
                  </td>
                  <td className={`px-4 py-3 font-semibold text-[11px] whitespace-nowrap ${document.executives?.cto?.status === 'SENT_SUCCESSFULLY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                    {document.executives?.cto?.status === 'SENT_SUCCESSFULLY' ? 'Notified & Sent' : 'Pending Countersign'}
                  </td>
                </tr>
              </tbody>
            </table>
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
