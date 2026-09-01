import { OfferDocument } from '../Types';

/**
 * Encodes essential fields of an OfferDocument into a compact base64 URL parameter.
 * This makes candidate eSign links 100% self-contained so candidates see their actual name and offer details
 * on ANY device or browser tab, without needing local storage.
 */
export function encodeOfferToUrl(doc: OfferDocument): string {
  try {
    const compactPayload = {
      id: doc.id,
      dn: doc.documentNumber,
      cn: doc.offerDetails.candidateName,
      ce: doc.offerDetails.candidateEmail,
      ca: doc.offerDetails.candidateAddress || '',
      jt: doc.offerDetails.jobTitle,
      dp: doc.offerDetails.department || '',
      sal: doc.offerDetails.annualSalary,
      jd: doc.offerDetails.joiningDate,
      loc: doc.offerDetails.workLocation || '',
      mgr: doc.offerDetails.reportingManager || '',
      prob: doc.offerDetails.probationMonths || 3,
      comp: doc.companyName || 'We.PLM Enterprise',
      caddr: doc.companyAddress || '',
      st: doc.status || 'OUT_FOR_CANDIDATE_SIGN',
      cat: doc.createdAt || new Date().toISOString(),
      pdf: doc.pdfUrl || ''
    };
    const jsonStr = JSON.stringify(compactPayload);
    const b64 = btoa(encodeURIComponent(jsonStr));
    return encodeURIComponent(b64);
  } catch (err) {
    console.error('Failed to encode offer document for URL:', err);
    return '';
  }
}

/**
 * Decodes a base64 URL parameter string back into a complete OfferDocument.
 */
export function decodeOfferFromUrl(encodedStr: string): OfferDocument | null {
  if (!encodedStr) return null;
  try {
    let rawStr = encodedStr.trim();
    try {
      rawStr = decodeURIComponent(rawStr);
    } catch {
      // keep rawStr if already decoded
    }
    const sanitized = rawStr.replace(/ /g, '+');
    const decodedStr = decodeURIComponent(atob(sanitized));
    const data = JSON.parse(decodedStr);

    if (data && data.id) {
      // Legacy full object support
      if (data.offerDetails && data.offerDetails.candidateName) {
        return data as OfferDocument;
      }

      // Compact payload support
      if (data.cn) {
        const reconstructedDoc: OfferDocument = {
          id: data.id,
          documentNumber: data.dn || `OFF-${data.id.substring(0, 8).toUpperCase()}`,
          title: 'Employment Offer Letter',
          status: data.st || 'OUT_FOR_CANDIDATE_SIGN',
          createdAt: data.cat || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          companyName: data.comp || 'We.PLM Enterprise',
          companyAddress: data.caddr || '',
          createdBy: 'Talent Acquisition Team',
          pdfUrl: data.pdf || undefined,
          offerDetails: {
            candidateName: data.cn,
            candidateEmail: data.ce || '',
            candidateAddress: data.ca || '',
            jobTitle: data.jt || 'Position',
            department: data.dp || '',
            annualSalary: data.sal || '',
            joiningDate: data.jd || '',
            workLocation: data.loc || '',
            reportingManager: data.mgr || '',
            probationMonths: data.prob || 3
          },
          executives: {
            hrHead: { name: 'Sarah Jenkins', role: 'HR_HEAD', email: 's.jenkins@weplm.com', status: 'SENT_SUCCESSFULLY' },
            cto: { name: 'David Miller', role: 'CTO', email: 'd.miller@weplm.com', status: 'NOT_SENT' }
          },
          fields: [],
          auditTrail: [
            {
              id: 'audit-1',
              action: 'DOCUMENT_DISPATCHED',
              timestamp: new Date().toISOString(),
              actor: 'HR Operations',
              actorRole: 'HR Head',
              ipAddress: '192.168.1.1',
              details: 'Offer letter loaded via candidate direct eSign link',
              checksum: 'f82a901e3b'
            }
          ]
        };
        return reconstructedDoc;
      }
    }
  } catch (err) {
    console.error('Failed to decode offer document from URL parameter:', err);
  }
  return null;
}

/**
 * Generates a direct candidate eSign URL containing embedded compact offer data payload.
 */
export function getCandidateShareLink(doc: OfferDocument): string {
  let baseUrl = '';

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const href = window.location.href;

    // Check if origin is valid (not null / empty / about:)
    if (origin && origin !== 'null' && !origin.startsWith('null')) {
      baseUrl = `${origin}${window.location.pathname}`;
    } else if (href && !href.startsWith('about:') && !href.startsWith('data:')) {
      baseUrl = href.split('?')[0].split('#')[0];
    }
  }

  // Fallback check if baseUrl is still empty or 'null'
  if (!baseUrl || baseUrl === 'null' || baseUrl.startsWith('null')) {
    if (typeof window !== 'undefined' && window.location.href) {
      const cleanHref = window.location.href.split('?')[0].split('#')[0];
      if (cleanHref && cleanHref !== 'null' && !cleanHref.startsWith('null')) {
        baseUrl = cleanHref;
      }
    }
  }

  // Ultimate fallback to app dev domain if environment is fully sandboxed
  if (!baseUrl || baseUrl === 'null' || baseUrl.startsWith('null')) {
    baseUrl = 'https://ais-dev-lgi2oq4yhc7maffrxhcngg-40107702716.asia-east1.run.app/';
  }

  const payload = encodeOfferToUrl(doc);
  return `${baseUrl}?view=sign&docId=${doc.id}&data=${payload}`;
}


