export type DocumentStatus =
  | 'DRAFT'
  | 'SENT'
  | 'CANDIDATE_SIGNED'
  | 'HR_COUNTERSIGNED'
  | 'EXPIRED'
  | 'VOID';

export type OfferStatusType = DocumentStatus;

export interface SignatureData {
  signatureImage: string; // base64 / data URL
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  signatureHash: string;
  signerName: string;
  signerEmail: string;
  signerTitle?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  role: string;
  ipAddress: string;
  userAgent: string;
  hash: string;
  details?: string;
}

export type AuditTrailEntryType = AuditEvent;

export interface OfferDetails {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateDob?: string;
  roleTitle: string;
  department: string;
  location: string;
  startDate: string;
  expiryDate: string;
  currency: string;
  ctc: number;
  fixedSalary: number;
  variableBonus?: number;
  retentionBonus?: number;
  relocationAllowance?: number;
  stockOptionsValue?: number;
  probationMonths?: number;
  noticePeriodDays?: number;
  reportingManager?: string;
  benefits?: string[];
  specialConditions?: string;
}

export interface OfferDocument {
  id: string;
  docNumber: string;
  documentType: 'OFFER_LETTER' | 'JOINING_LETTER';
  signatureCount: 2 | 3;
  companyName: string;
  companyAddress: string;
  offerDetails: OfferDetails;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  auditTrail: AuditEvent[];
  candidateSignature?: SignatureData;
  hrSignature?: SignatureData;
  executiveSignature?: SignatureData;
  isUploadedPdf?: boolean;
  pdfDataUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  notes?: string;
}

export type OfferDocumentType = OfferDocument;
