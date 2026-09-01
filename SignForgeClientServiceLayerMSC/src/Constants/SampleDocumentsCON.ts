import { OfferDocument } from '../Types';

export const SAMPLE_DOCUMENTS: OfferDocument[] = [
  {
    id: 'doc-weplm-101',
    documentNumber: 'WE-OFFER-2025-089',
    title: 'Lead PLM Solutions Architect Offer',
    documentType: 'OFFER_LETTER',
    companyName: 'We.PLM India (P) Ltd.',
    status: 'CANDIDATE_SIGNED',
    signatureCount: 2,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    sha256Checksum: '8f4a1c6e9d2b3a5f7c8e0d1b2a3c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
    offerDetails: {
      candidateName: 'Vikramaditya Sengupta',
      candidateEmail: 'vikram.sengupta@techforge.io',
      candidatePhone: '+91 98765 43210',
      jobTitle: 'Lead PLM Solutions Architect',
      department: 'Enterprise PLM Practice',
      workLocation: 'Bengaluru / Hybrid',
      annualSalary: '₹34,50,000 CTC',
      joiningDate: '2025-10-15',
      reportingManager: 'Rajesh K. Mehta (VP Technology)',
      probationMonths: 3,
      specialConditions: 'Standard 90-day probation with full healthcare and performance stock options.'
    },
    executives: {
      hrHead: { name: 'Pooja Sharma', email: 'pooja.sharma@weplm.com', role: 'HR Administrator', status: 'PENDING' },
      cto: { name: 'David K. Chen', email: 'cto@weplm.com', role: 'Chief Technology Officer', status: 'PENDING' }
    },
    candidateSignature: {
      signedBy: 'Vikramaditya Sengupta',
      value: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="Brush Script MT, cursive" font-size="28" fill="%230C2086">V. Sengupta</text></svg>',
      timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      ipAddress: '103.24.120.45'
    },
    auditTrail: [
      {
        id: 'aud-101-1',
        action: 'Document Generated & Dispatched',
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
        actor: 'Pooja Sharma',
        actorRole: 'HR Administrator',
        ipAddress: '192.168.1.100'
      },
      {
        id: 'aud-101-2',
        action: 'Candidate eSignature Applied & Verified',
        timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        actor: 'Vikramaditya Sengupta',
        actorRole: 'Candidate',
        ipAddress: '103.24.120.45'
      }
    ]
  },
  {
    id: 'doc-weplm-102',
    documentNumber: 'WE-OFFER-2025-092',
    title: 'Senior Siemens Teamcenter Developer Offer',
    documentType: 'OFFER_LETTER',
    companyName: 'We.PLM India (P) Ltd.',
    status: 'SENT',
    signatureCount: 2,
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    offerDetails: {
      candidateName: 'Ananya Deshmukh',
      candidateEmail: 'ananya.deshmukh@cloudmatrix.dev',
      candidatePhone: '+91 91234 56789',
      jobTitle: 'Senior Siemens Teamcenter Developer',
      department: 'Digital Manufacturing Systems',
      workLocation: 'Pune / Innovation Hub',
      annualSalary: '₹22,00,000 CTC',
      joiningDate: '2025-11-01',
      reportingManager: 'Amitabh Joshi (Engineering Director)',
      probationMonths: 3
    },
    executives: {
      hrHead: { name: 'Pooja Sharma', email: 'pooja.sharma@weplm.com', role: 'HR Administrator', status: 'PENDING' },
      cto: { name: 'David K. Chen', email: 'cto@weplm.com', role: 'Chief Technology Officer', status: 'PENDING' }
    },
    auditTrail: [
      {
        id: 'aud-102-1',
        action: 'Document Generated & Dispatched',
        timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        actor: 'Pooja Sharma',
        actorRole: 'HR Administrator',
        ipAddress: '192.168.1.100'
      }
    ]
  },
  {
    id: 'doc-weplm-103',
    documentNumber: 'WE-OFFER-2025-078',
    title: 'Principal Cloud Infrastructure Specialist',
    documentType: 'JOINING_LETTER',
    companyName: 'We.PLM India (P) Ltd.',
    status: 'HR_COUNTERSIGNED',
    signatureCount: 3,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
    sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    offerDetails: {
      candidateName: 'Rohan Jayasimha',
      candidateEmail: 'rohan.jayasimha@infoscale.net',
      candidatePhone: '+91 99887 76655',
      jobTitle: 'Principal Cloud Infrastructure Specialist',
      department: 'Infrastructure & Security',
      workLocation: 'Hyderabad / CyberGateway',
      annualSalary: '₹42,00,000 CTC',
      joiningDate: '2025-09-01',
      reportingManager: 'David K. Chen (CTO)',
      probationMonths: 6
    },
    executives: {
      hrHead: { name: 'Pooja Sharma', email: 'pooja.sharma@weplm.com', role: 'HR Administrator', status: 'SIGNED' },
      cto: { name: 'David K. Chen', email: 'cto@weplm.com', role: 'Chief Technology Officer', status: 'SIGNED' }
    },
    candidateSignature: {
      signedBy: 'Rohan Jayasimha',
      value: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="Brush Script MT, cursive" font-size="28" fill="%230C2086">R. Jayasimha</text></svg>',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 6).toISOString(),
      ipAddress: '49.207.180.99'
    },
    hrSignature: {
      signedBy: 'Pooja Sharma',
      value: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="Brush Script MT, cursive" font-size="28" fill="%230C2086">Pooja S.</text></svg>',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
      ipAddress: '192.168.1.100'
    },
    auditTrail: [
      {
        id: 'aud-103-1',
        action: 'Document Generated',
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 7).toISOString(),
        actor: 'Pooja Sharma',
        actorRole: 'HR Administrator',
        ipAddress: '192.168.1.100'
      },
      {
        id: 'aud-103-2',
        action: 'Candidate eSignature Verified',
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 6).toISOString(),
        actor: 'Rohan Jayasimha',
        actorRole: 'Candidate',
        ipAddress: '49.207.180.99'
      },
      {
        id: 'aud-103-3',
        action: 'HR Executive Countersigned & Sealed',
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
        actor: 'Pooja Sharma',
        actorRole: 'HR Administrator',
        ipAddress: '192.168.1.100'
      }
    ]
  },
  {
    id: 'doc-weplm-104',
    documentNumber: 'WE-OFFER-2025-061',
    title: 'Product Lifecycle Associate Consultant',
    documentType: 'OFFER_LETTER',
    companyName: 'We.PLM India (P) Ltd.',
    status: 'DRAFT',
    signatureCount: 2,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24 * 14).toISOString(),
    offerDetails: {
      candidateName: 'Meera Iyer',
      candidateEmail: 'meera.iyer@enggcollege.edu',
      candidatePhone: '+91 97766 55443',
      jobTitle: 'Product Lifecycle Associate Consultant',
      department: 'Consulting Services',
      workLocation: 'Chennai / Tidel Park',
      annualSalary: '₹9,50,000 CTC',
      joiningDate: '2025-11-15',
      reportingManager: 'Kavitha Sundaram (Practice Lead)',
      probationMonths: 6
    },
    executives: {
      hrHead: { name: 'Pooja Sharma', email: 'pooja.sharma@weplm.com', role: 'HR Administrator', status: 'PENDING' },
      cto: { name: 'David K. Chen', email: 'cto@weplm.com', role: 'Chief Technology Officer', status: 'PENDING' }
    },
    auditTrail: [
      {
        id: 'aud-104-1',
        action: 'Draft Initialized',
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 14).toISOString(),
        actor: 'Pooja Sharma',
        actorRole: 'HR Administrator',
        ipAddress: '192.168.1.100'
      }
    ]
  }
];