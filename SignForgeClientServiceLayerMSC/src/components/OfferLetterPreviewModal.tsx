import React, { useState } from 'react';
import { Download } from 'lucide-react';
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

export const OfferLetterPreviewModal: React.FC<OfferLetterPreviewModalProps> = ({ document, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [exitDirection, setExitDirection] = useState<'down' | 'up'>('down');
  const [isDownloading, setIsDownloading] = useState(false);

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
      maxWidth="5xl"
      scrollMode="body"
      heightMode="full"
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
      {document.isUploadedPdf && document.pdfUrl ? (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md relative min-h-[560px]">
          <object data={document.pdfUrl} type="application/pdf" className="w-full h-[560px] bg-white">
            <div className="p-8 text-center text-slate-300 space-y-2">
              <p className="font-bold font-serif-headline">Uploaded PDF Document</p>
              <p className="text-xs text-slate-400 font-mono">{document.pdfFileName}</p>
            </div>
          </object>
        </div>
      ) : (
        <OfferLetterPaper document={document} />
      )}
    </ModalSharedComponent>
  );
};

export default OfferLetterPreviewModal;
