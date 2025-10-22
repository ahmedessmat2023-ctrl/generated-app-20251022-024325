import React, { useMemo, useState } from 'react';
import { PlusCircle, Settings, Search, FolderPlus, Folder as FolderIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStore from '@/lib/store';
import { SettingsDialog } from './SettingsDialog';
import { SessionItem } from './SessionItem';
import type { Folder } from '../../worker/types';
import { toast } from 'sonner';
const FolderItem = ({ folder }: { folder: Folder }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: folder.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const sessions = useStore(s => s.sessions.filter(session => session.folderId === folder.id));
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AccordionItem value={folder.id} className="border-none">
        <AccordionTrigger className="hover:no-underline hover:bg-slate-800 rounded-md px-3 py-2 text-sm">
          <div className="flex items-center gap-3">
            <FolderIcon className="h-4 w-4" />
            <span className="truncate">{folder.name}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pl-4 pt-1">
          {sessions.map(session => (
            <SessionItem key={session.id} session={session} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
export function Sidebar() {
  const sessions = useStore(s => s.sessions);
  const folders = useStore(s => s.folders);
  const createNewSession = useStore(s => s.createNewSession);
  const createFolder = useStore(s => s.createFolder);
  const moveSessionToFolder = useStore(s => s.moveSessionToFolder);
  const searchQuery = useStore(s => s.searchQuery);
  const setSearchQuery = useStore(s => s.setSearchQuery);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const { pinnedSessions, unfiledSessions, filteredFolders } = useMemo(() => {
    const filtered = sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const folderIdsWithMatches = new Set(filtered.map(s => s.folderId));
    return {
      pinnedSessions: filtered.filter(s => s.isPinned),
      unfiledSessions: filtered.filter(s => !s.folderId && !s.isPinned),
      filteredFolders: folders.filter(f => folderIdsWithMatches.has(f.id)),
    };
  }, [sessions, folders, searchQuery]);
  const handleNewFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      await createFolder(folderName);
      toast.success(`Folder "${folderName}" created.`);
    }
  };
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;
    if (active.id !== over.id) {
      const isSession = sessions.some(s => s.id === active.id);
      const isFolder = folders.some(f => f.id === over.id);
      if (isSession && isFolder) {
        moveSessionToFolder(active.id, over.id);
        toast.success("Chat moved to folder.");
      }
    }
  };
  const hasSearchResults = pinnedSessions.length > 0 || unfiledSessions.length > 0 || filteredFolders.length > 0;
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveDragId(active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full flex-col bg-slate-900 text-slate-100">
        <div className="flex-1 flex flex-col">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
              <h1 className="text-xl font-bold">Deep Down AI</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createNewSession()} className="w-full justify-start gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100">
                <PlusCircle className="h-5 w-5" /> New Chat
              </Button>
              <Button onClick={handleNewFolder} size="icon" variant="outline" className="bg-slate-800 hover:bg-slate-700 border-slate-700">
                <FolderPlus className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border-slate-700 pl-9 focus:ring-indigo-500"
              />
            </div>
          </div>
          <ScrollArea className="flex-1 px-4">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                <MessageSquare className="h-10 w-10 mb-4" />
                <p className="font-semibold">No chats yet</p>
                <p className="text-sm">Click "New Chat" to start a conversation.</p>
              </div>
            ) : !hasSearchResults && searchQuery ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                <Search className="h-10 w-10 mb-4" />
                <p className="font-semibold">No results found</p>
                <p className="text-sm">Try a different search term.</p>
              </div>
            ) : (
              <>
                {pinnedSessions.length > 0 && (
                  <div className="mb-4 space-y-1">
                    <h3 className="px-3 py-2 text-xs font-semibold text-slate-400">Pinned</h3>
                    <SortableContext items={pinnedSessions.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      {pinnedSessions.map(session => (
                        <SessionItem key={session.id} session={session} />
                      ))}
                    </SortableContext>
                  </div>
                )}
                <Accordion type="multiple" className="w-full" defaultValue={folders.map(f => f.id)}>
                  <SortableContext items={filteredFolders.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    {filteredFolders.map(folder => (
                      <FolderItem key={folder.id} folder={folder} />
                    ))}
                  </SortableContext>
                </Accordion>
                <div className="mt-4 space-y-1">
                  <h3 className="px-3 py-2 text-xs font-semibold text-slate-400">Chats</h3>
                  <SortableContext items={unfiledSessions.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {unfiledSessions.map(session => (
                      <SessionItem key={session.id} session={session} />
                    ))}
                  </SortableContext>
                </div>
              </>
            )}
          </ScrollArea>
        </div>
        <div className="p-4 border-t border-slate-700">
          <SettingsDialog>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Settings className="h-5 w-5" /> Settings
            </Button>
          </SettingsDialog>
        </div>
      </div>
      <DragOverlay>
        {activeDragId && sessions.find(s => s.id === activeDragId) ? (
          <div className="bg-slate-700 p-2 rounded-md text-white">
            {sessions.find(s => s.id === activeDragId)?.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}