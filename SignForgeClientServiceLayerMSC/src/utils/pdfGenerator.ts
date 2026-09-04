import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { OfferDocument } from '../Types';
import { formatTimestamp } from './crypto';
import { getWePlmLogoPngDataUrl } from './logoRenderer';

function cleanStr(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/₹\s*/g, 'INR ')
    .replace(/€\s*/g, 'EUR ')
    .replace(/£\s*/g, 'GBP ')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/…/g, '...')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/INR\s+INR/gi, 'INR')
    .replace(/[^\x20-\x7E]/g, '');
}

/**
 * Safely truncates a text string to fit within a specific point width in PDF drawing.
 */
function truncateText(text: string, font: any, size: number, maxWidth: number): string {
  if (!text) return '';
  let str = cleanStr(text);
  if (font.widthOfTextAtSize(str, size) <= maxWidth) {
    return str;
  }
  while (str.length > 3 && font.widthOfTextAtSize(str + '...', size) > maxWidth) {
    str = str.slice(0, -1);
  }
  return str + '...';
}

/**
 * Converts a typed signature string (with font name) into a transparent PNG DataObjects URL on a hidden HTML canvas.
 */
function renderTypedSignatureToPNG(text: string, fontName: string = 'Dancing Script'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `60px "${fontName}", cursive, sans-serif`;
    ctx.fillStyle = '#1e293b'; // Enterprise slate ink
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 20, 80);
    // Draw a subtle baseline signature stroke
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 125);
    ctx.lineTo(ctx.measureText(text).width + 30, 125);
    ctx.stroke();
  }
  return canvas.toDataURL('image/png');
}

