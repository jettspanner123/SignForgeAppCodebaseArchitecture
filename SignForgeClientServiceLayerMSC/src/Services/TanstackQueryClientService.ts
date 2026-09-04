import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { LoginCredentials, LoginAuthState } from '../Features/LoginScreen/Models/LoginScreenModel';
import LoginScreenService from '../Features/LoginScreen/Services/LoginScreenService';

export class AuthenticationQueryService {
  constructor(private readonly getClient?: () => QueryClient) {}

  // Login Mutations
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

export default class TanstackQueryClientService {
  public static current: TanstackQueryClientService = new TanstackQueryClientService();

  public readonly client: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  });

  public readonly authentication: AuthenticationQueryService = new AuthenticationQueryService(() => this.client);
}
