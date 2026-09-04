export default class ApplicationRouteCON {
  public static readonly ROOT: string = '/';
  public static readonly LOGIN: string = 'login';
  public static readonly DASHBOARD: string = 'documents';
  public static readonly DOCUMENTS: string = 'documents';
  public static readonly CREATE_OFFER: string = 'create_offer';
  public static readonly UPLOAD_PDF: string = 'upload_pdf';
  public static readonly CANDIDATE_VIEW: string = 'candidate_view';
  public static readonly HR_COUNTERSIGN: string = 'hr_countersign';
  public static readonly SETTINGS: string = 'settings';
  public static readonly VERCEL_GUIDE: string = 'vercel_guide';

  public static readonly PATH_MAP: Record<string, string> = {
    [ApplicationRouteCON.LOGIN]: '/login',
    [ApplicationRouteCON.DOCUMENTS]: '/dashboard',
    [ApplicationRouteCON.CREATE_OFFER]: '/create-offer',
    [ApplicationRouteCON.UPLOAD_PDF]: '/upload-pdf',
    [ApplicationRouteCON.CANDIDATE_VIEW]: '/candidate',
    [ApplicationRouteCON.HR_COUNTERSIGN]: '/countersign',
  };

  public static toPath(view: string, docId?: string): string {
    const base = this.PATH_MAP[view] || '/dashboard';
    if (docId && (view === this.CANDIDATE_VIEW || view === this.HR_COUNTERSIGN)) {
      return `${base}/${docId}`;
    }
    return base;
  }

  public static isPublicRoute(view: string, pathname?: string): boolean {
    if (view === this.CANDIDATE_VIEW) return true;
    if (pathname) {
      const clean = pathname.toLowerCase();
      if (
        clean.startsWith('/candidate') ||
        clean.startsWith('/candidate-portal') ||
        clean.startsWith('/c/') ||
        clean.startsWith('/sign')
      ) {
        return true;
      }
    }
    return false;
  }

  public static fromPathname(pathname: string, hash?: string): { view: string; docId?: string } {
    // 1. Check legacy hash first for backward compatibility
    if (hash && hash.startsWith('#/')) {
      const cleanHash = hash.replace('#', '');
      return this.fromPathname(cleanHash);
    }

    const cleanPath = (pathname || '/').trim();

    // 2. Login / Signin route
    if (cleanPath === '/login' || cleanPath === '/signin') {
      return { view: this.LOGIN };
    }

    // 3. Dashboard / Documents / Root routes
    if (cleanPath === '/' || cleanPath === '/dashboard' || cleanPath === '/documents') {
      return { view: this.DOCUMENTS };
    }

    // 4. Candidate Signing Portal routes (Public)
    if (cleanPath.startsWith('/candidate/')) {
      const docId = cleanPath.replace('/candidate/', '').trim();
      return { view: this.CANDIDATE_VIEW, docId: docId || undefined };
    }
    if (cleanPath.startsWith('/candidate-portal/')) {
      const docId = cleanPath.replace('/candidate-portal/', '').trim();
      return { view: this.CANDIDATE_VIEW, docId: docId || undefined };
    }
    if (cleanPath.startsWith('/c/')) {
      const docId = cleanPath.replace('/c/', '').trim();
      return { view: this.CANDIDATE_VIEW, docId: docId || undefined };
    }
    if (cleanPath === '/candidate') {
      return { view: this.CANDIDATE_VIEW };
    }

    // 5. Protected Feature Routes
    if (cleanPath.startsWith('/countersign/')) {
      const docId = cleanPath.replace('/countersign/', '').trim();
      return { view: this.HR_COUNTERSIGN, docId: docId || undefined };
    }
    if (cleanPath === '/countersign') return { view: this.HR_COUNTERSIGN };
    if (cleanPath === '/create-offer' || cleanPath === '/create') return { view: this.CREATE_OFFER };
    if (cleanPath === '/upload-pdf' || cleanPath === '/upload') return { view: this.UPLOAD_PDF };
    if (cleanPath === '/vercel-guide') return { view: this.VERCEL_GUIDE };

    // Default fallback
    return { view: this.DOCUMENTS };
  }
}
