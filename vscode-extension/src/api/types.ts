/**
 * Type definitions for Open Notebook API
 * Adapted from frontend types
 */

// Notebook types
export interface Notebook {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  archived?: boolean;
}

export interface CreateNotebookRequest {
  name: string;
  description?: string;
}

export interface UpdateNotebookRequest {
  name?: string;
  description?: string;
  archived?: boolean;
}

// Source types
export interface Source {
  id: string;
  notebook_id: string;
  title: string;
  source_type: string;
  content?: string;
  file_path?: string;
  url?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface CreateSourceRequest {
  notebook_id: string;
  title: string;
  source_type: string;
  content?: string;
  file_path?: string;
  url?: string;
  metadata?: Record<string, any>;
}

// Chat types
export interface ChatSession {
  id: string;
  notebook_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface CreateChatSessionRequest {
  notebook_id: string;
  name?: string;
}

export interface SendMessageRequest {
  session_id: string;
  message: string;
  context?: {
    sources?: string[];
    notes?: string[];
    include_all?: boolean;
  };
}

export interface SendMessageResponse {
  session_id: string;
  messages: ChatMessage[];
}

export interface BuildContextRequest {
  notebook_id: string;
  sources?: string[];
  notes?: string[];
  include_all?: boolean;
}

export interface BuildContextResponse {
  context: string;
  sources_count: number;
  notes_count: number;
}

// Settings types
export interface Settings {
  llm_provider?: string;
  llm_model?: string;
  embedding_provider?: string;
  embedding_model?: string;
  temperature?: number;
  max_tokens?: number;
  [key: string]: any;
}

// Note types
export interface Note {
  id: string;
  notebook_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface CreateNoteRequest {
  notebook_id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

// Health check
export interface HealthResponse {
  status: 'ok' | 'error';
  version?: string;
  timestamp?: string;
}

// API Config
export interface ApiConfig {
  api_url: string;
  version: string;
  features: string[];
}
