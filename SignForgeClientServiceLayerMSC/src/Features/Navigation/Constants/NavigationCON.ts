import { FileText, Plus, Upload } from 'lucide-react';
import ApplicationRouteCON from '../../../Constants/ApplicationRouteCON';

export interface NavItemDef {
  id: string;
  label: string;
  icon: typeof FileText;
  hashPath: string;
  description?: string;
}

export default class NavigationCON {
  public static readonly BRAND_TITLE = 'SignForge';
  public static readonly BRAND_SUBTITLE = 'Enterprise ITSC';

  public static readonly PRIMARY_NAV_ITEMS: NavItemDef[] = [
    {
      id: ApplicationRouteCON.DOCUMENTS,
      label: 'Document Inventory',
      icon: FileText,
      hashPath: '#/documents',
      description: 'Pipeline & document repository'
    },
    {
      id: ApplicationRouteCON.CREATE_OFFER,
      label: 'Offer Builder',
      icon: Plus,
      hashPath: '#/create-offer',
      description: 'Draft and customize executive offer letters'
    },
    {
      id: ApplicationRouteCON.UPLOAD_PDF,
      label: 'Upload Custom PDF',
      icon: Upload,
      hashPath: '#/upload-pdf',
      description: 'Upload PDF and place eSignature coordinate fields'
    }
  ];

  public static readonly DEFAULT_USER = {
    name: 'Pooja Sharma',
    email: 'pooja.sharma@weplm.com',
    role: 'HR Administrator',
    initials: 'PS'
  };
}
