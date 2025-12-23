import { getApiClient } from './client';
import {
  ChatSession,
  ChatSessionWithMessages,
  CreateChatSessionRequest,
  SendMessageRequest,
  SendMessageResponse,
  BuildContextRequest,
  BuildContextResponse,
} from './types';

/**
 * API methods for chat operations
 * Adapted from frontend/src/lib/api/chat.ts
 */
export const chatApi = {
  /**
   * List all chat sessions for a notebook
   */
  async listSessions(notebookId: string): Promise<ChatSession[]> {
    const client = getApiClient().getClient();
    const response = await client.get<ChatSession[]>('/chat/sessions', {
      params: { notebook_id: notebookId },
    });
    return response.data;
  },

  /**
   * Create a new chat session
   */
  async createSession(data: CreateChatSessionRequest): Promise<ChatSession> {
    const client = getApiClient().getClient();
    const response = await client.post<ChatSession>('/chat/sessions', data);
    return response.data;
  },

  /**
   * Get a single chat session with messages
   */
  async getSession(sessionId: string): Promise<ChatSessionWithMessages> {
    const client = getApiClient().getClient();
    const response = await client.get<ChatSessionWithMessages>(
      `/chat/sessions/${sessionId}`
    );
    return response.data;
  },

  /**
   * Update a chat session
   */
  async updateSession(
    sessionId: string,
    data: { name?: string }
  ): Promise<ChatSession> {
    const client = getApiClient().getClient();
    const response = await client.put<ChatSession>(
      `/chat/sessions/${sessionId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const client = getApiClient().getClient();
    await client.delete(`/chat/sessions/${sessionId}`);
  },

  /**
   * Send a message in a chat session
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const client = getApiClient().getClient();
    const response = await client.post<SendMessageResponse>('/chat/execute', data);
    return response.data;
  },

  /**
   * Build context for a chat session
   */
  async buildContext(data: BuildContextRequest): Promise<BuildContextResponse> {
    const client = getApiClient().getClient();
    const response = await client.post<BuildContextResponse>('/chat/context', data);
    return response.data;
  },
};
