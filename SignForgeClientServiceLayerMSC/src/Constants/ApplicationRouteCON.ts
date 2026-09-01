export default class ApplicationRouteCON {
  public static readonly ROOT: string = '/';
  public static readonly DOCUMENTS: string = 'documents';
  public static readonly CREATE_OFFER: string = 'create_offer';
  public static readonly UPLOAD_PDF: string = 'upload_pdf';
  public static readonly AUDIT_TRAILS: string = 'audit_trail';
  public static readonly CANDIDATE_VIEW: string = 'candidate_view';
  public static readonly HR_COUNTERSIGN: string = 'hr_countersign';
  public static readonly SETTINGS: string = 'settings';
  public static readonly VERCEL_GUIDE: string = 'vercel_guide';

  public static readonly PATH_MAP: Record<string, string> = {
    [ApplicationRouteCON.DOCUMENTS]: '/documents',
    [ApplicationRouteCON.CREATE_OFFER]: '/create-offer',
    [ApplicationRouteCON.UPLOAD_PDF]: '/upload-pdf',
    [ApplicationRouteCON.AUDIT_TRAILS]: '/audit-trail',
    [ApplicationRouteCON.CANDIDATE_VIEW]: '/candidate',
    [ApplicationRouteCON.HR_COUNTERSIGN]: '/countersign',
  };

  public static toPath(view: string, docId?: string): string {
    const base = this.PATH_MAP[view] || '/documents';
    if (docId && (view === this.CANDIDATE_VIEW || view === this.HR_COUNTERSIGN)) {
      return `${base}/${docId}`;
    }
    return base;
  }

  public static fromPathname(pathname: string, hash?: string): { view: string; docId?: string } {
    // 1. Check legacy hash first for backward compatibility
    if (hash && hash.startsWith('#/')) {
      const cleanHash = hash.replace('#', '');
      return this.fromPathname(cleanHash);
    }

    // 2. Standard clean pathnames
    if (!pathname || pathname === '/' || pathname === '/documents') {
      return { view: this.DOCUMENTS };
    }
    if (pathname.startsWith('/candidate/')) {
      const docId = pathname.replace('/candidate/', '');
      return { view: this.CANDIDATE_VIEW, docId };
    }
    if (pathname.startsWith('/countersign/')) {
      const docId = pathname.replace('/countersign/', '');
      return { view: this.HR_COUNTERSIGN, docId };
    }
    if (pathname === '/create-offer') return { view: this.CREATE_OFFER };
    if (pathname === '/upload-pdf') return { view: this.UPLOAD_PDF };
    if (pathname === '/audit-trail') return { view: this.AUDIT_TRAILS };

    return { view: this.DOCUMENTS };
  }
}
