import ApplicationNetworkAPIConfiguration from '../Configurations/ApplicationNetworkAPIConfiguration';
import ApplicationLocalStorageService from './ApplicationLocalStorageService';

export interface ConfigurationConstantDTO {
  id?: string;
  Id?: string;
  configurationKey?: string;
  ConfigurationKey?: string;
  configurationValue?: string;
  ConfigurationValue?: string;
  description?: string | null;
  Description?: string | null;
  notes?: string | null;
  Notes?: string | null;
  isActive?: boolean;
  Active?: boolean;
  createdBy?: string;
  CreatedBy?: string;
  updatedBy?: string | null;
  UpdatedBy?: string | null;
  createdAt?: string;
  CreatedAt?: string;
  updatedAt?: string | null;
  UpdatedAt?: string | null;
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
    return (json.data || json.Data || json) as ConfigurationConstantDTO[];
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
    return (json.data || json.Data || json) as ConfigurationConstantDTO;
  }

  public async getWorkLocations(): Promise<string[]> {
    const dto = await this.getConstantByKey('WORK_LOCATIONS');
    const rawVal = dto?.configurationValue || dto?.ConfigurationValue;
    if (rawVal) {
      try {
        const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(parsed)) {
          return parsed.map((item: unknown) => String(item).trim()).filter(Boolean);
        }
      } catch (err) {
        console.error('Failed to parse WORK_LOCATIONS JSON:', err);
      }
    }
    return [];
  }

  public async getDesignations(): Promise<Record<string, string[]>> {
    const dto = await this.getConstantByKey('EMPLOYEE_DESIGNATIONS');
    const rawVal = dto?.configurationValue || dto?.ConfigurationValue;
    if (rawVal) {
      try {
        const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, string[]>;
        }
      } catch (err) {
        console.error('Failed to parse EMPLOYEE_DESIGNATIONS JSON:', err);
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
      const msg = errorJson?.message || errorJson?.Message || `Failed to add designation (HTTP ${response.status})`;
      throw new Error(msg);
    }

    const json = await response.json();
    const dto: ConfigurationConstantDTO = json.data || json.Data || json;
    const rawVal = dto?.configurationValue || dto?.ConfigurationValue;
    if (rawVal) {
      try {
        const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
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
      const msg = errorJson?.message || errorJson?.Message || `Failed to add department (HTTP ${response.status})`;
      throw new Error(msg);
    }

    const json = await response.json();
    const dto: ConfigurationConstantDTO = json.data || json.Data || json;
    const rawVal = dto?.configurationValue || dto?.ConfigurationValue;
    if (rawVal) {
      try {
        const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
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
      const msg = errorJson?.message || errorJson?.Message || `Failed to add work location (HTTP ${response.status})`;
      throw new Error(msg);
    }

    const json = await response.json();
    const dto: ConfigurationConstantDTO = json.data || json.Data || json;
    const rawVal = dto?.configurationValue || dto?.ConfigurationValue;
    if (rawVal) {
      try {
        const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(parsed)) {
          return (parsed as unknown[]).map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Fallback
      }
    }

    return await this.getWorkLocations();
  }
}
