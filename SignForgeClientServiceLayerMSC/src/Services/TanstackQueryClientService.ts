import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { LoginCredentials, LoginAuthState } from '../Features/LoginScreen/Models/LoginScreenModel';
import LoginScreenService from '../Features/LoginScreen/Services/LoginScreenService';
import DashboardInfoGrabService from '../Features/DashboardInfoGrab/Services/DashboardInfoGrabService';
import DashboardInfoGrabResponseInterfaceModel from '../Models/DashboardInfoGrabResponseInterfaceModel';
import EmploymentOfferService from '../Features/EmploymentOffer/Services/EmploymentOfferService';
import { OfferDocument } from '../Types';
import TanstackQueryKeysCON from '../Constants/TanstackQueryKeysCON';
import { useOfferDocumentStore } from '../Store/OfferDocumentStore';

export class AuthenticationQueryService {
  constructor(private readonly getClient?: () => QueryClient) {}

  public useLoginMutation(
    options?: UseMutationOptions<LoginAuthState, Error, LoginCredentials>
  ): UseMutationResult<LoginAuthState, Error, LoginCredentials> {
    return useMutation({
      mutationFn: async (credentials: LoginCredentials): Promise<LoginAuthState> => {
        return await LoginScreenService.current.authenticateWithCredentials(credentials);
      },
      ...options,
    });
  }

  public loginMutation(
    options?: UseMutationOptions<LoginAuthState, Error, LoginCredentials>
  ): UseMutationResult<LoginAuthState, Error, LoginCredentials> {
    return this.useLoginMutation(options);
  }

  public useMicrosoftLoginMutation(
    options?: UseMutationOptions<LoginAuthState, Error, void>
  ): UseMutationResult<LoginAuthState, Error, void> {
    return useMutation({
      mutationFn: async (): Promise<LoginAuthState> => {
        return await LoginScreenService.current.authenticateWithMicrosoft();
      },
      ...options,
    });
  }

  public microsoftLoginMutation(
    options?: UseMutationOptions<LoginAuthState, Error, void>
  ): UseMutationResult<LoginAuthState, Error, void> {
    return this.useMicrosoftLoginMutation(options);
  }
}

export class DashboardInfoGrabQueryService {
  constructor(private readonly getClient?: () => QueryClient) {}

  public useDashboardInfoQuery(
    options?: Partial<UseQueryOptions<DashboardInfoGrabResponseInterfaceModel, Error>>
  ): UseQueryResult<DashboardInfoGrabResponseInterfaceModel, Error> {
    return useQuery({
      queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB,
      queryFn: async (): Promise<DashboardInfoGrabResponseInterfaceModel> => {
        try {
          const result = await DashboardInfoGrabService.current.getDashboardData();
          if (result && result.offers && result.offers.length > 0) {
            useOfferDocumentStore.getState().setDocuments(result.offers);
          }
          return result;
        } catch (err) {
          console.warn('Backend DashboardInfoGrab API unavailable, falling back to local state:', err);
          const localDocs = useOfferDocumentStore.getState().documents;
          return {
            metrics: {
              totalPipeline: localDocs.length,
              awaitingCandidate: localDocs.filter((d) => d.status === 'SENT' || d.status === 'OUT_FOR_CANDIDATE_SIGN').length,
              awaitingCountersign: localDocs.filter((d) => d.status === 'CANDIDATE_SIGNED').length,
              awaitingThirdPartySign: localDocs.filter((d) => d.status === 'HR_COUNTERSIGNED').length,
              fullyExecuted: localDocs.filter((d) => d.status === 'FULLY_EXECUTED').length,
              drafts: localDocs.filter((d) => d.status === 'DRAFT').length,
              cancelled: localDocs.filter((d) => d.status === 'VOID').length,
              expired: localDocs.filter((d) => d.status === 'EXPIRED').length,
              totalCompensationValue: 0,
              executionRatePercentage: 0,
            },
            recentActivities: [],
            offers: localDocs,
          };
        }
      },
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: true,
      ...options,
    });
  }
}

export class EmploymentOfferQueryService {
  constructor(private readonly getClient?: () => QueryClient) {}

