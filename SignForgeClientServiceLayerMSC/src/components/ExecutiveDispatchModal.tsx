import React, { useEffect, useRef, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { OfferDocument } from '../Types';
import ApplicationPDFGeneratorUtility from '../Utilities/ApplicationPDFGeneratorUtility';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import BadgeSharedComponent from '../Shared/Components/BadgeSharedComponent';

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

  const hrHead = document.executives?.hrHead || { name: 'Sarah Jenkins', email: 'hr-head@company.com' };
  const cto = document.executives?.cto || { name: 'David K. Chen', email: 'cto@company.com' };

  return (
    <ModalSharedComponent
      isOpen={internalIsOpen}
      onClose={handleHeaderOrBackdropClose}
      exitDirection={exitDirection}
      headerCloseDirection="down"
      title="Executive Routing"
      subtitle="Recipients for this executed offer"
      maxWidth="lg"
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
            Download Signed PDF
          </PrimaryActionButtonSharedComponent>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Document Overview Strip */}
        <div className="hairline-border-strong rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
              {document.documentNumber}
              <span className="font-normal text-slate-400 dark:text-zinc-500"> · {document.offerDetails.candidateName}</span>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Ready for executive distribution</p>
          </div>
          <BadgeSharedComponent status={document.status} size="sm" className="shrink-0" />
        </div>

        {/* Recipients */}
        <div className="bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-zinc-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Role</th>
                <th className="px-4 py-3">Recipient</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-zinc-100 whitespace-nowrap">HR Head</td>
                <td className="px-4 py-3">
                  <span className="text-slate-900 dark:text-zinc-100 font-medium">{hrHead.name}</span>
                  <span className="block text-[10px] text-slate-400 dark:text-zinc-500">{hrHead.email}</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-zinc-100 whitespace-nowrap">CTO</td>
                <td className="px-4 py-3">
                  <span className="text-slate-900 dark:text-zinc-100 font-medium">{cto.name}</span>
                  <span className="block text-[10px] text-slate-400 dark:text-zinc-500">{cto.email}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ModalSharedComponent>
  );
};
