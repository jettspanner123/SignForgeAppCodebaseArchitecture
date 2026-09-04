import { PDFDocument } from 'pdf-lib';
import html2canvas from 'html2canvas-pro';
import { OfferDocument } from '../Types';
import ApplicationPDFGeneratorUtility from '../Utilities/ApplicationPDFGeneratorUtility';

export default class PDFGeneratorService {
  public static current = new PDFGeneratorService();

  /**
   * Directly captures the 3 OfferLetterPaper DOM elements and compiles a pixel-perfect 3-page PDF.
   */
  public async generateAndDownloadOfferLetterPDF(doc: OfferDocument): Promise<{
    success: boolean;
    blobUrl?: string;
    fileName?: string;
    error?: string;
  }> {
    try {
      // 1. If it's an uploaded custom PDF, delegate to stamp overlay handler
      if (doc.isUploadedPdf && doc.pdfUrl) {
        return await ApplicationPDFGeneratorUtility.current.downloadExecutedPDF(doc);
      }

      // 2. Locate the 3 Offer Letter DOM Pages
      const page1El = document.getElementById('offer-letter-page-1');
      const page2El = document.getElementById('offer-letter-page-2');
      const page3El = document.getElementById('offer-letter-page-3');

      if (!page1El || !page2El || !page3El) {
        // If elements are not mounted in current DOM, fallback to vector pdf-lib generation
        console.warn('DOM page elements not found, falling back to vector generator');
        return await ApplicationPDFGeneratorUtility.current.downloadExecutedPDF(doc);
      }

      const pageElements = [page1El, page2El, page3El];

      // 3. Create a new PDF document via pdf-lib
      const pdfDoc = await PDFDocument.create();

      // 4. Capture each page sequentially at high-DPI (scale: 2)
      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i];

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            // Inject print-only styling for tighter horizontal padding and scaled typography
            const printStyle = clonedDoc.createElement('style');
            printStyle.innerHTML = `
              #offer-letter-page-1,
              #offer-letter-page-2,
              #offer-letter-page-3 {
                padding: 32px 38px !important;
                line-height: 1.4 !important;
                box-shadow: none !important;
                border: none !important;
                background-color: #ffffff !important;
                color: #0f172a !important;
                width: 100% !important;
                max-width: none !important;
              }
              #offer-letter-page-1 {
                font-size: 0.80em !important;
                text-align: justify !important;
              }
              #offer-letter-page-2,
              #offer-letter-page-3 {
                font-size: 0.86em !important;
              }
            `;
            clonedDoc.head.appendChild(printStyle);
          },
        });

        const pngDataUrl = canvas.toDataURL('image/png');
        const embeddedImg = await pdfDoc.embedPng(pngDataUrl);

        // Standard A4 dimensions in PDF points (72 DPI)
        const a4Width = 595.28;
        const a4Height = 841.89;

        // Calculate aspect-ratio fitted height or exact dimensions
        const canvasAspectRatio = canvas.width / canvas.height;
        const computedHeight = a4Width / canvasAspectRatio;

        // Use custom page height if content is longer than A4, otherwise use standard A4
        const pageHeight = Math.max(a4Height, computedHeight);
        const pageWidth = a4Width;

        const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

        pdfPage.drawImage(embeddedImg, {
          x: 0,
          y: pageHeight - computedHeight,
          width: pageWidth,
          height: computedHeight,
        });
      }

      // 5. Compile and save PDF bytes
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const candidateNameSanitized = doc.offerDetails.candidateName
        ? doc.offerDetails.candidateName.trim().replace(/[^a-zA-Z0-9_-]/g, '_')
        : 'Candidate';
      const fileName = `${candidateNameSanitized}_Offer_Letter.pdf`;

      // 6. Trigger automatic browser download
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = fileName;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      return {
        success: true,
        blobUrl,
        fileName,
      };
    } catch (err: unknown) {
      console.error('PDFGeneratorService failed to generate PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown PDF generation error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
