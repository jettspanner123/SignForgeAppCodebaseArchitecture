import { OfferDocument } from '../Types';

export default class MockDataSeederService {
  public static readonly current = new MockDataSeederService();

  public getInitialOfferDocuments(): OfferDocument[] {
    return [
      {
        id: 'doc-weplm-1001',
        docNumber: 'WE-OFF-2025-0891',
        documentType: 'OFFER_LETTER',
        signatureCount: 2,
        companyName: 'We.PLM Global Technologies (P) Ltd.',
        companyAddress: 'G22 Deepmala Pimple Saudagar Pune 411027 | Tel: +91 8806060538',
        offerDetails: {
          candidateName: 'Aarav Deshmukh',
          candidateEmail: 'aarav.deshmukh@example.in',
          candidatePhone: '+91 98230 11223',
          candidateDob: '16/09/1998',
          roleTitle: 'Principal Cloud Systems Architect',
          department: 'Enterprise Platform Engineering',
          location: 'Pune, MH (Hybrid)',
          startDate: '2025-04-15',
          expiryDate: '2025-04-05',
          currency: 'INR',
          ctc: 4800000,
          fixedSalary: 4200000,
          variableBonus: 600000,
          retentionBonus: 300000,
          stockOptionsValue: 1200000,
          probationMonths: 3,
          noticePeriodDays: 60,
          reportingManager: 'Dr. Vikram Malhotra (VP Engineering)',
          benefits: [
            'Comprehensive Medical Insurance (Family Floater ₹15L)',
            'Annual Wellness & Home Office Stipend (₹75,000)',
            'Continuous Learning & Certification Allowance',
            'Executive Tech Refresh Program (MacBook Pro M3 Max)'
          ],
          specialConditions: 'Subject to standard background verification and reference checks.'
        },
        status: 'SENT',
        createdAt: '2025-03-24T09:30:00.000Z',
        updatedAt: '2025-03-24T09:30:00.000Z',
        auditTrail: [
          {
            id: 'audit-1',
            timestamp: '2025-03-24T09:30:00.000Z',
            action: 'OFFER_CREATED_AND_DISPATCHED',
            actor: 'Pooja Sharma',
            role: 'Head of Talent Acquisition',
            ipAddress: '103.21.124.55',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            details: 'Initial offer package generated and securely dispatched to candidate email.'
          }
        ]
      },
      {
        id: 'doc-weplm-1002',
        docNumber: 'WE-OFF-2025-0892',
        documentType: 'OFFER_LETTER',
        signatureCount: 2,
        companyName: 'We.PLM Global Technologies (P) Ltd.',
        companyAddress: 'G22 Deepmala Pimple Saudagar Pune 411027 | Tel: +91 8806060538',
        offerDetails: {
          candidateName: 'Rhea Sengupta',
          candidateEmail: 'rhea.sengupta@example.com',
          candidatePhone: '+91 97110 44556',
          candidateDob: '22/11/1996',
          roleTitle: 'Staff Full-Stack Frontend Specialist',
          department: 'Client Experience & Design Systems',
          location: 'Bengaluru, KA (Remote)',
          startDate: '2025-04-01',
          expiryDate: '2025-03-28',
          currency: 'INR',
          ctc: 3600000,
          fixedSalary: 3200000,
          variableBonus: 400000,
          stockOptionsValue: 800000,
          probationMonths: 3,
          noticePeriodDays: 30,
          reportingManager: 'Uddeshya Singh (Engineering Lead)',
          benefits: [
            'Full Remote Work Home Office Setup Grant',
            'Family Health & Dental Insurance Coverage',
            'Flexible Time Off & Wellness Days'
          ]
        },
        status: 'CANDIDATE_SIGNED',
        createdAt: '2025-03-22T14:15:00.000Z',
        updatedAt: '2025-03-23T11:45:00.000Z',
        candidateSignature: {
          signatureImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="cursive" font-size="28" fill="%230C2086">Rhea Sengupta</text></svg>',
          signedAt: '2025-03-23T11:45:00.000Z',
          ipAddress: '49.36.182.11',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          signatureHash: '4a6b2c8d1e3f9a7b5c8d2e1f4a6b8c0d3e5f7a9b1c2d4e6f8a0b2c4d6e8f0a2b',
          signerName: 'Rhea Sengupta',
          signerEmail: 'rhea.sengupta@example.com'
        },
        auditTrail: [
          {
            id: 'audit-2a',
            timestamp: '2025-03-22T14:15:00.000Z',
            action: 'OFFER_CREATED',
            actor: 'HR Operations',
            role: 'HR Manager',
            ipAddress: '103.21.124.55',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
            hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            details: 'Offer letter initialized.'
          },
          {
            id: 'audit-2b',
            timestamp: '2025-03-23T11:45:00.000Z',
            action: 'CANDIDATE_ESIGN_COMPLETED',
            actor: 'Rhea Sengupta',
            role: 'Candidate',
            ipAddress: '49.36.182.11',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            hash: '4a6b2c8d1e3f9a7b5c8d2e1f4a6b8c0d3e5f7a9b1c2d4e6f8a0b2c4d6e8f0a2b',
            details: 'Digital signature authenticated and appended by candidate.'
          }
        ]
      },
      {
        id: 'doc-weplm-1003',
        docNumber: 'WE-OFF-2025-0893',
        documentType: 'OFFER_LETTER',
        signatureCount: 2,
        companyName: 'We.PLM Global Technologies (P) Ltd.',
        companyAddress: 'G22 Deepmala Pimple Saudagar Pune 411027 | Tel: +91 8806060538',
        offerDetails: {
          candidateName: 'Ananya Roy',
          candidateEmail: 'ananya.roy@example.com',
          candidatePhone: '+91 98860 77889',
          candidateDob: '05/04/1995',
          roleTitle: 'Senior Product Security Engineer',
          department: 'Information Security & Compliance',
          location: 'Pune, MH (On-Site)',
          startDate: '2025-04-10',
          expiryDate: '2025-03-20',
          currency: 'INR',
          ctc: 3200000,
          fixedSalary: 2900000,
          variableBonus: 300000,
          probationMonths: 3,
          noticePeriodDays: 60,
          reportingManager: 'Rajesh Kulkarni (CISO)'
        },
        status: 'HR_COUNTERSIGNED',
        createdAt: '2025-03-18T10:00:00.000Z',
        updatedAt: '2025-03-20T16:20:00.000Z',
        candidateSignature: {
          signatureImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="cursive" font-size="28" fill="%230C2086">Ananya Roy</text></svg>',
          signedAt: '2025-03-19T14:10:00.000Z',
          ipAddress: '115.240.90.12',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          signatureHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
          signerName: 'Ananya Roy',
          signerEmail: 'ananya.roy@example.com'
        },
        hrSignature: {
          signatureImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="cursive" font-size="28" fill="%230C2086">Pooja Sharma</text></svg>',
          signedAt: '2025-03-20T16:20:00.000Z',
          ipAddress: '103.21.124.55',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          signatureHash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
          signerName: 'Pooja Sharma',
          signerEmail: 'pooja.sharma@weplm.com',
          signerTitle: 'Head of People & Operations'
        },
        auditTrail: [
          {
            id: 'audit-3a',
            timestamp: '2025-03-18T10:00:00.000Z',
            action: 'OFFER_CREATED',
            actor: 'HR Recruiter',
            role: 'HR Admin',
            ipAddress: '103.21.124.55',
            userAgent: 'Mozilla/5.0',
            hash: '112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
            details: 'Offer letter initiated.'
          },
          {
            id: 'audit-3b',
            timestamp: '2025-03-19T14:10:00.000Z',
            action: 'CANDIDATE_ESIGN_COMPLETED',
            actor: 'Ananya Roy',
            role: 'Candidate',
            ipAddress: '115.240.90.12',
            userAgent: 'Mozilla/5.0',
            hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
            details: 'Signed by candidate.'
          },
          {
            id: 'audit-3c',
            timestamp: '2025-03-20T16:20:00.000Z',
            action: 'HR_COUNTERSIGN_EXECUTED',
            actor: 'Pooja Sharma',
            role: 'HR Operations',
            ipAddress: '103.21.124.55',
            userAgent: 'Mozilla/5.0',
            hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
            details: 'Executed and certified with HR countersignature.'
          }
        ]
      },
      {
        id: 'doc-weplm-1004',
        docNumber: 'WE-OFF-2025-0894',
        documentType: 'OFFER_LETTER',
        signatureCount: 2,
        companyName: 'We.PLM Global Technologies (P) Ltd.',
        companyAddress: 'G22 Deepmala Pimple Saudagar Pune 411027 | Tel: +91 8806060538',
        offerDetails: {
          candidateName: 'Kunal Verma',
          candidateEmail: 'kunal.verma@example.com',
          candidatePhone: '+91 99881 22334',
          roleTitle: 'DevOps & Site Reliability Specialist',
          department: 'Cloud Infrastructure',
          location: 'Pune, MH (Hybrid)',
          startDate: '2025-05-01',
          expiryDate: '2025-03-31',
          currency: 'INR',
          ctc: 2400000,
          fixedSalary: 2200000,
          variableBonus: 200000,
          probationMonths: 3,
          noticePeriodDays: 30,
          reportingManager: 'Amit Joshi'
        },
        status: 'DRAFT',
        createdAt: '2025-03-25T08:00:00.000Z',
        updatedAt: '2025-03-25T08:00:00.000Z',
        auditTrail: [
          {
            id: 'audit-4',
            timestamp: '2025-03-25T08:00:00.000Z',
            action: 'DRAFT_CREATED',
            actor: 'System Admin',
            role: 'HR Admin',
            ipAddress: '103.21.124.55',
            userAgent: 'Mozilla/5.0',
            hash: '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
            details: 'Draft document created in editor.'
          }
        ]
      }
    ];
  }
}
