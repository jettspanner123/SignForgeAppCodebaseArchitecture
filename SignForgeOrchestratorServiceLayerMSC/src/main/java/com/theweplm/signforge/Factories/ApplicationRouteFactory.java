package com.theweplm.signforge.Factories;

/**
 * Singleton Route Factory defining all application endpoint routes.
 * Hardcoding URL strings in controllers is strictly prohibited.
 */
public final class ApplicationRouteFactory {

    private static final ApplicationRouteFactory CURRENT = new ApplicationRouteFactory();

    public static ApplicationRouteFactory getCurrent() {
        return CURRENT;
    }

    private ApplicationRouteFactory() {
    }

    public final AuthenticationRoutes authentication = new AuthenticationRoutes();
    public final HealthCheckRoutes healthCheck = new HealthCheckRoutes();
    public final DocumentationRoutes documentation = new DocumentationRoutes();
    public final OfferLetterRoutes offerLetter = new OfferLetterRoutes();
    public final EmploymentOfferRoutes employmentOffer = new EmploymentOfferRoutes();
    public final DashboardInfoGrabRoutes dashboardInfoGrab = new DashboardInfoGrabRoutes();
    public final SignatureRoutes signature = new SignatureRoutes();
    public final CandidateRoutes candidate = new CandidateRoutes();

    public static final class AuthenticationRoutes {
        public static final String CONTROLLER_URL = "Api/V1/Authentication";
        public static final String LOGIN = "Login";
        public static final String REFRESH_TOKEN = "RefreshToken";
        public static final String ME = "Me";
    }

    public static final class HealthCheckRoutes {
        public static final String CONTROLLER_URL = "Api/V1/HealthCheck";
        public static final String STATUS = "";
        public static final String PING = "Ping";
    }

    public static final class DocumentationRoutes {
        public static final String CONTROLLER_URL = "Api/V1/Documentation";
        public static final String OPEN_API_SPEC = "/openapi/v1.json";
    }

    public static final class OfferLetterRoutes {
        public static final String CONTROLLER_URL = "Api/V1/OfferLetter";
        public static final String GET_ALL = "";
        public static final String GET_BY_ID = "{id}";
        public static final String CREATE = "";
        public static final String UPDATE = "{id}";
        public static final String DELETE = "{id}";
    }

    public static final class EmploymentOfferRoutes {
        public static final String CONTROLLER_URL = "Api/V1/EmploymentOffer";
        public static final String GET_ALL = "GetAll";
        public static final String GET_BY_ID = "{id}";
        public static final String CREATE = "Create";
        public static final String CANDIDATE_SIGN = "CandidateSign";
        public static final String COUNTER_SIGN = "CounterSign";
        public static final String THIRD_PARTY_SIGN = "ThirdPartySign";
        public static final String DELETE = "{id}";
    }

    public static final class DashboardInfoGrabRoutes {
        public static final String CONTROLLER_URL = "Api/V1/DashboardInfoGrab";
        public static final String GET_DASHBOARD_DATA = "";
        public static final String SUMMARY = "Summary";
    }

    public static final class SignatureRoutes {
        public static final String CONTROLLER_URL = "Api/V1/Signature";
        public static final String APPLY_HR = "ApplyHR";
        public static final String APPLY_CANDIDATE = "ApplyCandidate";
        public static final String VERIFY_CHECKSUM = "VerifyChecksum";
    }

    public static final class CandidateRoutes {
        public static final String CONTROLLER_URL = "Api/V1/Candidate";
        public static final String GET_PORTAL_VIEW = "{id}";
        public static final String ACCEPT_OFFER = "Accept";
        public static final String REJECT_OFFER = "Reject";
    }
}
