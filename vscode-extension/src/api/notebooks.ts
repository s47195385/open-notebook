import { getApiClient } from './client';
import {
  Notebook,
  CreateNotebookRequest,
  UpdateNotebookRequest,
} from './types';

/**
 * API methods for notebook operations
 * Adapted from frontend/src/lib/api/notebooks.ts
 */
export const notebooksApi = {
  /**
   * List all notebooks
   */
  async list(params?: { archived?: boolean; order_by?: string }): Promise<Notebook[]> {
    const client = getApiClient().getClient();
    const response = await client.get<Notebook[]>('/notebooks', { params });
    return response.data;
  },

  /**
   * Get a single notebook by ID
   */
  async get(id: string): Promise<Notebook> {
    const client = getApiClient().getClient();
    const response = await client.get<Notebook>(`/notebooks/${id}`);
    return response.data;
  },

  /**
   * Create a new notebook
   */
  async create(data: CreateNotebookRequest): Promise<Notebook> {
    const client = getApiClient().getClient();
    const response = await client.post<Notebook>('/notebooks', data);
    return response.data;
  },

  /**
   * Update an existing notebook
   */
  async update(id: string, data: UpdateNotebookRequest): Promise<Notebook> {
    const client = getApiClient().getClient();
    const response = await client.put<Notebook>(`/notebooks/${id}`, data);
    return response.data;
  },

  /**
   * Delete a notebook
   */
  async delete(id: string): Promise<void> {
    const client = getApiClient().getClient();
    await client.delete(`/notebooks/${id}`);
  },

  /**
   * Add a source to a notebook
   */
  async addSource(notebookId: string, sourceId: string): Promise<void> {
    const client = getApiClient().getClient();
    await client.post(`/notebooks/${notebookId}/sources/${sourceId}`);
  },

  /**
   * Remove a source from a notebook
   */
  async removeSource(notebookId: string, sourceId: string): Promise<void> {
    const client = getApiClient().getClient();
    await client.delete(`/notebooks/${notebookId}/sources/${sourceId}`);
  },
};
