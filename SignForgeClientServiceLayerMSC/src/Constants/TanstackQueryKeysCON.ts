export default class TanstackQueryKeysCON {
  public static readonly AUTH_SESSION = ['auth', 'session'] as const;
  public static readonly AUTH_ME = ['auth', 'me'] as const;
  public static readonly OFFER_LETTERS = ['offer-letters'] as const;
  public static readonly OFFER_LETTER_DETAIL = (id: string) => ['offer-letters', id] as const;
  public static readonly CANDIDATE_OFFER = (id: string) => ['candidate', 'offer', id] as const;
  public static readonly HEALTH_CHECK = ['health-check'] as const;
  public static readonly DASHBOARD_INFO_GRAB = ['dashboard-info-grab'] as const;
  public static readonly EMPLOYMENT_OFFERS = ['employment-offers'] as const;
  public static readonly EMPLOYMENT_OFFER_DETAIL = (id: string) => ['employment-offers', id] as const;
}
