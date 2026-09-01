export default class ApplicationRouteCON {
  public static readonly DOCUMENTS = 'documents';
  public static readonly CREATE_OFFER = 'create_offer';
  public static readonly UPLOAD_PDF = 'upload_pdf';
  public static readonly AUDIT_TRAILS = 'audit_trail';
  public static readonly CANDIDATE_VIEW = 'candidate_view';
  public static readonly HR_COUNTERSIGN = 'hr_countersign';
  public static readonly SETTINGS = 'settings';
  public static readonly VERCEL_GUIDE = 'vercel_guide';

  public static readonly HASH_MAP: Record<string, string> = {
    [ApplicationRouteCON.DOCUMENTS]: '#/documents',
    [ApplicationRouteCON.CREATE_OFFER]: '#/create-offer',
    [ApplicationRouteCON.UPLOAD_PDF]: '#/upload-pdf',
    [ApplicationRouteCON.AUDIT_TRAILS]: '#/audit-trail',
    [ApplicationRouteCON.CANDIDATE_VIEW]: '#/candidate',
    [ApplicationRouteCON.HR_COUNTERSIGN]: '#/countersign',
  };
}
