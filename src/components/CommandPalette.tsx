import React, { useEffect } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { FilePlus, Moon, Sun, Search, FolderPlus, Pin, Edit, Trash2 } from 'lucide-react';
import useStore from '@/lib/store';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { 
    createNewSession, 
    sessions, 
    setActiveSession, 
    setSidebarOpen,
    createFolder,
    activeSessionId,
    toggleSessionPin,
    openDialog,
  } = useStore();
  const { setTheme } = useTheme();
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);
  const runCommand = (command: () => unknown) => {
    setOpen(false);
    command();
  };
  const handleNewFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      createFolder(folderName);
      toast.success(`Folder "${folderName}" created.`);
    }
  };
  const activeSession = sessions.find(s => s.id === activeSessionId);
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => createNewSession())}>
            <FilePlus className="mr-2 h-4 w-4" />
            <span>New Chat</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(handleNewFolder)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            <span>New Folder</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Switch to Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Switch to Dark Mode</span>
          </CommandItem>
        </CommandGroup>
        {activeSession && (
          <CommandGroup heading="Current Chat">
            <CommandItem onSelect={() => runCommand(() => toggleSessionPin(activeSession.id))}>
              <Pin className="mr-2 h-4 w-4" />
              <span>{activeSession.isPinned ? 'Unpin' : 'Pin'} Current Chat</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => openDialog('rename', { sessionId: activeSession.id }))}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Rename Current Chat</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => openDialog('delete', { sessionId: activeSession.id }))}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Current Chat</span>
            </CommandItem>
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Chats">
          {sessions.map((session) => (
            <CommandItem
              key={session.id}
              value={session.title}
              onSelect={() => runCommand(() => {
                setActiveSession(session.id);
                setSidebarOpen(true);
              })}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>{session.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}