import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Session Routes
    app.get('/api/sessions', async (c) => {
        const controller = getAppController(c.env);
        const sessions = await controller.listSessions();
        return c.json({ success: true, data: sessions });
    });
    app.post('/api/sessions', async (c) => {
        const body = await c.req.json().catch(() => ({}));
        const { title, sessionId: providedSessionId, firstMessage } = body;
        const sessionId = providedSessionId || crypto.randomUUID();
        let sessionTitle = title;
        if (!sessionTitle) {
            const now = new Date();
            const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            if (firstMessage && firstMessage.trim()) {
                const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
                sessionTitle = `${truncated} �� ${dateTime}`;
            } else {
                sessionTitle = `Chat ${dateTime}`;
            }
        }
        await registerSession(c.env, sessionId, sessionTitle);
        return c.json({ success: true, data: { sessionId, title: sessionTitle } });
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        const sessionId = c.req.param('sessionId');
        const deleted = await unregisterSession(c.env, sessionId);
        if (!deleted) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
        return c.json({ success: true, data: { deleted: true } });
    });
    app.put('/api/sessions/:sessionId/title', async (c) => {
        const sessionId = c.req.param('sessionId');
        const { title } = await c.req.json();
        if (!title || typeof title !== 'string') return c.json({ success: false, error: 'Title is required' }, { status: 400 });
        const controller = getAppController(c.env);
        const updated = await controller.updateSessionTitle(sessionId, title);
        if (!updated) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
        return c.json({ success: true, data: { title } });
    });
    app.put('/api/sessions/:sessionId/move', async (c) => {
        const sessionId = c.req.param('sessionId');
        const { folderId } = await c.req.json();
        const controller = getAppController(c.env);
        const moved = await controller.moveSessionToFolder(sessionId, folderId);
        if (!moved) return c.json({ success: false, error: 'Session or folder not found' }, { status: 404 });
        return c.json({ success: true });
    });
    app.put('/api/sessions/:sessionId/pin', async (c) => {
        const sessionId = c.req.param('sessionId');
        const controller = getAppController(c.env);
        const pinned = await controller.toggleSessionPin(sessionId);
        if (!pinned) return c.json({ success: false, error: 'Session not found' }, { status: 404 });
        return c.json({ success: true });
    });
    app.delete('/api/sessions', async (c) => {
        const controller = getAppController(c.env);
        const deletedCount = await controller.clearAllSessions();
        return c.json({ success: true, data: { deletedCount } });
    });
    // Folder Routes
    app.get('/api/folders', async (c) => {
        const controller = getAppController(c.env);
        const folders = await controller.listFolders();
        return c.json({ success: true, data: folders });
    });
    app.post('/api/folders', async (c) => {
        const { name } = await c.req.json();
        if (!name) return c.json({ success: false, error: 'Folder name is required' }, { status: 400 });
        const controller = getAppController(c.env);
        const newFolder = await controller.addFolder(name);
        return c.json({ success: true, data: newFolder });
    });
    app.put('/api/folders/:folderId', async (c) => {
        const folderId = c.req.param('folderId');
        const { name } = await c.req.json();
        if (!name) return c.json({ success: false, error: 'New folder name is required' }, { status: 400 });
        const controller = getAppController(c.env);
        const updated = await controller.updateFolderName(folderId, name);
        if (!updated) return c.json({ success: false, error: 'Folder not found' }, { status: 404 });
        return c.json({ success: true });
    });
    app.delete('/api/folders/:folderId', async (c) => {
        const folderId = c.req.param('folderId');
        const controller = getAppController(c.env);
        const deleted = await controller.removeFolder(folderId);
        if (!deleted) return c.json({ success: false, error: 'Folder not found' }, { status: 404 });
        return c.json({ success: true });
    });
}