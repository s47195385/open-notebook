import axios, { AxiosInstance } from 'axios';
import * as vscode from 'vscode';

/**
 * API client for Open Notebook backend
 * Adapted from frontend/src/lib/api/client.ts
 * 
 * Timeout set to 10 minutes to accommodate slow LLM operations
 * especially on local models via Ollama
 */
export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    const config = vscode.workspace.getConfiguration('openNotebook');
    this.baseURL = config.get('apiUrl') || 'http://localhost:5055';

    this.client = axios.create({
      baseURL: `${this.baseURL}/api`,
      timeout: 600000, // 10 minutes
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(
      async (config) => {
        // Note: Auth token storage will be implemented when needed
        // For now, assuming no auth or will add later
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          vscode.window.showErrorMessage('Open Notebook: Authentication failed');
        } else if (error.response?.status === 404) {
          vscode.window.showErrorMessage('Open Notebook: Resource not found');
        } else if (error.code === 'ECONNREFUSED') {
          vscode.window.showErrorMessage(
            'Open Notebook: Cannot connect to API. Make sure services are running.'
          );
        } else if (error.message?.includes('timeout')) {
          vscode.window.showErrorMessage(
            'Open Notebook: Request timed out. The operation may still be processing.'
          );
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Update the base URL when settings change
   */
  updateBaseURL(url: string): void {
    this.baseURL = url;
    this.client.defaults.baseURL = `${url}/api`;
  }

  /**
   * Get the axios instance for direct use
   */
  getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Check if the API is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get API configuration
   */
  async getConfig(): Promise<any> {
    try {
      const response = await this.client.get('/config');
      return response.data;
    } catch (error) {
      console.error('Failed to get API config:', error);
      return null;
    }
  }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient();
  }
  return apiClientInstance;
}

export function resetApiClient(): void {
  apiClientInstance = null;
}
