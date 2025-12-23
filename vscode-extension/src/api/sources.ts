import { getApiClient } from './client';
import { Source, CreateSourceRequest } from './types';

/**
 * API methods for source operations
 * Adapted from frontend/src/lib/api/sources.ts
 */
export const sourcesApi = {
  /**
   * List sources for a notebook
   */
  async list(notebookId: string): Promise<Source[]> {
    const client = getApiClient().getClient();
    const response = await client.get<Source[]>('/sources', {
      params: { notebook_id: notebookId },
    });
    return response.data;
  },

  /**
   * Get a single source
   */
  async get(id: string): Promise<Source> {
    const client = getApiClient().getClient();
    const response = await client.get<Source>(`/sources/${id}`);
    return response.data;
  },

  /**
   * Create a new source
   */
  async create(data: CreateSourceRequest): Promise<Source> {
    const client = getApiClient().getClient();
    const response = await client.post<Source>('/sources', data);
    return response.data;
  },

  /**
   * Update a source
   */
  async update(id: string, data: Partial<CreateSourceRequest>): Promise<Source> {
    const client = getApiClient().getClient();
    const response = await client.put<Source>(`/sources/${id}`, data);
    return response.data;
  },

  /**
   * Delete a source
   */
  async delete(id: string): Promise<void> {
    const client = getApiClient().getClient();
    await client.delete(`/sources/${id}`);
  },

  /**
   * Upload a file as a source
   */
  async uploadFile(notebookId: string, file: Buffer, filename: string): Promise<Source> {
    const client = getApiClient().getClient();
    const formData = new FormData();
    formData.append('file', new Blob([file]), filename);
    formData.append('notebook_id', notebookId);

    const response = await client.post<Source>('/sources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
