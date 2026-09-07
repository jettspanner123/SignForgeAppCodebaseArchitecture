/**
 * UploadPDF Feature Constants.
 * Strictly encapsulates all constants, demo sample payload, and default values.
 */
export default class UploadPDFCON {
  public static readonly FEATURE_TITLE = 'Upload External PDF Offer Letter';
  public static readonly FEATURE_SUBTITLE = 'Upload your custom PDF document. Our system will embed interactive candidate & HR eSign fields inside the PDF.';

  public static readonly DEFAULT_COMPANY_NAME = 'We.PLM Global Technologies (P) Ltd.';
  public static readonly DEFAULT_COMPANY_ADDRESS = 'G22 Deepmala Pimple Saudagar Pune 411027';

  public static readonly DEFAULT_HR_HEAD_NAME = 'Sarah Jenkins';
  public static readonly DEFAULT_HR_HEAD_EMAIL = 'hr@theweplm.com';

  public static readonly DEFAULT_CTO_NAME = 'David K. Chen';
  public static readonly DEFAULT_CTO_EMAIL = 'cto@theweplm.com';

  public static readonly DEFAULT_DIRECTOR_NAME = 'Shantanu Jagtap';
  public static readonly DEFAULT_DIRECTOR_TITLE = 'Director & VP';
  public static readonly DEFAULT_DIRECTOR_EMAIL = 'director@theweplm.com';

  // Demo 1-Page Minimal Valid Base64 PDF for Instant Testing
  public static readonly SAMPLE_PDF_BASE64: string =
    'data:application/pdf;base64,JVBERi0xLjQKJSDl4uXnCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvQ291bnQgMSAvS2lkcyBbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9SZXNvdXJjZXMgPDwvRm9udCA8PC9GMSA0IDAgUj4+Pj4gL0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9SZXNvdXJjZXMgPDwvRm9udCA8PC9GMSA0IDAgUj4+Pj4gL0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2E+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggMTI1Pj4Kc3RyZWFtCkJUMQowIDAgMCByZ2IKL0YxIDI0IFRmCjUwIDcwMCBUZCAoT0ZGRVIgTEVUVEVSIFAgRCAgRUlHIE5BVFVSRSBURVNUKTBUZgoxIDAgMCAxIDUwIDY1MCBUbQooQ2FuZGlkYXRlOiBBbGV4IFJpdmVyYSAtIFByaW5jaXBhbCBTb2x1dGlvbnMgQXJjaGl0ZWN0KVRqCkVUCmVuZHN0cmVhbQplbmRvYmoKdHJhaWxlcgo8PC9Sb290IDEgMCBSL1NpemUgNio+PgpzdGFydHhyZWYKNDkwCiUlRU9G';

  public static readonly SAMPLE_PDF_FILENAME: string = 'Executive_Offer_Letter_Alex_Rivera.pdf';
  public static readonly SAMPLE_PDF_TEXT_PROMPT: string = 'Candidate: Alex Rivera - Principal Solutions Architect';
}
