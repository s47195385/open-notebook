import { getApiClient } from './client';
import { Settings } from './types';

/**
 * API methods for settings operations
 * Adapted from frontend/src/lib/api/settings.ts
 */
export const settingsApi = {
  /**
   * Get current settings
   */
  async get(): Promise<Settings> {
    const client = getApiClient().getClient();
    const response = await client.get<Settings>('/settings');
    return response.data;
  },

  /**
   * Update settings
   */
  async update(data: Partial<Settings>): Promise<Settings> {
    const client = getApiClient().getClient();
    const response = await client.put<Settings>('/settings', data);
    return response.data;
  },

  /**
   * Get available LLM providers
   */
  async getProviders(): Promise<string[]> {
    const client = getApiClient().getClient();
    const response = await client.get<string[]>('/settings/providers');
    return response.data;
  },

  /**
   * Get available models for a provider
   */
  async getModels(provider: string): Promise<string[]> {
    const client = getApiClient().getClient();
    const response = await client.get<string[]>(`/settings/providers/${provider}/models`);
    return response.data;
  },
};
