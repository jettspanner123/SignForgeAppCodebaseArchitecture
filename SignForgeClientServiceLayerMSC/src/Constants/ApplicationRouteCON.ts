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

  public static toHash(view: string, docId?: string): string {
    const base = this.HASH_MAP[view] || '#/documents';
    if (docId && (view === this.CANDIDATE_VIEW || view === this.HR_COUNTERSIGN)) {
      return `${base}/${docId}`;
    }
    return base;
  }

  public static fromHash(hash: string): { view: string; docId?: string } {
    if (!hash || hash === '#/' || hash === '#/documents') {
      return { view: this.DOCUMENTS };
    }
    if (hash.startsWith('#/candidate/')) {
      const docId = hash.replace('#/candidate/', '');
      return { view: this.CANDIDATE_VIEW, docId };
    }
    if (hash.startsWith('#/countersign/')) {
      const docId = hash.replace('#/countersign/', '');
      return { view: this.HR_COUNTERSIGN, docId };
    }
    if (hash === '#/create-offer') return { view: this.CREATE_OFFER };
    if (hash === '#/upload-pdf') return { view: this.UPLOAD_PDF };
    if (hash === '#/audit-trail') return { view: this.AUDIT_TRAILS };

    return { view: this.DOCUMENTS };
  }
}
