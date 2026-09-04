import ApplicationNetworkAPIConfiguration from '../../../Configurations/ApplicationNetworkAPIConfiguration';
import ApplicationLocalStorageService from '../../../Services/ApplicationLocalStorageService';
import { OfferDocument, DocumentStatus, AuditEvent } from '../../../Types';

export interface BackendEmploymentOfferDTO {
  Id?: string;
  id?: string;
  OfferCode?: string;
  offerCode?: string;
  DocumentType?: 'OFFER_LETTER' | 'JOINING_LETTER';
  documentType?: 'OFFER_LETTER' | 'JOINING_LETTER';
  SignatureCount?: 2 | 3;
  signatureCount?: 2 | 3;

  CandidateName?: string;
  candidateName?: string;
  CandidateEmail?: string;
  candidateEmail?: string;
  CandidatePhone?: string;
  candidatePhone?: string;

  Designation?: string;
  designation?: string;
  Department?: string;
  department?: string;
  EmploymentType?: string;
  employmentType?: string;
  WorkLocation?: string;
  workLocation?: string;
  JoiningDate?: string;
  joiningDate?: string;
  ExpiryDate?: string;
  expiryDate?: string;
  ReportingManagerName?: string;
  reportingManagerName?: string;
  ReportingManagerTitle?: string;
  reportingManagerTitle?: string;

  CompanyName?: string;
  companyName?: string;
  CompanyAddress?: string;
  companyAddress?: string;
  CompanyCin?: string;
  companyCin?: string;

  BaseSalary?: number;
  baseSalary?: number;
  VariablePay?: number;
  variablePay?: number;
  JoiningBonus?: number;
  joiningBonus?: number;
  StockOptions?: string;
  stockOptions?: string;
  TotalCtc?: number;
  totalCtc?: number;
  AnnualCtc?: number;
  annualCtc?: number;
  Currency?: string;
  currency?: string;
  ProbationPeriodMonths?: number;
  probationPeriodMonths?: number;
  NoticePeriodDays?: number;
  noticePeriodDays?: number;
  RelocationAllowance?: number;
  relocationAllowance?: number;
  BenefitsDetails?: string;
  benefitsDetails?: string;

  Status?: string;
  status?: string;

  CandidateSignedAt?: string;
  candidateSignedAt?: string;
  CandidateSignMode?: string;
  candidateSignMode?: string;
  CandidateSignatureData?: string;
  candidateSignatureData?: string;
  CandidateSignIp?: string;
  candidateSignIp?: string;
  CandidateSignUserAgent?: string;
  candidateSignUserAgent?: string;

  CounterSignedAt?: string;
  counterSignedAt?: string;
  CounterSignedByUserId?: string;
  counterSignedByUserId?: string;
  CounterSignedByUserName?: string;
  counterSignedByUserName?: string;
  CounterSignMode?: string;
  counterSignMode?: string;
  CounterSignatureData?: string;
  counterSignatureData?: string;

  ThirdPartySignedAt?: string;
  thirdPartySignedAt?: string;
  ThirdPartySignedByUserId?: string;
  thirdPartySignedByUserId?: string;
  ThirdPartySignedByUserName?: string;
  thirdPartySignedByUserName?: string;
  ThirdPartySignMode?: string;
  thirdPartySignMode?: string;
  ThirdPartySignatureData?: string;
  thirdPartySignatureData?: string;

  OfferLetterHtml?: string;
  offerLetterHtml?: string;
  GeneratedCandidateUrl?: string;
  generatedCandidateUrl?: string;
  GeneratedCountersignUrl?: string;
  generatedCountersignUrl?: string;
  GeneratedThirdPartyUrl?: string;
  generatedThirdPartyUrl?: string;
  DocumentHash?: string;
  documentHash?: string;
  AuditTrailJson?: string;
  auditTrailJson?: string;

  CreatedById?: string;
  createdById?: string;
  CreatedByName?: string;
  createdByName?: string;
  CreatedAt?: string;
  createdAt?: string;
  UpdatedAt?: string;
  updatedAt?: string;
}

export interface ApiResponseEnvelope<T> {
  Success?: boolean;
  success?: boolean;
  Data?: T;
  data?: T;
  Message?: string;
  message?: string;
  Errors?: string[];
  errors?: string[];
}

