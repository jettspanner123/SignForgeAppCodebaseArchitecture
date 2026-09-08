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
          if (result) {
            useOfferDocumentStore.getState().setDocuments(result.offers || []);
            if (result.configurationConstants) {
              useOfferDocumentStore.getState().setConfigurationConstants(result.configurationConstants);
            }
          }
          return result;
        } catch (err) {
          console.warn('Backend DashboardInfoGrab API unavailable:', err);
          return {
            metrics: {
              totalPipeline: 0,
              awaitingCandidate: 0,
              awaitingCountersign: 0,
              awaitingThirdPartySign: 0,
              fullyExecuted: 0,
              drafts: 0,
              cancelled: 0,
              expired: 0,
              totalCompensationValue: 0,
              executionRatePercentage: 0,
            },
            recentActivities: [],
            offers: [],
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
          const offers = liveOffers || [];
          useOfferDocumentStore.getState().setDocuments(offers);
          return offers;
        } catch (err) {
          console.warn('Backend EmploymentOffer API unavailable:', err);
          return [];
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
        const persisted = await EmploymentOfferService.current.createOffer(offer);
        useOfferDocumentStore.getState().addDocument(persisted);
        return persisted;
      },
      onSuccess: async (persisted, ...args) => {
        queryClient.setQueryData<DashboardInfoGrabResponseInterfaceModel>(
          TanstackQueryKeysCON.DASHBOARD_INFO_GRAB,
          (old) => {
            if (!old) return old;
            const existingOffers = old.offers || [];
            return {
              ...old,
              offers: [persisted, ...existingOffers.filter((o) => o.id !== persisted.id)],
              metrics: old.metrics
                ? {
                    ...old.metrics,
                    totalPipeline: old.metrics.totalPipeline + 1,
                  }
                : old.metrics,
            };
          }
        );
        queryClient.setQueryData<OfferDocument[]>(
          TanstackQueryKeysCON.EMPLOYMENT_OFFERS,
          (old) => {
            if (!old) return [persisted];
            return [persisted, ...old.filter((o) => o.id !== persisted.id)];
          }
        );
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSuccess) {
          (options.onSuccess as (...a: unknown[]) => unknown)(persisted, ...args);
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
      onSuccess: async (updated, ...args) => {
        queryClient.setQueryData<DashboardInfoGrabResponseInterfaceModel>(
          TanstackQueryKeysCON.DASHBOARD_INFO_GRAB,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              offers: (old.offers || []).map((o) => (o.id === updated.id ? updated : o)),
            };
          }
        );
        queryClient.setQueryData<OfferDocument[]>(
          TanstackQueryKeysCON.EMPLOYMENT_OFFERS,
          (old) => (old || []).map((o) => (o.id === updated.id ? updated : o))
        );
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSuccess) {
          (options.onSuccess as (...a: unknown[]) => unknown)(updated, ...args);
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
      onSuccess: async (updated, ...args) => {
        queryClient.setQueryData<DashboardInfoGrabResponseInterfaceModel>(
          TanstackQueryKeysCON.DASHBOARD_INFO_GRAB,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              offers: (old.offers || []).map((o) => (o.id === updated.id ? updated : o)),
            };
          }
        );
        queryClient.setQueryData<OfferDocument[]>(
          TanstackQueryKeysCON.EMPLOYMENT_OFFERS,
          (old) => (old || []).map((o) => (o.id === updated.id ? updated : o))
        );
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSuccess) {
          (options.onSuccess as (...a: unknown[]) => unknown)(updated, ...args);
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
      onSuccess: async (updated, ...args) => {
        queryClient.setQueryData<DashboardInfoGrabResponseInterfaceModel>(
          TanstackQueryKeysCON.DASHBOARD_INFO_GRAB,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              offers: (old.offers || []).map((o) => (o.id === updated.id ? updated : o)),
            };
          }
        );
        queryClient.setQueryData<OfferDocument[]>(
          TanstackQueryKeysCON.EMPLOYMENT_OFFERS,
          (old) => (old || []).map((o) => (o.id === updated.id ? updated : o))
        );
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSuccess) {
          (options.onSuccess as (...a: unknown[]) => unknown)(updated, ...args);
        }
      },
    });
  }

  public useDeleteEmploymentOfferMutation(
    options?: UseMutationOptions<string, Error, string, { previousDashboard?: DashboardInfoGrabResponseInterfaceModel; previousOffers?: OfferDocument[] }>
  ) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (offerId: string): Promise<string> => {
        try {
          await EmploymentOfferService.current.deleteOffer(offerId);
        } catch (err) {
          console.warn('Backend delete sync warning:', err);
        }
        return offerId;
      },
      onMutate: async (offerId: string) => {
        // Cancel outgoing queries so they don't overwrite optimistic update
        await queryClient.cancelQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.cancelQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });

        const previousDashboard = queryClient.getQueryData<DashboardInfoGrabResponseInterfaceModel>(
          TanstackQueryKeysCON.DASHBOARD_INFO_GRAB
        );
        const previousOffers = queryClient.getQueryData<OfferDocument[]>(
          TanstackQueryKeysCON.EMPLOYMENT_OFFERS
        );

        // Optimistically remove from dashboard data immediately (0ms latency in UI)
        if (previousDashboard) {
          const remainingOffers = (previousDashboard.offers || []).filter((o) => o.id !== offerId);
          queryClient.setQueryData<DashboardInfoGrabResponseInterfaceModel>(
            TanstackQueryKeysCON.DASHBOARD_INFO_GRAB,
            {
              ...previousDashboard,
              offers: remainingOffers,
              metrics: previousDashboard.metrics
                ? {
                    ...previousDashboard.metrics,
                    totalPipeline: Math.max(0, previousDashboard.metrics.totalPipeline - 1),
                  }
                : previousDashboard.metrics,
            }
          );
        }

        // Optimistically remove from offers data
        if (previousOffers) {
          queryClient.setQueryData<OfferDocument[]>(
            TanstackQueryKeysCON.EMPLOYMENT_OFFERS,
            previousOffers.filter((o) => o.id !== offerId)
          );
        }

        // Optimistically remove from client state
        useOfferDocumentStore.getState().deleteDocument(offerId);

        if (options?.onMutate) {
          await options.onMutate(offerId);
        }

        return { previousDashboard, previousOffers };
      },
      onError: (err, offerId, context) => {
        if (context?.previousDashboard) {
          queryClient.setQueryData(
            TanstackQueryKeysCON.DASHBOARD_INFO_GRAB,
            context.previousDashboard
          );
        }
        if (context?.previousOffers) {
          queryClient.setQueryData(
            TanstackQueryKeysCON.EMPLOYMENT_OFFERS,
            context.previousOffers
          );
        }
        if (options?.onError) {
          options.onError(err, offerId, context);
        }
      },
      onSettled: async (data, error, variables, context) => {
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.DASHBOARD_INFO_GRAB });
        await queryClient.invalidateQueries({ queryKey: TanstackQueryKeysCON.EMPLOYMENT_OFFERS });
        if (options?.onSettled) {
          options.onSettled(data, error, variables, context);
        }
      },
      ...options,
    });
  }
}

export class ConfigurationConstantQueryService {
  constructor(private readonly getClient?: () => QueryClient) {}

  public useConfigurationConstantsQuery(
    options?: Partial<UseQueryOptions<import('../Models/ConfigurationConstantInterfaceModel').default[], Error>>
  ) {
    return useQuery({
      queryKey: TanstackQueryKeysCON.CONFIGURATION_CONSTANTS,
      queryFn: async () => {
        const ConfigurationConstantService = (await import('../Features/ConfigurationConstant/Services/ConfigurationConstantService')).default;
        const list = await ConfigurationConstantService.current.getAllConfigurations();
        const map: Record<string, string> = {};
        list.forEach((item) => {
          map[item.configurationKey] = item.configurationValue;
        });
        useOfferDocumentStore.getState().setConfigurationConstants(map);
        return list;
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnWindowFocus: false,
      ...options,
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
  public readonly configurationConstant: ConfigurationConstantQueryService = new ConfigurationConstantQueryService(() => this.client);
}
