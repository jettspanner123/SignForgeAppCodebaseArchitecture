import ApplicationNetworkAPIConfiguration from '../Configurations/ApplicationNetworkAPIConfiguration';
import ApplicationLocalStorageService from './ApplicationLocalStorageService';

export interface ConfigurationConstantDTO {
  id: string;
  configurationKey: string;
  configurationValue: string;
  description?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export default class ConfigurationConstantService {
  public static current: ConfigurationConstantService = new ConfigurationConstantService();

  private getAuthHeaders(): HeadersInit {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const token = ApplicationLocalStorageService.current.getAccessToken();
    const headers: Record<string, string> = {
      ...config.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public async getAllConstants(): Promise<ConfigurationConstantDTO[]> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const response = await fetch(config.endpoints.configurationConstant.getAll, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch configuration constants (HTTP ${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
  }

  public async getConstantByKey(key: string): Promise<ConfigurationConstantDTO> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const response = await fetch(config.endpoints.configurationConstant.getByKey(key), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch configuration constant '${key}' (HTTP ${response.status})`);
    }

    const json = await response.json();
    return json.data;
  }

  public async getWorkLocations(): Promise<string[]> {
    const dto = await this.getConstantByKey('WORK_LOCATIONS');
    if (dto && dto.configurationValue) {
      const parsed = JSON.parse(dto.configurationValue);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  }

  public async getDesignations(): Promise<Record<string, string[]>> {
    const dto = await this.getConstantByKey('EMPLOYEE_DESIGNATIONS');
    if (dto && dto.configurationValue) {
      const parsed = JSON.parse(dto.configurationValue);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, string[]>;
      }
    }
    return {};
  }

  public async addDesignation(department: string, designation: string): Promise<Record<string, string[]>> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const response = await fetch(config.endpoints.configurationConstant.addDesignation, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        department: department.trim(),
        designation: designation.trim(),
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const msg = errorJson?.message || `Failed to add designation (HTTP ${response.status})`;
      throw new Error(msg);
    }

    const json = await response.json();
    const dto: ConfigurationConstantDTO = json.data;
    if (dto && dto.configurationValue) {
      try {
        const parsed = JSON.parse(dto.configurationValue);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, string[]>;
        }
      } catch {
        // Fallback
      }
    }

    return await this.getDesignations();
  }

  public async addDepartment(department: string): Promise<Record<string, string[]>> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const response = await fetch(config.endpoints.configurationConstant.addDepartment, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        department: department.trim(),
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const msg = errorJson?.message || `Failed to add department (HTTP ${response.status})`;
      throw new Error(msg);
    }

    const json = await response.json();
    const dto: ConfigurationConstantDTO = json.data;
    if (dto && dto.configurationValue) {
      try {
        const parsed = JSON.parse(dto.configurationValue);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, string[]>;
        }
      } catch {
        // Fallback
      }
    }

    return await this.getDesignations();
  }

  public async addWorkLocation(location: string): Promise<string[]> {
    const config = ApplicationNetworkAPIConfiguration.current.getConfiguration();
    const response = await fetch(config.endpoints.configurationConstant.addWorkLocation, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        location: location.trim(),
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const msg = errorJson?.message || `Failed to add work location (HTTP ${response.status})`;
      throw new Error(msg);
    }

    const json = await response.json();
    const dto: ConfigurationConstantDTO = json.data;
    if (dto && dto.configurationValue) {
      try {
        const parsed = JSON.parse(dto.configurationValue);
        if (Array.isArray(parsed)) {
          return parsed as string[];
        }
      } catch {
        // Fallback
      }
    }

    return await this.getWorkLocations();
  }
}
