import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, Folder } from './types';
import type { Env } from './core-utils';
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private folders = new Map<string, Folder>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const data = await this.ctx.storage.get<{ sessions?: Record<string, SessionInfo>, folders?: Record<string, Folder> }>('data') || {};
      this.sessions = new Map(Object.entries(data.sessions || {}));
      this.folders = new Map(Object.entries(data.folders || {}));
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put('data', {
        sessions: Object.fromEntries(this.sessions),
        folders: Object.fromEntries(this.folders)
    });
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now,
      folderId: null,
      isPinned: false,
    });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persist();
      return true;
    }
    return false;
  }
  async moveSessionToFolder(sessionId: string, folderId: string | null): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (folderId && !this.folders.has(folderId)) {
        return false; // Folder does not exist
    }
    if (session) {
        session.folderId = folderId;
        await this.persist();
        return true;
    }
    return false;
  }
  async toggleSessionPin(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
        session.isPinned = !session.isPinned;
        await this.persist();
        return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persist();
    return count;
  }
  // Folder Management
  async addFolder(name: string): Promise<Folder> {
    await this.ensureLoaded();
    const newFolder: Folder = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
    };
    this.folders.set(newFolder.id, newFolder);
    await this.persist();
    return newFolder;
  }
  async removeFolder(folderId: string): Promise<boolean> {
    await this.ensureLoaded();
    if (!this.folders.has(folderId)) return false;
    // Set folderId to null for all sessions in this folder
    this.sessions.forEach(session => {
        if (session.folderId === folderId) {
            session.folderId = null;
        }
    });
    this.folders.delete(folderId);
    await this.persist();
    return true;
  }
  async updateFolderName(folderId: string, newName: string): Promise<boolean> {
    await this.ensureLoaded();
    const folder = this.folders.get(folderId);
    if (folder) {
        folder.name = newName;
        await this.persist();
        return true;
    }
    return false;
  }
  async listFolders(): Promise<Folder[]> {
    await this.ensureLoaded();
    return Array.from(this.folders.values()).sort((a, b) => a.createdAt - b.createdAt);
  }
}