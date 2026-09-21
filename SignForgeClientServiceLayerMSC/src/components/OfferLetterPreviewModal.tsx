import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';
import { OfferDocument } from '../Types';
import { OfferLetterPaper } from './OfferLetterPaper';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import PDFGeneratorService from '../Services/PDFGeneratorService';

interface OfferLetterPreviewModalProps {
  document: OfferDocument;
  onClose: () => void;
}

const PAGE_TABS: { page: 1 | 2 | 3; label: string; fullName: string }[] = [
  { page: 1, label: '1', fullName: 'Offer Letter' },
  { page: 2, label: '2', fullName: 'Terms & Conditions' },
  { page: 3, label: '3', fullName: 'Execution & Acceptance' },
];

export const OfferLetterPreviewModal: React.FC<OfferLetterPreviewModalProps> = ({ document, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [exitDirection, setExitDirection] = useState<'down' | 'up'>('down');
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1);

  const isUploadedPdf = Boolean(document.isUploadedPdf && document.pdfUrl);

  const handleHeaderOrBackdropClose = () => {
    setExitDirection('down');
    setIsOpen(false);
    setTimeout(() => onClose(), 550);
  };

  const handleCancel = () => {
    setExitDirection('up');
    setIsOpen(false);
    setTimeout(() => onClose(), 550);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const result = await PDFGeneratorService.current.generateAndDownloadOfferLetterPDF(document);
    setIsDownloading(false);

    if (!result.success && result.error) {
      alert(`Could not generate PDF: ${result.error}`);
    }
  };

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={handleHeaderOrBackdropClose}
      exitDirection={exitDirection}
      headerCloseDirection="down"
      title="Offer Letter Preview"
      subtitle={`Document #${document.documentNumber} • ${document.offerDetails?.candidateName || 'Candidate'}`}
      maxWidth="2xl"
      scrollMode="body"
      heightMode="full"
      headerActions={
        !isUploadedPdf && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-9">
            {PAGE_TABS.map((tab) => (
              <button
                key={tab.page}
                type="button"
                title={tab.fullName}
                onClick={() => setCurrentPage(tab.page)}
                className="relative flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold transition-colors cursor-pointer select-none"
              >
                {currentPage === tab.page && (
                  <motion.div
                    layoutId="offerLetterPreviewPagePill"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-md shadow-xs"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    currentPage === tab.page
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        )
      }
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ButtonSharedComponent
            variant="secondary"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            isLoading={isDownloading}
            loadingText="Generating PDF..."
            icon={<Download className="w-3.5 h-3.5 !text-white" />}
          >
            Download PDF
          </PrimaryActionButtonSharedComponent>
        </div>
      }
    >
      {isUploadedPdf ? (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md relative min-h-[560px]">
          <object data={document.pdfUrl} type="application/pdf" className="w-full h-[560px] bg-white">
            <div className="p-8 text-center text-slate-300 space-y-2">
              <p className="font-bold font-serif-headline">Uploaded PDF Document</p>
              <p className="text-xs text-slate-400 font-mono">{document.pdfFileName}</p>
            </div>
          </object>
        </div>
      ) : (
        <OfferLetterPaper document={document} visiblePage={currentPage} />
      )}
    </ModalSharedComponent>
  );
};

export default OfferLetterPreviewModal;