export default class EmploymentOfferService {
  public static readonly current = new EmploymentOfferService();

  private getAuthHeaders(): HeadersInit {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const session = ApplicationLocalStorageService.current.getAuthSession();
    const headers: Record<string, string> = { ...config.headers };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    return headers;
  }

  public mapDtoToOfferDocument(dto: BackendEmploymentOfferDTO): OfferDocument {
    const id = dto.Id || dto.id || '';
    const offerCode = dto.OfferCode || dto.offerCode || `OFF-${id.slice(0, 8)}`;
    const candidateName = dto.CandidateName || dto.candidateName || 'Candidate';
    const candidateEmail = dto.CandidateEmail || dto.candidateEmail || '';
    const designation = dto.Designation || dto.designation || 'Software Engineer';
    const department = dto.Department || dto.department || 'Engineering';
    const companyName = dto.CompanyName || dto.companyName || 'We.PLM Global Technologies (P) Ltd.';
    const companyAddress = dto.CompanyAddress || dto.companyAddress || 'G22 Deepmala Pimple Saudagar Pune 411027';
    const totalCtc = dto.TotalCtc || dto.totalCtc || dto.AnnualCtc || dto.annualCtc || 0;

    let parsedAudit: AuditEvent[] = [];
    const auditRaw = dto.AuditTrailJson || dto.auditTrailJson;
    if (auditRaw) {
      try {
        parsedAudit = JSON.parse(auditRaw);
      } catch {
        parsedAudit = [];
      }
    }

    const rawStatus = dto.Status || dto.status || 'AWAITING_CANDIDATE';
    let documentStatus: DocumentStatus = 'OUT_FOR_CANDIDATE_SIGN';
    if (rawStatus === 'FULLY_EXECUTED') {
      documentStatus = 'FULLY_EXECUTED';
    } else if (rawStatus === 'AWAITING_COUNTERSIGN' || rawStatus === 'CANDIDATE_SIGNED') {
      documentStatus = 'CANDIDATE_SIGNED';
    } else if (rawStatus === 'AWAITING_THIRD_PARTY_SIGN') {
      documentStatus = 'HR_COUNTERSIGNED';
    } else if (rawStatus === 'CANCELLED' || rawStatus === 'VOID') {
      documentStatus = 'VOID';
    } else if (rawStatus === 'DRAFT') {
      documentStatus = 'DRAFT';
    }

    const doc: OfferDocument = {
      id,
      documentNumber: offerCode,
      docNumber: offerCode,
      title: `${designation} Offer - ${candidateName}`,
      documentType: dto.DocumentType || dto.documentType || 'OFFER_LETTER',
      signatureCount: (dto.SignatureCount || dto.signatureCount || 2) as 2 | 3,
      companyName,
      companyAddress,
      createdBy: dto.CreatedByName || dto.createdByName || 'Enterprise HR Admin',
      status: documentStatus,
      createdAt: dto.CreatedAt || dto.createdAt || new Date().toISOString(),
      updatedAt: dto.UpdatedAt || dto.updatedAt || new Date().toISOString(),
      sha256Checksum: dto.DocumentHash || dto.documentHash || '',
      offerLetterHtml: dto.OfferLetterHtml || dto.offerLetterHtml || '',
      generatedCandidateUrl: dto.GeneratedCandidateUrl || dto.generatedCandidateUrl || '',
      generatedCountersignUrl: dto.GeneratedCountersignUrl || dto.generatedCountersignUrl || '',
      generatedThirdPartyUrl: dto.GeneratedThirdPartyUrl || dto.generatedThirdPartyUrl || '',
      auditTrail: parsedAudit,
      offerDetails: {
        candidateName,
        candidateEmail,
        candidatePhone: dto.CandidatePhone || dto.candidatePhone,
        jobTitle: designation,
        roleTitle: designation,
        department,
        annualSalary: totalCtc,
        ctc: totalCtc,
        fixedSalary: dto.BaseSalary || dto.baseSalary,
        variableBonus: dto.VariablePay || dto.variablePay,
        signOnBonus: dto.JoiningBonus || dto.joiningBonus,
        stockOptionsValue: 0,
        joiningDate: dto.JoiningDate || dto.joiningDate,
        startDate: dto.JoiningDate || dto.joiningDate,
        expiryDate: dto.ExpiryDate || dto.expiryDate,
        workLocation: dto.WorkLocation || dto.workLocation,
        location: dto.WorkLocation || dto.workLocation,
        reportingManager: dto.ReportingManagerName || dto.reportingManagerName,
        probationMonths: dto.ProbationPeriodMonths || dto.probationPeriodMonths,
        noticePeriodDays: dto.NoticePeriodDays || dto.noticePeriodDays,
        relocationAllowance: dto.RelocationAllowance || dto.relocationAllowance,
        currency: dto.Currency || dto.currency || 'INR',
      },
    };

    const candSig = dto.CandidateSignatureData || dto.candidateSignatureData;
    if (candSig) {
      doc.candidateSignature = {
        value: candSig,
        signatureImage: candSig,
        signedBy: candidateName,
        timestamp: dto.CandidateSignedAt || dto.candidateSignedAt || new Date().toISOString(),
        type: (dto.CandidateSignMode || dto.candidateSignMode || 'DRAW') as any,
        ipAddress: dto.CandidateSignIp || dto.candidateSignIp,
        userAgent: dto.CandidateSignUserAgent || dto.candidateSignUserAgent,
      };
    }

    const hrSig = dto.CounterSignatureData || dto.counterSignatureData;
    if (hrSig) {
      doc.hrSignature = {
        value: hrSig,
        signatureImage: hrSig,
        signedBy: dto.CounterSignedByUserName || dto.counterSignedByUserName || 'HR Countersigner',
        timestamp: dto.CounterSignedAt || dto.counterSignedAt || new Date().toISOString(),
        type: (dto.CounterSignMode || dto.counterSignMode || 'DRAW') as any,
      };
    }

    const execSig = dto.ThirdPartySignatureData || dto.thirdPartySignatureData;
    if (execSig) {
      doc.executiveSignature = {
        value: execSig,
        signatureImage: execSig,
        signedBy: dto.ThirdPartySignedByUserName || dto.thirdPartySignedByUserName || 'Executive Signatory',
        timestamp: dto.ThirdPartySignedAt || dto.thirdPartySignedAt || new Date().toISOString(),
        type: (dto.ThirdPartySignMode || dto.thirdPartySignMode || 'DRAW') as any,
      };
    }

    return doc;
  }

