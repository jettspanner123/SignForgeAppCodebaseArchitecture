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
    const envUrl =
      typeof import.meta !== 'undefined' && import.meta.env
        ? (import.meta.env.VITE_BACKEND_API_BASE_URL as string | undefined)
        : undefined;

    const processEnvUrl =
      typeof process !== 'undefined' && process.env
        ? (process.env.VITE_BACKEND_API_BASE_URL as string | undefined)
        : undefined;

    const configuredUrl = envUrl || processEnvUrl;
    if (configuredUrl) {
      return configuredUrl.replace(/\/+$/, '');
    }

    // Default local Spring Boot backend address
    return 'http://localhost:8080/api/v1';
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
