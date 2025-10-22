import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo, Folder } from '../../worker/types';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  private async request<T>(url: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }
      // Handle cases with no content
      if (response.status === 204) {
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network request failed' };
    }
  }
  async sendMessage(message: string, model?: string, onChunk?: (chunk: string) => void): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: !!onChunk }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          onChunk(decoder.decode(value, { stream: true }));
        }
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to send message' };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    return this.request<ChatState>(`${this.baseUrl}/messages`);
  }
  newSession(): void {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    this.baseUrl = `/api/chat/${sessionId}`;
  }
  // Session Management
  async createSession(title?: string, sessionId?: string, firstMessage?: string): Promise<{ success: boolean; data?: { sessionId: string; title: string }; error?: string }> {
    return this.request('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, sessionId, firstMessage })
    });
  }
  async listSessions(): Promise<{ success: boolean; data?: SessionInfo[]; error?: string }> {
    return this.request('/api/sessions');
  }
  async deleteSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/sessions/${sessionId}`, { method: 'DELETE' });
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/sessions/${sessionId}/title`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
  }
  async moveSessionToFolder(sessionId: string, folderId: string | null): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/sessions/${sessionId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId })
    });
  }
  async toggleSessionPin(sessionId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/sessions/${sessionId}/pin`, { method: 'PUT' });
  }
  // Folder Management
  async listFolders(): Promise<{ success: boolean; data?: Folder[]; error?: string }> {
    return this.request('/api/folders');
  }
  async createFolder(name: string): Promise<{ success: boolean; data?: Folder; error?: string }> {
    return this.request('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
  }
  async renameFolder(folderId: string, name: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
  }
  async deleteFolder(folderId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/folders/${folderId}`, { method: 'DELETE' });
  }
}
export const chatService = new ChatService();