  public async getAllOffers(): Promise<OfferDocument[]> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.employmentOffer.getAll;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch offers from orchestrator: ${response.statusText}`);
    }

    const payload: ApiResponseEnvelope<BackendEmploymentOfferDTO[]> = await response.json();
    const list = payload.Data || payload.data || [];
    return list.map((item) => this.mapDtoToOfferDocument(item));
  }

  public async getOfferById(id: string): Promise<OfferDocument> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.employmentOffer.getById(id);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch offer details for ID ${id}`);
    }

    const payload: ApiResponseEnvelope<BackendEmploymentOfferDTO> = await response.json();
    const data = payload.Data || payload.data;
    if (!data) {
      throw new Error(`Offer with ID ${id} not found.`);
    }
    return this.mapDtoToOfferDocument(data);
  }

  public async createOffer(offer: OfferDocument): Promise<OfferDocument> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.employmentOffer.create;

    const body = {
      OfferCode: offer.documentNumber,
      DocumentType: offer.documentType || 'OFFER_LETTER',
      SignatureCount: offer.signatureCount || 2,
      CandidateName: offer.offerDetails.candidateName,
      CandidateEmail: offer.offerDetails.candidateEmail,
      CandidatePhone: offer.offerDetails.candidatePhone,
      Designation: offer.offerDetails.jobTitle || offer.offerDetails.roleTitle || 'Professional',
      Department: offer.offerDetails.department,
      EmploymentType: 'Full-Time',
      WorkLocation: offer.offerDetails.workLocation || offer.offerDetails.location,
      JoiningDate: offer.offerDetails.joiningDate || offer.offerDetails.startDate,
      ExpiryDate: offer.offerDetails.expiryDate,
      ReportingManagerName: offer.offerDetails.reportingManager,
      ReportingManagerTitle: 'Department Head',
      CompanyName: offer.companyName,
      CompanyAddress: offer.companyAddress,
      CompanyCin: 'U72900PN2021PTC202391',
      BaseSalary: offer.offerDetails.fixedSalary || (typeof offer.offerDetails.annualSalary === 'number' ? offer.offerDetails.annualSalary * 0.7 : 0),
      VariablePay: offer.offerDetails.variableBonus || 0,
      JoiningBonus: offer.offerDetails.signOnBonus || 0,
      StockOptions: offer.offerDetails.stockOptionsValue ? String(offer.offerDetails.stockOptionsValue) : '',
      TotalCtc: typeof offer.offerDetails.annualSalary === 'number' ? offer.offerDetails.annualSalary : (offer.offerDetails.ctc || 0),
      AnnualCtc: typeof offer.offerDetails.annualSalary === 'number' ? offer.offerDetails.annualSalary : (offer.offerDetails.ctc || 0),
      Currency: offer.offerDetails.currency || 'INR',
      ProbationPeriodMonths: offer.offerDetails.probationMonths || 3,
      NoticePeriodDays: offer.offerDetails.noticePeriodDays || 30,
      RelocationAllowance: offer.offerDetails.relocationAllowance || 0,
      BenefitsDetails: offer.offerDetails.benefits ? JSON.stringify(offer.offerDetails.benefits) : '',
      OfferLetterHtml: offer.offerLetterHtml || '',
      GeneratedCandidateUrl: offer.generatedCandidateUrl || '',
      DocumentHash: offer.sha256Checksum || '',
      AuditTrailJson: JSON.stringify(offer.auditTrail || []),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const payload: ApiResponseEnvelope<BackendEmploymentOfferDTO> = await response.json();
    const isSuccess = payload.Success ?? payload.success ?? response.ok;
    const data = payload.Data || payload.data;

    if (!response.ok || !isSuccess || !data) {
      throw new Error(payload.Message || payload.message || 'Failed to create and persist employment offer.');
    }

    return this.mapDtoToOfferDocument(data);
  }

  public async candidateSign(params: {
    offerId: string;
    signatureData: string;
    signMode?: string;
    updatedHtml?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<OfferDocument> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.employmentOffer.candidateSign;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        OfferId: params.offerId,
        SignMode: params.signMode || 'DRAW',
        SignatureData: params.signatureData,
        UpdatedHtml: params.updatedHtml,
        IpAddress: params.ipAddress || '127.0.0.1',
        UserAgent: params.userAgent || navigator.userAgent,
      }),
    });

    const payload: ApiResponseEnvelope<BackendEmploymentOfferDTO> = await response.json();
    const data = payload.Data || payload.data;
    if (!response.ok || !data) {
      throw new Error(payload.Message || payload.message || 'Failed to apply candidate signature.');
    }

    return this.mapDtoToOfferDocument(data);
  }

  public async counterSign(params: {
    offerId: string;
    signatureData: string;
    signMode?: string;
    updatedHtml?: string;
  }): Promise<OfferDocument> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.employmentOffer.counterSign;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        OfferId: params.offerId,
        SignMode: params.signMode || 'DRAW',
        SignatureData: params.signatureData,
        UpdatedHtml: params.updatedHtml,
      }),
    });

    const payload: ApiResponseEnvelope<BackendEmploymentOfferDTO> = await response.json();
    const data = payload.Data || payload.data;
    if (!response.ok || !data) {
      throw new Error(payload.Message || payload.message || 'Failed to apply HR countersignature.');
    }

    return this.mapDtoToOfferDocument(data);
  }

  public async thirdPartySign(params: {
    offerId: string;
    signatureData: string;
    signMode?: string;
    updatedHtml?: string;
  }): Promise<OfferDocument> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.employmentOffer.thirdPartySign;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        OfferId: params.offerId,
        SignMode: params.signMode || 'DRAW',
        SignatureData: params.signatureData,
        UpdatedHtml: params.updatedHtml,
      }),
    });

    const payload: ApiResponseEnvelope<BackendEmploymentOfferDTO> = await response.json();
    const data = payload.Data || payload.data;
    if (!response.ok || !data) {
      throw new Error(payload.Message || payload.message || 'Failed to apply third-party signature.');
    }

    return this.mapDtoToOfferDocument(data);
  }

  public async deleteOffer(id: string): Promise<void> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.employmentOffer.delete(id);

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete employment offer: ${response.statusText}`);
    }
  }
}