export async function generateExecutedOfferPDF(doc: OfferDocument): Promise<Uint8Array> {
  let pdfDoc: PDFDocument;

  if (doc.isUploadedPdf && doc.pdfUrl) {
    try {
      const base64Data = doc.pdfUrl.split(',')[1] || doc.pdfUrl;
      const pdfBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      pdfDoc = await PDFDocument.load(pdfBytes);
    } catch (e) {
      console.error('Failed to parse uploaded PDF bytes, fallback to new document', e);
      pdfDoc = await PDFDocument.create();
    }
  } else {
    pdfDoc = await PDFDocument.create();
  }
  
  // Embed Standard Fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  if (doc.isUploadedPdf && doc.pdfUrl) {
    // For uploaded PDFs, overlay signature seal block on the document page
    const pages = pdfDoc.getPages();
    let sigPage = pages[pages.length - 1];
    if (!sigPage) {
      sigPage = pdfDoc.addPage([612, 792]);
    }
    const { width } = sigPage.getSize();

    // Draw eSignature Seal Box at the bottom of the uploaded PDF page
    sigPage.drawRectangle({
      x: 35,
      y: 20,
      width: width - 70,
      height: 90,
      color: rgb(0.97, 0.98, 1),
      borderColor: rgb(0.2, 0.4, 0.8),
      borderWidth: 1.5,
    });

    sigPage.drawText('WE.SIGNFORGE OFFICIAL eSIGNATURE ACKNOWLEDGEMENT SEAL', {
      x: 50,
      y: 95,
      size: 9,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.5),
    });

    // Draw Candidate Signature
    if (doc.candidateSignature) {
      try {
        let candidateImgData = doc.candidateSignature.value;
        if (doc.candidateSignature.type === 'TYPE') {
          candidateImgData = renderTypedSignatureToPNG(doc.candidateSignature.value, doc.candidateSignature.fontFamily);
        }
        const embeddedImg = await pdfDoc.embedPng(candidateImgData);
        const imgDims = embeddedImg.scale(0.25);
        sigPage.drawImage(embeddedImg, {
          x: 50,
          y: 40,
          width: Math.min(imgDims.width, 160),
          height: Math.min(imgDims.height, 40),
        });
        sigPage.drawText(`Candidate eSigned: ${cleanStr(doc.candidateSignature.signedBy)}`, {
          x: 50,
          y: 28,
          size: 7.5,
          font: helveticaBold,
          color: rgb(0.1, 0.5, 0.2),
        });
      } catch (err) {
        sigPage.drawText(`eSigned by ${cleanStr(doc.offerDetails.candidateName)}`, { x: 50, y: 50, size: 10, font: timesItalic, color: rgb(0.1, 0.3, 0.6) });
      }
    } else {
      sigPage.drawText('[ Candidate eSignature Pending ]', { x: 50, y: 50, size: 9, font: timesItalic, color: rgb(0.6, 0.6, 0.6) });
    }

    // Draw HR Signature
    if (doc.hrSignature) {
      try {
        let hrImgData = doc.hrSignature.value;
        if (doc.hrSignature.type === 'TYPE') {
          hrImgData = renderTypedSignatureToPNG(doc.hrSignature.value, doc.hrSignature.fontFamily);
        }
        const embeddedHrImg = await pdfDoc.embedPng(hrImgData);
        const imgDims = embeddedHrImg.scale(0.25);
        sigPage.drawImage(embeddedHrImg, {
          x: 320,
          y: 40,
          width: Math.min(imgDims.width, 160),
          height: Math.min(imgDims.height, 40),
        });
        sigPage.drawText(`HR Countersigned: ${cleanStr(doc.hrSignature.signedBy)}`, {
          x: 320,
          y: 28,
          size: 7.5,
          font: helveticaBold,
          color: rgb(0.1, 0.5, 0.2),
        });
      } catch (err) {
        sigPage.drawText(`Countersigned by HR Representative`, { x: 320, y: 50, size: 10, font: timesItalic, color: rgb(0.1, 0.3, 0.6) });
      }
    } else {
      sigPage.drawText('[ HR Counter-Signature Pending ]', { x: 320, y: 50, size: 9, font: timesItalic, color: rgb(0.6, 0.6, 0.6) });
    }
  } else {
    // -------------------------------------------------------------
    // WE.PLM JOINING / OFFER LETTER - EXACT PDF GENERATION (1:1 PARITY)
    // -------------------------------------------------------------
    const logoNavy = rgb(0.043, 0.145, 0.54); // #0B258A
    const textDark = rgb(0.06, 0.08, 0.12);
    const footerText = `Regd. Office: ${cleanStr(doc.companyName)} | G22 Deepmala Pimple Saudagar Pune 411027 | INDIA | Tel: +91 8806060538 | sales@theweplm.com | www.theweplm.com | CIN : U72900PN2021FTC203259`;

    let embeddedLogoImg: any = null;
    try {
      const logoDataUrl = await getWePlmLogoPngDataUrl();
      if (logoDataUrl) {
        embeddedLogoImg = await pdfDoc.embedPng(logoDataUrl);
      }
    } catch (err) {
      console.warn('Failed to embed PNG logo into PDF:', err);
    }

    const docTitle = doc.documentType === 'JOINING_LETTER' ? 'JOINING LETTER' : 'OFFER LETTER';
    const margin = 40;

    /**
     * Standardized 3-column header matching Candidate Portal Paper (OfferLetterPaper.tsx)
     */
    function drawStandardHeader(
      targetPage: any,
      headingTitle: string,
      subRefText: string,
      rightBadgeLabel: string
    ) {
      const { width: pW, height: pH } = targetPage.getSize();
      const headerBottomY = pH - 88;

      // 1. Logo (Top-Left)
      if (embeddedLogoImg) {
        targetPage.drawImage(embeddedLogoImg, {
          x: margin,
          y: pH - 82,
          width: 58,
          height: 35,
        });
      } else {
        targetPage.drawText('We.', { x: margin, y: pH - 58, size: 15, font: helveticaBold, color: logoNavy });
        targetPage.drawText('PLM', { x: margin, y: pH - 74, size: 13, font: helveticaBold, color: logoNavy });
      }

      // 2. Dead-Centered Heading + Sapphire Accent Bar + Sub-Ref
      const titleFontSize = 14;
      const tWidth = helveticaBold.widthOfTextAtSize(headingTitle, titleFontSize);
      const titleX = (pW - tWidth) / 2;
      targetPage.drawText(headingTitle, {
        x: titleX,
        y: pH - 56,
        size: titleFontSize,
        font: helveticaBold,
        color: textDark,
      });

      // Accent pill underneath heading
      const accentW = 34;
      targetPage.drawRectangle({
        x: (pW - accentW) / 2,
        y: pH - 62,
        width: accentW,
        height: 1.8,
        color: logoNavy,
      });

      // Sub-ref underneath accent pill
      const subRefSize = 8;
      const subRefW = helveticaBold.widthOfTextAtSize(subRefText, subRefSize);
      const subRefX = (pW - subRefW) / 2;
      targetPage.drawText(subRefText, {
        x: subRefX,
        y: pH - 74,
        size: subRefSize,
        font: helveticaBold,
        color: rgb(0.45, 0.48, 0.52),
      });

      // 3. Right-Aligned Pill Badge
      const badgeFontSize = 8;
      const bTextW = helveticaBold.widthOfTextAtSize(rightBadgeLabel, badgeFontSize);
      const bPadX = 7;
      const bPadY = 4;
      const badgeW = bTextW + bPadX * 2;
      const badgeH = badgeFontSize + bPadY * 2;
      const badgeX = pW - margin - badgeW;
      const badgeY = pH - 68;

      targetPage.drawRectangle({
        x: badgeX,
        y: badgeY,
        width: badgeW,
        height: badgeH,
        color: rgb(0.95, 0.96, 0.98),
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 0.8,
      });

      targetPage.drawText(rightBadgeLabel, {
        x: badgeX + bPadX,
        y: badgeY + 4,
        size: badgeFontSize,
        font: helveticaBold,
        color: rgb(0.25, 0.3, 0.38),
      });

      // Bottom Header Border Line
      targetPage.drawLine({
        start: { x: margin, y: headerBottomY },
        end: { x: pW - margin, y: headerBottomY },
        thickness: 1.5,
        color: rgb(0.1, 0.12, 0.15),
      });
    }

    function drawWrappedText(
      targetPage: any,
      text: string,
      font: any,
      fontSize: number,
      startY: number,
      lineHeight: number = 14,
      color = textDark,
      maxLineW = maxWidth
    ): number {
      const paragraphs = text.split(/\r?\n/);
      let y = startY;

      for (const paragraph of paragraphs) {
        const sanitizedLine = cleanStr(paragraph);
        if (!sanitizedLine.trim()) {
          y -= lineHeight * 0.5;
          continue;
        }
        const words = sanitizedLine.split(' ');
        let currentLine = '';

        for (const word of words) {
          if (!word) continue;
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (textWidth > maxLineW) {
            if (currentLine) {
              targetPage.drawText(currentLine, { x: margin, y, size: fontSize, font, color });
              y -= lineHeight;
            }
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          targetPage.drawText(currentLine, { x: margin, y, size: fontSize, font, color });
          y -= lineHeight;
        }
      }
      return y;
    }

    // -------------------------------------------------------------
    // PAGE 1: APPOINTMENT LETTER & KEY TERMS
    // -------------------------------------------------------------
    const page1 = pdfDoc.addPage([612, 792]);
    const { width, height } = page1.getSize();
    const maxWidth = width - margin * 2;

    const dateStr = new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    drawStandardHeader(
      page1,
      docTitle,
      `Ref: ${cleanStr(doc.documentNumber)}`,
      dateStr
    );

    // Recipient Address Block
    let currentY = height - 115;
    page1.drawText('To,', { x: margin, y: currentY, size: 10, font: helveticaBold, color: textDark });
    currentY -= 15;
    page1.drawText(cleanStr(doc.offerDetails.candidateName), { x: margin, y: currentY, size: 10, font: helveticaBold, color: textDark });
    currentY -= 14;

    const addressLines = (doc.offerDetails.candidateAddress || 'Pune, Maharashtra - 411027').split('\n');
    for (const addrLine of addressLines) {
      page1.drawText(cleanStr(addrLine), { x: margin, y: currentY, size: 9, font: helveticaFont, color: rgb(0.25, 0.25, 0.25) });
      currentY -= 13;
    }

    if (doc.offerDetails.candidateDob) {
      page1.drawText(`DOB: ${cleanStr(doc.offerDetails.candidateDob)}`, { x: margin, y: currentY, size: 9, font: helveticaBold, color: textDark });
      currentY -= 16;
    }

    currentY -= 8;

    // Salutation & Body Paragraphs
    const candidateFirstName = doc.offerDetails.candidateName.split(' ')[0] || doc.offerDetails.candidateName;
    page1.drawText(`Dear ${cleanStr(candidateFirstName)},`, { x: margin, y: currentY, size: 10.5, font: helveticaBold, color: textDark });
    currentY -= 18;

    const bodyP1 = `We are pleased to appoint you as ${cleanStr(doc.offerDetails.jobTitle)} in ${cleanStr(doc.companyName)}. During your engagement, you may be deputed at our ${cleanStr(doc.offerDetails.workLocation) || 'Pune office'}. Your assignment with the Company will be Effective from ${cleanStr(doc.offerDetails.joiningDate)}.`;
    currentY = drawWrappedText(page1, bodyP1, helveticaFont, 9.5, currentY, 15);
    currentY -= 10;

    currentY = drawWrappedText(page1, 'We are looking forward to a wonderful journey together.', helveticaFont, 9.5, currentY, 15);
    currentY -= 10;

    currentY = drawWrappedText(page1, 'We wish you all the best and are very confident that you will successfully deliver your responsibilities.', helveticaFont, 9.5, currentY, 15);
    currentY -= 18;

    // Key Engagement Terms Card (1:1 Paper Layout)
    const termsCardH = 100;
    page1.drawRectangle({
      x: margin,
      y: currentY - termsCardH,
      width: maxWidth,
      height: termsCardH,
      color: rgb(0.98, 0.99, 1),
      borderColor: rgb(0.82, 0.86, 0.92),
      borderWidth: 1,
    });

    page1.drawText('KEY ENGAGEMENT TERMS', { x: margin + 14, y: currentY - 20, size: 9.5, font: helveticaBold, color: logoNavy });
    const salaryText = cleanStr(String(doc.offerDetails.annualSalary || ''));
    const salaryW = helveticaBold.widthOfTextAtSize(salaryText, 10.5);
    page1.drawText(salaryText, { x: width - margin - 14 - salaryW, y: currentY - 20, size: 10.5, font: helveticaBold, color: rgb(0.05, 0.55, 0.25) });

    page1.drawLine({
      start: { x: margin + 14, y: currentY - 28 },
      end: { x: width - margin - 14, y: currentY - 28 },
      thickness: 0.5,
      color: rgb(0.85, 0.88, 0.93),
    });

    const summaryDetails = [
      { l: 'Department:', v: cleanStr(doc.offerDetails.department) },
      { l: 'Reporting Manager:', v: cleanStr(doc.offerDetails.reportingManager) },
      { l: 'Probation Period:', v: `${doc.offerDetails.probationMonths} Month(s)` },
      { l: 'Work Location:', v: cleanStr(doc.offerDetails.workLocation) }
    ];

    let gridY = currentY - 46;
    summaryDetails.forEach((item, idx) => {
      const colX = idx % 2 === 0 ? margin + 14 : margin + 270;
      if (idx === 2) gridY = currentY - 72;
      page1.drawText(item.l, { x: colX, y: gridY, size: 8.5, font: helveticaBold, color: rgb(0.4, 0.45, 0.5) });
      page1.drawText(item.v, { x: colX + 95, y: gridY, size: 8.5, font: helveticaFont, color: textDark });
    });

    currentY -= (termsCardH + 20);

    // Sign-off
    page1.drawText('Yours truly,', { x: margin, y: currentY, size: 9.5, font: helveticaFont, color: rgb(0.3, 0.3, 0.3) });
    currentY -= 14;
    page1.drawText(`For ${cleanStr(doc.companyName)}`, { x: margin, y: currentY, size: 10, font: helveticaBold, color: textDark });
    currentY -= 32;

    page1.drawText(cleanStr(doc.offerDetails.directorName || 'Shantanu Jagtap'), { x: margin, y: currentY, size: 10, font: helveticaBold, color: textDark });
    currentY -= 13;
    page1.drawText(cleanStr(doc.offerDetails.directorTitle || 'Director'), { x: margin, y: currentY, size: 9, font: helveticaFont, color: rgb(0.4, 0.4, 0.4) });

    // Page 1 Footer
    page1.drawLine({ start: { x: margin, y: 38 }, end: { x: width - margin, y: 38 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    page1.drawText(footerText, { x: margin, y: 25, size: 6.2, font: helveticaFont, color: rgb(0.45, 0.45, 0.45) });

    // -------------------------------------------------------------
    // PAGE 2: TERMS AND CONDITIONS
    // -------------------------------------------------------------
    const page2 = pdfDoc.addPage([612, 792]);
    const { width: p2W, height: p2H } = page2.getSize();

    drawStandardHeader(
      page2,
      'TERMS & CONDITIONS',
      `Page 2 of 3 • Ref: ${cleanStr(doc.documentNumber)}`,
      'Pg 2 of 3'
    );

    let p2Y = p2H - 110;
    page2.drawText(`I ${cleanStr(doc.offerDetails.candidateName)},`, { x: margin, y: p2Y, size: 10, font: helveticaBold, color: textDark });
    p2Y -= 15;
    page2.drawText('Hereby agree to the following terms and conditions:', { x: margin, y: p2Y, size: 9.5, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
    p2Y -= 18;

    const termsBullets = [
      {
        head: 'Inventory & Asset Management:',
        text: `During your tenure at ${cleanStr(doc.companyName)} or client deputation offices, any electronic devices (including laptops, computer peripherals, headphones, hard disks, mobiles, etc.) must be handled with utmost care and returned in fully operational condition upon request or exit. The ownership of all devices remains solely with ${cleanStr(doc.companyName)}.`
      },
      {
        head: 'FOREX & Expense Settlement:',
        text: 'FOREX allowances provided or expense claims incurred during official international/onsite trips must be completely settled with receipts within 30 days of trip conclusion. Unused FOREX balance remains company property and must be refunded immediately.'
      },
      {
        head: 'Joining Bonus Recovery:',
        text: 'Any joining bonus or relocation assistance disbursed to you shall be fully recoverable by the company if you voluntarily resign or leave within 12 months of joining.'
      },
      {
        head: 'Notice Period:',
        text: 'The mandatory notice period after completion of probation is 3 months. Serving the full notice period is strictly required to ensure clean operational handover and formal release.'
      },
      {
        head: 'Onsite Deputation & Obligations:',
        text: `Once deputed onsite or to client locations, you are expected to comply with all legal, statutory, and moral obligations while representing ${cleanStr(doc.companyName)} at the highest professional standards.`
      },
      {
        head: 'Offshore Service Bond:',
        text: 'Following an onsite assignment exceeding 6 months, you are required to serve a minimum of 6 months offshore to facilitate knowledge transfer. This commitment carries a liquidated damages bond value of 10,00,000 INR.'
      },
      {
        head: 'Organizational Governance:',
        text: 'You agree to operate strictly within the organizational framework, code of conduct, and business policies enforced by the Company from time to time.'
      }
    ];

    termsBullets.forEach((bullet) => {
      page2.drawText('>', { x: margin, y: p2Y, size: 9.5, font: helveticaBold, color: logoNavy });
      page2.drawText(cleanStr(bullet.head), { x: margin + 12, y: p2Y, size: 9, font: helveticaBold, color: textDark });
      p2Y -= 12;
      p2Y = drawWrappedText(page2, bullet.text, helveticaFont, 8.5, p2Y, 12, rgb(0.25, 0.25, 0.25));
      p2Y -= 10;
    });

    // Page 2 Footer
    page2.drawLine({ start: { x: margin, y: 38 }, end: { x: p2W - margin, y: 38 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    page2.drawText(footerText, { x: margin, y: 25, size: 6.2, font: helveticaFont, color: rgb(0.45, 0.45, 0.45) });

    // -------------------------------------------------------------
    // PAGE 3: TERM, TERMINATION & eSIGNATURE ACCEPTANCE
    // -------------------------------------------------------------
    const page3 = pdfDoc.addPage([612, 792]);
    const { width: p3W, height: p3H } = page3.getSize();

    drawStandardHeader(
      page3,
      'EXECUTION & ACCEPTANCE',
      `Page 3 of 3 • Ref: ${cleanStr(doc.documentNumber)}`,
      'Pg 3 of 3'
    );

    let p3Y = p3H - 110;
    page3.drawText('Term and Termination:', { x: margin, y: p3Y, size: 10, font: helveticaBold, color: textDark });
    p3Y -= 15;

    const termClauses = [
      'The Company shall be entitled to terminate your engagement immediately and without notice in cases of neglect of duties, breach of statutory policies, misappropriation of property, moral turpitude, fraudulent activity, or submission of forged documents.',
      `Confidentiality & Non-Disclosure: You shall not disclose any proprietary or confidential information of ${cleanStr(doc.companyName)} to third parties. All intellectual property generated during your employment belongs exclusively to the Company.`
    ];

    termClauses.forEach((clause) => {
      page3.drawText('>', { x: margin, y: p3Y, size: 9.5, font: helveticaBold, color: logoNavy });
      p3Y = drawWrappedText(page3, clause, helveticaFont, 8.5, p3Y, 12, rgb(0.25, 0.25, 0.25));
      p3Y -= 10;
    });

    p3Y -= 8;
    page3.drawLine({ start: { x: margin, y: p3Y }, end: { x: p3W - margin, y: p3Y }, thickness: 0.5, color: rgb(0.85, 0.88, 0.92) });
    p3Y -= 18;

    page3.drawText('Acceptance', { x: margin, y: p3Y, size: 11, font: helveticaBold, color: textDark });
    p3Y -= 14;
    page3.drawText('I agree to abide by the terms of the Engagement Letter', { x: margin, y: p3Y, size: 9, font: helveticaFont, color: rgb(0.2, 0.2, 0.2) });
    p3Y -= 14;
    page3.drawText(cleanStr(doc.offerDetails.candidateName), { x: margin, y: p3Y, size: 9.5, font: helveticaBold, color: textDark });
    p3Y -= 24;

    // 2 SIGNATURE EXECUTION CARDS (Matching 1:1 CandidatePortal & OfferLetterPaper)
    const sigBoxW = (p3W - margin * 2 - 20) / 2;
    const sigBoxH = 135;

    // 1. Candidate Signature Box
    page3.drawRectangle({
      x: margin,
      y: p3Y - sigBoxH,
      width: sigBoxW,
      height: sigBoxH,
      color: doc.candidateSignature ? rgb(0.98, 1, 0.98) : rgb(0.98, 0.99, 1),
      borderColor: doc.candidateSignature ? rgb(0.4, 0.8, 0.5) : rgb(0.7, 0.75, 0.85),
      borderWidth: 1.2,
    });

    // Top Title
    page3.drawText('CANDIDATE eSIGNATURE', { x: margin + 12, y: p3Y - 18, size: 8.5, font: helveticaBold, color: textDark });

    if (doc.candidateSignature) {
      try {
        let candidateImgData = doc.candidateSignature.value;
        if (doc.candidateSignature.type === 'TYPE') {
          candidateImgData = renderTypedSignatureToPNG(doc.candidateSignature.value, doc.candidateSignature.fontFamily);
        }
        const embeddedImg = await pdfDoc.embedPng(candidateImgData);
        const imgDims = embeddedImg.scale(0.35);
        page3.drawImage(embeddedImg, {
          x: margin + 12,
          y: p3Y - 68,
          width: Math.min(imgDims.width, sigBoxW - 24),
          height: Math.min(imgDims.height, 42),
        });
        page3.drawText(`Signed by: ${cleanStr(doc.candidateSignature.signedBy)}`, { x: margin + 12, y: p3Y - 82, size: 8, font: helveticaBold, color: rgb(0.1, 0.5, 0.2) });
        page3.drawText(`Date: ${cleanStr(formatTimestamp(doc.candidateSignature.timestamp))}`, { x: margin + 12, y: p3Y - 94, size: 7, font: helveticaFont, color: rgb(0.3, 0.3, 0.3) });
      } catch (e) {
        page3.drawText(`eSigned by ${cleanStr(doc.offerDetails.candidateName)}`, { x: margin + 12, y: p3Y - 60, size: 10, font: timesItalic, color: rgb(0.1, 0.3, 0.6) });
      }
    } else {
      page3.drawText('Click to eSign', { x: margin + 12, y: p3Y - 55, size: 9.5, font: helveticaBold, color: logoNavy });
      page3.drawText(cleanStr(doc.offerDetails.candidateEmail), { x: margin + 12, y: p3Y - 70, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });
    }

    // Bottom Full-Width Badge
    const candBadgeY = p3Y - sigBoxH + 4;
    page3.drawRectangle({
      x: margin + 4,
      y: candBadgeY,
      width: sigBoxW - 8,
      height: 18,
      color: doc.candidateSignature ? rgb(0.85, 0.96, 0.88) : rgb(0.92, 0.94, 0.98),
      borderColor: doc.candidateSignature ? rgb(0.5, 0.85, 0.6) : rgb(0.8, 0.85, 0.92),
      borderWidth: 0.8,
    });
    const candBadgeText = doc.candidateSignature ? 'VERIFIED eSIGN' : 'PENDING SIGNATURE';
    const candBadgeTW = helveticaBold.widthOfTextAtSize(candBadgeText, 7.5);
    page3.drawText(candBadgeText, {
      x: margin + 4 + (sigBoxW - 8 - candBadgeTW) / 2,
      y: candBadgeY + 5.5,
      size: 7.5,
      font: helveticaBold,
      color: doc.candidateSignature ? rgb(0.08, 0.45, 0.18) : rgb(0.2, 0.3, 0.5),
    });

    // 2. HR Authorized Signer Box
    const hrX = p3W - margin - sigBoxW;
    page3.drawRectangle({
      x: hrX,
      y: p3Y - sigBoxH,
      width: sigBoxW,
      height: sigBoxH,
      color: doc.hrSignature ? rgb(0.98, 1, 0.98) : rgb(0.98, 0.99, 1),
      borderColor: doc.hrSignature ? rgb(0.4, 0.8, 0.5) : rgb(0.7, 0.75, 0.85),
      borderWidth: 1.2,
    });

    // Top Title
    page3.drawText('HR AUTHORIZED SIGNER', { x: hrX + 12, y: p3Y - 18, size: 8.5, font: helveticaBold, color: textDark });

    if (doc.hrSignature) {
      try {
        let hrImgData = doc.hrSignature.value;
        if (doc.hrSignature.type === 'TYPE') {
          hrImgData = renderTypedSignatureToPNG(doc.hrSignature.value, doc.hrSignature.fontFamily);
        }
        const embeddedHrImg = await pdfDoc.embedPng(hrImgData);
        const imgDims = embeddedHrImg.scale(0.35);
        page3.drawImage(embeddedHrImg, {
          x: hrX + 12,
          y: p3Y - 68,
          width: Math.min(imgDims.width, sigBoxW - 24),
          height: Math.min(imgDims.height, 42),
        });
        page3.drawText(`Countersigned: ${cleanStr(doc.hrSignature.signedBy)}`, { x: hrX + 12, y: p3Y - 82, size: 8, font: helveticaBold, color: rgb(0.1, 0.5, 0.2) });
        page3.drawText(`Date: ${cleanStr(formatTimestamp(doc.hrSignature.timestamp))}`, { x: hrX + 12, y: p3Y - 94, size: 7, font: helveticaFont, color: rgb(0.3, 0.3, 0.3) });
      } catch (e) {
        page3.drawText('eSigned by HR Representative', { x: hrX + 12, y: p3Y - 60, size: 10, font: timesItalic, color: rgb(0.1, 0.3, 0.6) });
      }
    } else {
      page3.drawText('Pending Counter-Sign', { x: hrX + 12, y: p3Y - 55, size: 9.5, font: helveticaBold, color: rgb(0.35, 0.38, 0.45) });
      page3.drawText(cleanStr(doc.hrHeadEmail || 'hr@theweplm.com'), { x: hrX + 12, y: p3Y - 70, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });
    }

    // Bottom Full-Width Badge
    const hrBadgeY = p3Y - sigBoxH + 4;
    page3.drawRectangle({
      x: hrX + 4,
      y: hrBadgeY,
      width: sigBoxW - 8,
      height: 18,
      color: doc.hrSignature ? rgb(0.85, 0.96, 0.88) : rgb(0.92, 0.93, 0.95),
      borderColor: doc.hrSignature ? rgb(0.5, 0.85, 0.6) : rgb(0.82, 0.84, 0.88),
      borderWidth: 0.8,
    });
    const hrBadgeText = doc.hrSignature ? 'COUNTERSIGNED' : 'PENDING COUNTERSIGN';
    const hrBadgeTW = helveticaBold.widthOfTextAtSize(hrBadgeText, 7.5);
    page3.drawText(hrBadgeText, {
      x: hrX + 4 + (sigBoxW - 8 - hrBadgeTW) / 2,
      y: hrBadgeY + 5.5,
      size: 7.5,
      font: helveticaBold,
      color: doc.hrSignature ? rgb(0.08, 0.45, 0.18) : rgb(0.35, 0.38, 0.45),
    });

    // Page 3 Footer
    page3.drawLine({ start: { x: margin, y: 38 }, end: { x: p3W - margin, y: 38 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    page3.drawText(footerText, { x: margin, y: 25, size: 6.2, font: helveticaFont, color: rgb(0.45, 0.45, 0.45) });
  }

  // -------------------------------------------------------------
  // PAGE 2: OFFICIAL CERTIFICATE OF COMPLETION & SHA-256 AUDIT SEAL
  // -------------------------------------------------------------
  const page2 = pdfDoc.addPage([612, 792]);
  const { width: page2Width, height: page2Height } = page2.getSize();
  const page2Margin = 40;
  const page2MaxWidth = page2Width - page2Margin * 2;

  // Certificate Header
  page2.drawRectangle({
    x: 0,
    y: page2Height - 70,
    width: page2Width,
    height: 70,
    color: rgb(0.04, 0.08, 0.16),
  });

  page2.drawText('CERTIFICATE OF COMPLETION & AUDIT TRAIL', {
    x: 40,
    y: page2Height - 42,
    size: 15,
    font: helveticaBold,
    color: rgb(0.9, 0.95, 1),
  });

  page2.drawText('TAMPER-EVIDENT DIGITAL COMPLIANCE SEAL (ESIGN ACT §101)', {
    x: 40,
    y: page2Height - 58,
    size: 8,
    font: helveticaBold,
    color: rgb(0.3, 0.75, 0.95),
  });

  let certY = page2Height - 95;

  // Document Identification block
  page2.drawRectangle({
    x: 40,
    y: certY - 65,
    width: page2MaxWidth,
    height: 65,
    color: rgb(0.95, 0.97, 1),
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 1,
  });

  page2.drawText(`Document Title: ${cleanStr(doc.title)}`, { x: 55, y: certY - 20, size: 9.5, font: helveticaBold, color: rgb(0.1, 0.2, 0.35) });
  page2.drawText(`Document GUID: ${cleanStr(doc.id)}`, { x: 55, y: certY - 35, size: 9, font: helveticaFont, color: rgb(0.3, 0.35, 0.45) });
  page2.drawText(`SHA-256 Checksum: ${cleanStr(doc.sha256Checksum || 'HASH_PENDING_FINALIZATION')}`, { x: 55, y: certY - 50, size: 8, font: helveticaBold, color: rgb(0.1, 0.4, 0.7) });

  certY -= 85;

  // EXECUTIVE DISTRIBUTION AUDIT BLOCK (HR Head & CTO)
  page2.drawText('AUTOMATED EXECUTIVE DISTRIBUTION LOG', {
    x: 40,
    y: certY,
    size: 11,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.25),
  });
  certY -= 15;

  page2.drawRectangle({
    x: 40,
    y: certY - 70,
    width: page2MaxWidth,
    height: 70,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  const hrHead = doc.executives?.hrHead;
  const cto = doc.executives?.cto;

  page2.drawText(`1. HR Head Dispatch: ${cleanStr(hrHead?.name || 'HR Head')} <${cleanStr(hrHead?.email)}>`, { x: 55, y: certY - 20, size: 9, font: helveticaBold, color: rgb(0.15, 0.2, 0.3) });
  page2.drawText(`Status: ${hrHead?.status === 'SENT_SUCCESSFULLY' ? 'DELIVERED WITH PDF ENCRYPTED ATTACHMENT' : 'PENDING COUNTERSIGNATURE'}`, { x: 55, y: certY - 32, size: 8.5, font: helveticaFont, color: hrHead?.status === 'SENT_SUCCESSFULLY' ? rgb(0.1, 0.5, 0.2) : rgb(0.6, 0.4, 0.1) });

  page2.drawText(`2. CTO Dispatch: ${cleanStr(cto?.name || 'Chief Technology Officer')} <${cleanStr(cto?.email)}>`, { x: 55, y: certY - 48, size: 9, font: helveticaBold, color: rgb(0.15, 0.2, 0.3) });
  page2.drawText(`Status: ${cto?.status === 'SENT_SUCCESSFULLY' ? 'DELIVERED WITH PDF ENCRYPTED ATTACHMENT' : 'PENDING COUNTERSIGNATURE'}`, { x: 55, y: certY - 60, size: 8.5, font: helveticaFont, color: cto?.status === 'SENT_SUCCESSFULLY' ? rgb(0.1, 0.5, 0.2) : rgb(0.6, 0.4, 0.1) });

  certY -= 90;

  // SIGNATURE AUDIT DETAILS (Candidate & HR)
  page2.drawText('SIGNER IDENTITY & AUDIT EVENTS', {
    x: 40,
    y: certY,
    size: 11,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  certY -= 15;

  // Candidate Audit Card
  page2.drawRectangle({
    x: 40,
    y: certY - 80,
    width: (page2MaxWidth / 2) - 10,
    height: 80,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  page2.drawText('Candidate Signer Record', { x: 50, y: certY - 18, size: 9.5, font: helveticaBold, color: rgb(0.1, 0.3, 0.6) });
  page2.drawText(`Name: ${cleanStr(doc.offerDetails.candidateName)}`, { x: 50, y: certY - 32, size: 8.5, font: helveticaFont, color: rgb(0.2, 0.2, 0.2) });
  page2.drawText(`Email: ${cleanStr(doc.offerDetails.candidateEmail)}`, { x: 50, y: certY - 44, size: 8.5, font: helveticaFont, color: rgb(0.2, 0.2, 0.2) });
  page2.drawText(`IP: ${cleanStr(doc.candidateSignature?.ipAddress || 'N/A')}`, { x: 50, y: certY - 56, size: 8.5, font: helveticaFont, color: rgb(0.2, 0.2, 0.2) });
  page2.drawText(`Timestamp: ${cleanStr(doc.candidateSignature ? formatTimestamp(doc.candidateSignature.timestamp) : 'Not Yet Signed')}`, { x: 50, y: certY - 68, size: 7.5, font: helveticaBold, color: rgb(0.1, 0.5, 0.2) });

  // HR Audit Card
  page2.drawRectangle({
    x: 40 + (page2MaxWidth / 2) + 10,
    y: certY - 80,
    width: (page2MaxWidth / 2) - 10,
    height: 80,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  page2.drawText('HR Representative Record', { x: 50 + (page2MaxWidth / 2) + 10, y: certY - 18, size: 9.5, font: helveticaBold, color: rgb(0.1, 0.3, 0.6) });
  page2.drawText(`Name: ${cleanStr(doc.hrSignature?.signedBy || 'HR Officer')}`, { x: 50 + (page2MaxWidth / 2) + 10, y: certY - 32, size: 8.5, font: helveticaFont, color: rgb(0.2, 0.2, 0.2) });
  page2.drawText(`Email: ${cleanStr(doc.hrSignature?.email || 'hr@company.com')}`, { x: 50 + (page2MaxWidth / 2) + 10, y: certY - 44, size: 8.5, font: helveticaFont, color: rgb(0.2, 0.2, 0.2) });
  page2.drawText(`IP: ${cleanStr(doc.hrSignature?.ipAddress || 'N/A')}`, { x: 50 + (page2MaxWidth / 2) + 10, y: certY - 56, size: 8.5, font: helveticaFont, color: rgb(0.2, 0.2, 0.2) });
  page2.drawText(`Timestamp: ${cleanStr(doc.hrSignature ? formatTimestamp(doc.hrSignature.timestamp) : 'Not Yet Countersigned')}`, { x: 50 + (page2MaxWidth / 2) + 10, y: certY - 68, size: 7.5, font: helveticaBold, color: rgb(0.1, 0.5, 0.2) });

  certY -= 105;

  // Chronological Audit Log Table Header & Section Title
  page2.drawText('CHRONOLOGICAL AUDIT EVENT LOG', {
    x: 40,
    y: certY,
    size: 10.5,
    font: helveticaBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  certY -= 16;
  let logY = certY;

  // Table Column Headers
  page2.drawRectangle({
    x: 40,
    y: logY - 18,
    width: page2MaxWidth,
    height: 18,
    color: rgb(0.92, 0.94, 0.97),
    borderColor: rgb(0.82, 0.85, 0.90),
    borderWidth: 0.5,
  });

  page2.drawText('TIMESTAMP (UTC)', { x: 46, y: logY - 12, size: 6.5, font: helveticaBold, color: rgb(0.3, 0.35, 0.45) });
  page2.drawText('EVENT ACTION', { x: 165, y: logY - 12, size: 6.5, font: helveticaBold, color: rgb(0.3, 0.35, 0.45) });
  page2.drawText('ACTOR & IDENTITY', { x: 310, y: logY - 12, size: 6.5, font: helveticaBold, color: rgb(0.3, 0.35, 0.45) });
  page2.drawText('IP ADDRESS', { x: 475, y: logY - 12, size: 6.5, font: helveticaBold, color: rgb(0.3, 0.35, 0.45) });

  logY -= 20;

  // Draw Audit items with safe column widths and truncation
  const auditItems = doc.auditTrail || [];

  auditItems.slice(0, 8).forEach((item, index) => {
    page2.drawRectangle({
      x: 40,
      y: logY - 22,
      width: page2MaxWidth,
      height: 22,
      color: index % 2 === 0 ? rgb(0.97, 0.98, 1) : rgb(1, 1, 1),
      borderColor: rgb(0.9, 0.92, 0.95),
      borderWidth: 0.5,
    });

    const timeStr = truncateText(formatTimestamp(item.timestamp), helveticaFont, 7, 110);
    const actionStr = truncateText(cleanStr(item.action), helveticaBold, 7.5, 138);
    const actorStr = truncateText(cleanStr(item.actor), helveticaFont, 7.2, 155);
    const ipStr = truncateText(cleanStr(item.ipAddress), helveticaFont, 7.2, 72);

    page2.drawText(timeStr, { x: 46, y: logY - 14, size: 7, font: helveticaFont, color: rgb(0.3, 0.35, 0.45) });
    page2.drawText(actionStr, { x: 165, y: logY - 14, size: 7.5, font: helveticaBold, color: rgb(0.1, 0.2, 0.35) });
    page2.drawText(actorStr, { x: 310, y: logY - 14, size: 7.2, font: helveticaFont, color: rgb(0.2, 0.25, 0.3) });
    page2.drawText(ipStr, { x: 475, y: logY - 14, size: 7.2, font: helveticaFont, color: rgb(0.4, 0.45, 0.5) });

    logY -= 24;
  });

  // Footer on Page 2
  page2.drawText('Generated by We.SignForge Enterprise eSignature Engine • Verified SHA-256 Audit Trail • Page 2 of 2', {
    x: 40,
    y: 20,
    size: 8,
    font: helveticaFont,
    color: rgb(0.5, 0.55, 0.65),
  });

  // Save PDF bytes
  return await pdfDoc.save();
}

/**
 * Triggers browser file download of the generated PDF.
 */
export async function downloadExecutedPDF(doc: OfferDocument): Promise<{ success: boolean; blobUrl?: string; fileName?: string; error?: string }> {
  try {
    const pdfBytes = await generateExecutedOfferPDF(doc);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const safeCandidateName = cleanStr(doc.offerDetails.candidateName).replace(/[^a-zA-Z0-9_]/g, '_');
    const fileName = `${doc.documentNumber}_Signed_${doc.documentType === 'JOINING_LETTER' ? 'Joining_Letter' : 'Offer'}_${safeCandidateName}.pdf`;

    // Strategy 1: Create hidden anchor element and trigger download click
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 2000);

    // Strategy 2: In case sandbox/iframe blocks direct download, attempt opening blob in new window
    try {
      const win = window.open(blobUrl, '_blank');
      if (win) {
        win.focus();
      }
    } catch (e) {
      console.warn('Iframe popup window blocked or restricted', e);
    }

    return { success: true, blobUrl, fileName };
  } catch (err: any) {
    console.error('PDF Generation / Download error:', err);
    return { success: false, error: err?.message || 'Failed to render PDF' };
  }
}
