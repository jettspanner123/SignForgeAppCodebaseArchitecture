export default class RequestFeatureCON {
  public static readonly FEATURE_TITLE = 'Request Feature';
  public static readonly FEATURE_SUBTITLE = 'Submit enterprise feature proposals, product enhancement requests, and workflow optimizations.';

  public static readonly FEATURE_TYPES = [
    { value: 'New Feature / Capability', label: 'New Feature / Capability', description: 'Brand new capability or workflow automation' },
    { value: 'UI / UX Enhancement', label: 'UI / UX Enhancement', description: 'Visual design, usability, layout, or responsiveness improvement' },
    { value: 'API & Integration', label: 'API & Integration', description: 'HRMS/ERP webhooks, REST endpoints, or third-party connector' },
    { value: 'Performance & Scalability', label: 'Performance & Scalability', description: 'Latency, caching, document generation speed, or query optimizations' },
    { value: 'Security & Compliance', label: 'Security & Compliance', description: 'Access control, audit log fidelity, signatures, or cryptographic seals' },
    { value: 'Other / General Feedback', label: 'Other / General Feedback', description: 'General suggestions or miscellaneous platform feedback' },
  ] as const;

  public static readonly MIN_TITLE_LENGTH = 5;
  public static readonly MAX_TITLE_LENGTH = 255;
  public static readonly MIN_DESCRIPTION_LENGTH = 20;
  public static readonly MAX_DESCRIPTION_LENGTH = 2000;
}
