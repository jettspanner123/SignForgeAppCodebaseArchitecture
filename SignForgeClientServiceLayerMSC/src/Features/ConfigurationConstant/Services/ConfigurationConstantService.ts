import ApplicationNetworkAPIConfiguration from '../../../Configurations/ApplicationNetworkAPIConfiguration';
import ApplicationLocalStorageService from '../../../Services/ApplicationLocalStorageService';
import ConfigurationConstantInterfaceModel from '../../../Models/ConfigurationConstantInterfaceModel';

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

export default class ConfigurationConstantService {
  public static readonly current = new ConfigurationConstantService();

  private getAuthHeaders(): HeadersInit {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const session = ApplicationLocalStorageService.current.getAuthSession();
    const headers: Record<string, string> = { ...config.headers };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    return headers;
  }

  public async getAllConfigurations(): Promise<ConfigurationConstantInterfaceModel[]> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.configurationConstant.getAll;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve configuration constants: ${response.statusText}`);
    }

    const payload: ApiResponseEnvelope<ConfigurationConstantInterfaceModel[]> = await response.json();
    return payload.Data || payload.data || [];
  }

  public async getConfigurationByKey(key: string): Promise<ConfigurationConstantInterfaceModel> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.configurationConstant.getByKey(key);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve configuration constant for key: ${key}`);
    }

    const payload: ApiResponseEnvelope<ConfigurationConstantInterfaceModel> = await response.json();
    const data = payload.Data || payload.data;
    if (!data) {
      throw new Error(`Configuration constant for key "${key}" not found.`);
    }
    return data;
  }

  public async updateConfiguration(
    key: string,
    value: string,
    description?: string,
    isActive?: boolean
  ): Promise<ConfigurationConstantInterfaceModel> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const endpoint = config.endpoints.configurationConstant.update(key);

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ConfigurationValue: value,
        Description: description,
        IsActive: isActive,
      }),
    });

    const payload: ApiResponseEnvelope<ConfigurationConstantInterfaceModel> = await response.json();
    const data = payload.Data || payload.data;
    if (!response.ok || !data) {
      throw new Error(payload.Message || payload.message || 'Failed to update configuration constant.');
    }
    return data;
  }
}
