export type DocumentStatus =
  | 'DRAFT'
  | 'SENT'
  | 'OUT_FOR_CANDIDATE_SIGN'
  | 'CANDIDATE_SIGNED'
  | 'HR_COUNTERSIGNED'
  | 'FULLY_EXECUTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'VOID';

export type OfferStatusType = DocumentStatus;

export type SignatureType = 'DRAW' | 'TYPE' | 'UPLOAD';

export interface SignatureData {
  type?: SignatureType | string;
  value: string;
  signatureImage?: string;
  fontFamily?: string;
  signedBy: string;
  signerName?: string;
  email?: string;
  signerEmail?: string;
  signerTitle?: string;
  role?: string;
  timestamp: string;
  signedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  signatureHash?: string;
  sha256Hash?: string;
  securityHash?: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  timestamp: string;
  actor: string;
  actorName?: string;
  actorRole?: string;
  role?: string;
  actorEmail?: string;
  ipAddress: string;
  userAgent?: string;
  hash?: string;
  checksum?: string;
  cryptographicHash?: string;
  details?: string;
}

export type AuditTrailEntryType = AuditEvent;

export interface OfferDetails {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateAddress?: string;
  candidateDob?: string;
  jobTitle: string;
  roleTitle?: string;
  department: string;
  annualSalary?: string | number;
  fixedSalary?: number;
  ctc?: number;
  variableBonus?: number;
  retentionBonus?: number;
  stockOptionsValue?: number;
  equityUnits?: string | number;
  signOnBonus?: number;
  relocationAllowance?: number;
  joiningDate?: string;
  startDate?: string;
  expiryDate?: string;
  workLocation?: string;
  location?: string;
  reportingManager?: string;
  probationMonths?: number;
  noticePeriodDays?: number;
  directorName?: string;
  directorTitle?: string;
  directorEmail?: string;
  benefits?: string[];
  specialConditions?: string;
  currency?: string;
}

export interface OfferDocument {
  id: string;
  documentNumber: string;
  docNumber?: string;
  title?: string;
  documentType?: 'OFFER_LETTER' | 'JOINING_LETTER';
  signatureCount?: 2 | 3;
  companyName: string;
  companyAddress?: string;
  createdBy?: string;
  offerDetails: OfferDetails;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  sha256Checksum?: string;
  executives?: {
    hrHead?: { name: string; role: string; email: string; status: string };
    cto?: { name: string; role: string; email: string; status: string };
    [key: string]: any;
  };
  fields?: any[];
  auditTrail: AuditEvent[];
  candidateSignature?: SignatureData;
  hrSignature?: SignatureData;
  executiveSignature?: SignatureData;
  directorSignature?: SignatureData;
  isUploadedPdf?: boolean;
  pdfUrl?: string;
  pdfDataUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  notes?: string;
  candidate?: any;
  hrSigner?: any;
  compensation?: any;
}

export type OfferDocumentType = OfferDocument;

export type UserRoleType = 'HR_ADMIN' | 'RECRUITER' | 'EXECUTIVE' | 'CANDIDATE' | 'AUDITOR';
