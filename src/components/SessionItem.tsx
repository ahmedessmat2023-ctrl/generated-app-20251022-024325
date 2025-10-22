import React from 'react';
import { MessageSquare, MoreHorizontal, Edit, Trash2, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import useStore from '@/lib/store';
import type { SessionInfo } from '../../worker/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
interface SessionItemProps {
  session: SessionInfo;
}
export function SessionItem({ session }: SessionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: session.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const activeSessionId = useStore(s => s.activeSessionId);
  const setActiveSession = useStore(s => s.setActiveSession);
  const toggleSessionPin = useStore(s => s.toggleSessionPin);
  const setSidebarOpen = useStore(s => s.setSidebarOpen);
  const openDialog = useStore(s => s.openDialog);
  const isMobile = useStore(s => s.isSidebarOpen && window.innerWidth < 768);
  const handleSessionClick = () => {
    setActiveSession(session.id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  const isActive = activeSessionId === session.id;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'group flex items-center w-full rounded-md text-left',
        isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
      )}
    >
      <Button
        variant="ghost"
        onClick={handleSessionClick}
        className={cn(
          'w-full justify-start gap-3 truncate px-3 py-2',
          isActive ? 'hover:bg-indigo-500 hover:text-white' : ''
        )}
        {...listeners}
      >
        <MessageSquare className="h-4 w-4 flex-shrink-0" />
        <span className="truncate flex-1">{session.title}</span>
        {session.isPinned && <Pin className="h-4 w-4 flex-shrink-0 text-indigo-300" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100',
              isActive && 'opacity-100 hover:bg-indigo-500'
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => toggleSessionPin(session.id)}>
            <Pin className="mr-2 h-4 w-4" />
            <span>{session.isPinned ? 'Unpin' : 'Pin'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('rename', { sessionId: session.id })}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('delete', { sessionId: session.id })} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}