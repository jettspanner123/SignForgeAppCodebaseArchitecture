export interface NetworkAPIEndpoints {
  healthCheck: {
    status: string;
    ping: string;
  };
  authentication: {
    login: string;
    refreshToken: string;
    me: string;
  };
  offerLetter: {
    base: string;
    getAll: string;
    getById: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
  employmentOffer: {
    base: string;
    getAll: string;
    getById: (id: string) => string;
    create: string;
    candidateSign: string;
    counterSign: string;
    thirdPartySign: string;
    delete: (id: string) => string;
  };
  dashboardInfoGrab: {
    base: string;
    getDashboardData: string;
  };
  signature: {
    base: string;
    applyHR: string;
    applyCandidate: string;
    verifyChecksum: string;
  };
  candidate: {
    base: string;
    getPortalView: (id: string) => string;
    acceptOffer: string;
    rejectOffer: string;
  };
}

export interface ApplicationNetworkAPIConfigurationDetails {
  baseUrl: string;
  timeoutMs: number;
  headers: Record<string, string>;
  endpoints: NetworkAPIEndpoints;
}

export default class ApplicationNetworkAPIConfiguration {
  public static current: ApplicationNetworkAPIConfiguration = new ApplicationNetworkAPIConfiguration();

  private readonly defaultTimeoutMs: number = 30000;

  public getBaseUrl(): string {
    const rawEnvUrl =
      typeof import.meta !== 'undefined' && import.meta.env
        ? ((import.meta.env.SIGNFORGE_BACKEND_BASE_URL ||
            import.meta.env.VITE_SIGNFORGE_BACKEND_BASE_URL ||
            import.meta.env.VITE_BACKEND_API_BASE_URL ||
            import.meta.env.VITE_API_BASE_URL) as string | undefined)
        : undefined;

    const rawProcessEnvUrl =
      typeof process !== 'undefined' && process.env
        ? ((process.env.SIGNFORGE_BACKEND_BASE_URL ||
            process.env.VITE_SIGNFORGE_BACKEND_BASE_URL ||
            process.env.VITE_BACKEND_API_BASE_URL ||
            process.env.VITE_API_BASE_URL) as string | undefined)
        : undefined;

    const configuredValue = (rawEnvUrl || rawProcessEnvUrl || 'localhost:8080').trim();

    // Check if accessed from a remote device/mobile on LAN (e.g. 192.168.x.x) and configured for local dev
    let hostValue = configuredValue;
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const currentHost = window.location.hostname;
      const isLocalDevConfig =
        hostValue.startsWith('localhost') ||
        hostValue.startsWith('127.0.0.1') ||
        hostValue.startsWith('http://localhost') ||
        hostValue.startsWith('http://127.0.0.1');

      if (isLocalDevConfig && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        hostValue = hostValue
          .replace(/localhost(:[0-9]+)?/g, `${currentHost}$1`)
          .replace(/127\.0\.0\.1(:[0-9]+)?/g, `${currentHost}$1`);
      }
    }

    // Normalize URL: ensure protocol scheme is present and trailing slashes are removed
    let normalized = hostValue.replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(normalized)) {
      if (
        normalized.startsWith('localhost') ||
        normalized.startsWith('127.0.0.1') ||
        /^192\.168\./.test(normalized) ||
        /^10\./.test(normalized) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(normalized)
      ) {
        normalized = `http://${normalized}`;
      } else {
        normalized = `https://${normalized}`;
      }
    }

    return normalized;
  }

  public getConfiguration(): ApplicationNetworkAPIConfigurationDetails {
    const activeBaseUrl = this.getBaseUrl();

    return {
      baseUrl: activeBaseUrl,
      timeoutMs: this.defaultTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      endpoints: {
        healthCheck: {
          status: `${activeBaseUrl}/Api/V1/HealthCheck`,
          ping: `${activeBaseUrl}/Api/V1/HealthCheck/Ping`,
        },
        authentication: {
          login: `${activeBaseUrl}/Api/V1/Authentication/Login`,
          refreshToken: `${activeBaseUrl}/Api/V1/Authentication/RefreshToken`,
          me: `${activeBaseUrl}/Api/V1/Authentication/Me`,
        },
        offerLetter: {
          base: `${activeBaseUrl}/Api/V1/OfferLetter`,
          getAll: `${activeBaseUrl}/Api/V1/OfferLetter`,
          getById: (id: string) => `${activeBaseUrl}/Api/V1/OfferLetter/${id}`,
          create: `${activeBaseUrl}/Api/V1/OfferLetter`,
          update: (id: string) => `${activeBaseUrl}/Api/V1/OfferLetter/${id}`,
          delete: (id: string) => `${activeBaseUrl}/Api/V1/OfferLetter/${id}`,
        },
        employmentOffer: {
          base: `${activeBaseUrl}/Api/V1/EmploymentOffer`,
          getAll: `${activeBaseUrl}/Api/V1/EmploymentOffer/GetAll`,
          getById: (id: string) => `${activeBaseUrl}/Api/V1/EmploymentOffer/${id}`,
          create: `${activeBaseUrl}/Api/V1/EmploymentOffer/Create`,
          candidateSign: `${activeBaseUrl}/Api/V1/EmploymentOffer/CandidateSign`,
          counterSign: `${activeBaseUrl}/Api/V1/EmploymentOffer/CounterSign`,
          thirdPartySign: `${activeBaseUrl}/Api/V1/EmploymentOffer/ThirdPartySign`,
          delete: (id: string) => `${activeBaseUrl}/Api/V1/EmploymentOffer/${id}`,
        },
        dashboardInfoGrab: {
          base: `${activeBaseUrl}/Api/V1/DashboardInfoGrab`,
          getDashboardData: `${activeBaseUrl}/Api/V1/DashboardInfoGrab`,
        },
        signature: {
          base: `${activeBaseUrl}/Api/V1/Signature`,
          applyHR: `${activeBaseUrl}/Api/V1/Signature/ApplyHR`,
          applyCandidate: `${activeBaseUrl}/Api/V1/Signature/ApplyCandidate`,
          verifyChecksum: `${activeBaseUrl}/Api/V1/Signature/VerifyChecksum`,
        },
        candidate: {
          base: `${activeBaseUrl}/Api/V1/Candidate`,
          getPortalView: (id: string) => `${activeBaseUrl}/Api/V1/Candidate/${id}`,
          acceptOffer: `${activeBaseUrl}/Api/V1/Candidate/Accept`,
          rejectOffer: `${activeBaseUrl}/Api/V1/Candidate/Reject`,
        },
      },
    };
  }
}
