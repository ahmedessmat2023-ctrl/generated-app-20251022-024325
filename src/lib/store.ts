import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { chatService } from './chat';
import type { SessionInfo, Message, Folder } from '../../worker/types';
import { settingsManager, type Settings } from './settings';
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  streamingMessage: string;
  isProcessing: boolean;
  error?: string;
}
type DialogType = 'rename' | 'delete';
interface DialogContext {
  sessionId?: string;
  folderId?: string;
}
export interface AppState {
  sessions: SessionInfo[];
  folders: Folder[];
  activeSessionId: string | null;
  currentChat: ChatSession | null;
  isSidebarOpen: boolean;
  settings: Settings;
  searchQuery: string;
  dialogState: {
    type: DialogType | null;
    context: DialogContext;
  };
}
export interface AppActions {
  initialize: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  setActiveSession: (sessionId: string) => Promise<void>;
  createNewSession: (folderId?: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSettings: (settings: Partial<Settings>) => void;
  setSearchQuery: (query: string) => void;
  renameSession: (sessionId: string, newTitle: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  toggleSessionPin: (sessionId: string) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  moveSessionToFolder: (sessionId: string, folderId: string | null) => Promise<void>;
  openDialog: (type: DialogType, context: DialogContext) => void;
  closeDialog: () => void;
}
const useStore = create<AppState & AppActions>()(
  immer((set, get) => ({
    sessions: [],
    folders: [],
    activeSessionId: null,
    currentChat: null,
    isSidebarOpen: true,
    settings: settingsManager.loadSettings(),
    searchQuery: '',
    dialogState: {
      type: null,
      context: {},
    },
    initialize: async () => {
      set({ settings: settingsManager.loadSettings() });
      await Promise.all([get().fetchSessions(), get().fetchFolders()]);
      const sessions = get().sessions;
      if (sessions.length > 0) {
        await get().setActiveSession(sessions[0].id);
      } else {
        await get().createNewSession();
      }
    },
    fetchSessions: async () => {
      const res = await chatService.listSessions();
      if (res.success && res.data) set({ sessions: res.data });
    },
    fetchFolders: async () => {
      const res = await chatService.listFolders();
      if (res.success && res.data) set({ folders: res.data });
    },
    setActiveSession: async (sessionId: string) => {
      if (get().activeSessionId === sessionId && get().currentChat) return;
      chatService.switchSession(sessionId);
      set({ activeSessionId: sessionId, currentChat: { id: sessionId, title: '', messages: [], streamingMessage: '', isProcessing: true } });
      const res = await chatService.getMessages();
      if (res.success && res.data) {
        const sessionInfo = get().sessions.find(s => s.id === sessionId);
        set(state => {
          if (state.currentChat?.id === sessionId) {
            state.currentChat.messages = res.data?.messages || [];
            state.currentChat.isProcessing = res.data?.isProcessing || false;
            state.currentChat.title = sessionInfo?.title || 'New Chat';
          }
        });
      } else {
        set(state => {
          if (state.currentChat?.id === sessionId) {
            state.currentChat.isProcessing = false;
            state.currentChat.error = 'Failed to load session.';
          }
        });
      }
    },
    createNewSession: async (folderId) => {
      const newSessionId = crypto.randomUUID();
      chatService.switchSession(newSessionId);
      const newSessionInfo: SessionInfo = {
        id: newSessionId,
        title: 'New Chat',
        createdAt: Date.now(),
        lastActive: Date.now(),
        folderId: folderId || null,
        isPinned: false,
      };
      set(state => {
        state.activeSessionId = newSessionId;
        state.currentChat = { id: newSessionId, title: 'New Chat', messages: [], streamingMessage: '', isProcessing: false };
        state.sessions.unshift(newSessionInfo);
      });
      if (folderId) {
        await chatService.moveSessionToFolder(newSessionId, folderId);
      }
    },
    sendMessage: async (message: string) => {
      const activeSessionId = get().activeSessionId;
      if (!activeSessionId || !message.trim()) return;
      const isNewSession = get().currentChat?.messages.length === 0;
      const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: message, timestamp: Date.now() };
      set(state => {
        if (state.currentChat) {
          state.currentChat.messages.push(userMessage);
          state.currentChat.isProcessing = true;
          state.currentChat.streamingMessage = '';
        }
      });
      if (isNewSession) {
        const res = await chatService.createSession('New Chat', activeSessionId, message);
        if (res.success && res.data) {
          set(state => {
            const session = state.sessions.find(s => s.id === res.data?.sessionId);
            if (session) session.title = res.data.title;
            if (state.currentChat) state.currentChat.title = res.data.title;
          });
        }
      }
      await chatService.sendMessage(message, get().settings.defaultTextModel, (chunk) => {
        set(state => {
          if (state.currentChat) state.currentChat.streamingMessage += chunk;
        });
      });
      const res = await chatService.getMessages();
      if (res.success && res.data) {
        set(state => {
          if (state.currentChat) {
            state.currentChat.messages = res.data?.messages || [];
            state.currentChat.isProcessing = false;
            state.currentChat.streamingMessage = '';
          }
        });
        await get().fetchSessions();
      } else {
        set(state => {
          if (state.currentChat) {
            state.currentChat.isProcessing = false;
            state.currentChat.error = 'Failed to get response.';
          }
        });
      }
    },
    toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
    setSettings: (settings: Partial<Settings>) => {
      const newSettings = settingsManager.saveSettings(settings);
      set({ settings: newSettings });
    },
    setSearchQuery: (query: string) => set({ searchQuery: query }),
    renameSession: async (sessionId: string, newTitle: string) => {
      set(state => {
        const session = state.sessions.find(s => s.id === sessionId);
        if (session) session.title = newTitle;
        if (state.activeSessionId === sessionId && state.currentChat) {
          state.currentChat.title = newTitle;
        }
      });
      await chatService.updateSessionTitle(sessionId, newTitle);
    },
    deleteSession: async (sessionId: string) => {
      const wasActive = get().activeSessionId === sessionId;
      const originalSessions = get().sessions;
      set(state => {
        state.sessions = state.sessions.filter(s => s.id !== sessionId);
      });
      const res = await chatService.deleteSession(sessionId);
      if (!res.success) {
        set({ sessions: originalSessions });
        return;
      }
      if (wasActive) {
        const remainingSessions = get().sessions;
        if (remainingSessions.length > 0) {
          await get().setActiveSession(remainingSessions[0].id);
        } else {
          await get().createNewSession();
        }
      }
    },
    toggleSessionPin: async (sessionId: string) => {
        const originalSessions = get().sessions;
        set(state => {
            const session = state.sessions.find(s => s.id === sessionId);
            if (session) {
                session.isPinned = !session.isPinned;
            }
        });
        const res = await chatService.toggleSessionPin(sessionId);
        if (!res.success) {
            set({ sessions: originalSessions });
        }
    },
    createFolder: async (name: string) => {
        const res = await chatService.createFolder(name);
        if (res.success && res.data) {
            set(state => {
                state.folders.push(res.data!);
            });
        }
    },
    renameFolder: async (folderId: string, newName: string) => {
        set(state => {
            const folder = state.folders.find(f => f.id === folderId);
            if (folder) folder.name = newName;
        });
        await chatService.renameFolder(folderId, newName);
    },
    deleteFolder: async (folderId: string) => {
        set(state => {
            state.folders = state.folders.filter(f => f.id !== folderId);
            state.sessions.forEach(s => {
                if (s.folderId === folderId) s.folderId = null;
            });
        });
        await chatService.deleteFolder(folderId);
    },
    moveSessionToFolder: async (sessionId: string, folderId: string | null) => {
        set(state => {
            const session = state.sessions.find(s => s.id === sessionId);
            if (session) session.folderId = folderId;
        });
        await chatService.moveSessionToFolder(sessionId, folderId);
    },
    openDialog: (type, context) => {
      set({ dialogState: { type, context } });
    },
    closeDialog: () => {
      set({ dialogState: { type: null, context: {} } });
    },
  }))
);
export default useStore;