  public useEmploymentOffersQuery(
    options?: Partial<UseQueryOptions<OfferDocument[], Error>>
  ): UseQueryResult<OfferDocument[], Error> {
    return useQuery({
      queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS,
      queryFn: async (): Promise<OfferDocument[]> => {
        try {
          const liveOffers = await EmploymentOfferService.current.getAllOffers();
          if (liveOffers && liveOffers.length > 0) {
            useOfferDocumentStore.getState().setDocuments(liveOffers);
            return liveOffers;
          }
          return useOfferDocumentStore.getState().documents;
        } catch (err) {
          console.warn('Backend EmploymentOffer API unavailable, using local cache:', err);
          return useOfferDocumentStore.getState().documents;
        }
      },
      staleTime: 1000 * 30,
      refetchOnWindowFocus: true,
      ...options,
    });
  }

  public useCreateEmploymentOfferMutation(
    options?: UseMutationOptions<OfferDocument, Error, OfferDocument>
  ): UseMutationResult<OfferDocument, Error, OfferDocument> {
    const queryClient = useQueryClient();

    return useMutation({
      ...options,
      mutationFn: async (offer: OfferDocument): Promise<OfferDocument> => {
        try {
          const persisted = await EmploymentOfferService.current.createOffer(offer);
          useOfferDocumentStore.getState().addDocument(persisted);
          return persisted;
        } catch (err) {
          console.warn('Backend persistence error, saved locally:', err);
          useOfferDocumentStore.getState().addDocument(offer);
          return offer;
        }
      },
      onSuccess: async (...args) => {
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSuccess) {
          (options.onSuccess as (...a: unknown[]) => unknown)(...args);
        }
      },
    });
  }

  public useCandidateSignMutation(
    options?: UseMutationOptions<OfferDocument, Error, { offerId: string; signatureData: string; signMode?: string; updatedHtml?: string }>
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      ...options,
      mutationFn: async (params: { offerId: string; signatureData: string; signMode?: string; updatedHtml?: string }): Promise<OfferDocument> => {
        const updated = await EmploymentOfferService.current.candidateSign(params);
        useOfferDocumentStore.getState().updateDocument(updated);
        return updated;
      },
      onSuccess: async (...args) => {
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSuccess) {
          (options.onSuccess as (...a: unknown[]) => unknown)(...args);
        }
      },
    });
  }

  public useCounterSignMutation(
    options?: UseMutationOptions<OfferDocument, Error, { offerId: string; signatureData: string; signMode?: string; updatedHtml?: string }>
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      ...options,
      mutationFn: async (params: { offerId: string; signatureData: string; signMode?: string; updatedHtml?: string }): Promise<OfferDocument> => {
        const updated = await EmploymentOfferService.current.counterSign(params);
        useOfferDocumentStore.getState().updateDocument(updated);
        return updated;
      },
      onSuccess: async (...args) => {
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSuccess) {
          (options.onSuccess as (...a: unknown[]) => unknown)(...args);
        }
      },
    });
  }

  public useThirdPartySignMutation(
    options?: UseMutationOptions<OfferDocument, Error, { offerId: string; signatureData: string; signMode?: string; updatedHtml?: string }>
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      ...options,
      mutationFn: async (params: { offerId: string; signatureData: string; signMode?: string; updatedHtml?: string }): Promise<OfferDocument> => {
        const updated = await EmploymentOfferService.current.thirdPartySign(params);
        useOfferDocumentStore.getState().updateDocument(updated);
        return updated;
      },
      onSuccess: async (...args) => {
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSuccess) {
          (options.onSuccess as (...a: unknown[]) => unknown)(...args);
        }
      },
    });
  }

  public useDeleteEmploymentOfferMutation(
    options?: UseMutationOptions<string, Error, string>
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      ...options,
      mutationFn: async (offerId: string): Promise<string> => {
        try {
          await EmploymentOfferService.current.deleteOffer(offerId);
        } catch (err) {
          console.warn('Backend delete sync warning:', err);
        }
        useOfferDocumentStore.getState().deleteDocument(offerId);
        return offerId;
      },
      onSuccess: async (...args) => {
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSuccess) {
          (options.onSuccess as (...a: unknown[]) => unknown)(...args);
        }
      },
    });
  }
}

export default class TanstackQueryClientService {
  public static current: TanstackQueryClientService = new TanstackQueryClientService();

  public readonly client: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: true,
        staleTime: 1000 * 30, // 30 seconds
      },
    },
  });

  public readonly authentication: AuthenticationQueryService = new AuthenticationQueryService(() => this.client);
  public readonly dashboardInfoGrab: DashboardInfoGrabQueryService = new DashboardInfoGrabQueryService(() => this.client);
  public readonly employmentOffer: EmploymentOfferQueryService = new EmploymentOfferQueryService(() => this.client);
}
