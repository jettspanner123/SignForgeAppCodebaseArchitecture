import ApplicationNetworkAPIConfiguration from '../../../Configurations/ApplicationNetworkAPIConfiguration';
import ApplicationLocalStorageService from '../../../Services/ApplicationLocalStorageService';
import {
  CreateFeatureRequestPayload,
  FeatureRequestResponseModel,
} from '../Models/RequestFeatureModel';

export interface ApiResponseEnvelope<T> {
  Success?: boolean;
  success?: boolean;
  Data?: T;
  data?: T;
  Message?: string;
  message?: string;
  Errors?: string[];
  errors?: string[];
}

export default class RequestFeatureService {
  public static readonly current: RequestFeatureService = new RequestFeatureService();

  private getAuthHeaders(): HeadersInit {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const session = ApplicationLocalStorageService.current.getAuthSession();
    const headers: Record<string, string> = { ...config.headers };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    return headers;
  }

  public async submitFeatureRequest(
    payload: CreateFeatureRequestPayload
  ): Promise<FeatureRequestResponseModel> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.requestFeature.create;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        Title: payload.title,
        FeatureType: payload.featureType,
        Description: payload.description,
        title: payload.title,
        featureType: payload.featureType,
        description: payload.description,
      }),
    });

    const envelope: ApiResponseEnvelope<any> = await response.json();
    const data = envelope.Data || envelope.data;

    if (!response.ok || !data) {
      const errorMsg =
        envelope.Message ||
        envelope.message ||
        (envelope.Errors && envelope.Errors.length > 0 ? envelope.Errors[0] : null) ||
        (envelope.errors && envelope.errors.length > 0 ? envelope.errors[0] : null) ||
        'Failed to submit feature request.';
      throw new Error(errorMsg);
    }

    return {
      id: data.id || data.Id || '',
      requesterUserId: data.requesterUserId || data.RequesterUserId || '',
      targetUserId: data.targetUserId || data.TargetUserId || '',
      title: data.title || data.Title || '',
      featureType: data.featureType || data.FeatureType || '',
      description: data.description || data.Description || '',
      status: data.status || data.Status || 'PENDING',
      createdBy: data.createdBy || data.CreatedBy || '',
      createdAt: data.createdAt || data.CreatedAt || '',
      updatedAt: data.updatedAt || data.UpdatedAt || '',
    };
  }

  public async fetchAllFeatureRequests(): Promise<FeatureRequestResponseModel[]> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.requestFeature.getAll;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feature requests: ${response.statusText}`);
    }

    const payload: ApiResponseEnvelope<FeatureRequestResponseModel[]> = await response.json();
    return payload.Data || payload.data || [];
  }
}
