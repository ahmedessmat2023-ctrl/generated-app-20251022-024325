import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { DeepDownLayout } from '@/components/layout/DeepDownLayout';
import { Sidebar } from '@/components/Sidebar';
import { ChatPanel } from '@/components/ChatPanel';
import { CommandPalette } from '@/components/CommandPalette';
import { RenameSessionDialog } from '@/components/RenameSessionDialog';
import { DeleteSessionDialog } from '@/components/DeleteSessionDialog';
import useStore from '@/lib/store';
export function HomePage() {
  const initialize = useStore(s => s.initialize);
  const fontSize = useStore(s => s.settings.fontSize);
  const dialogState = useStore(s => s.dialogState);
  const closeDialog = useStore(s => s.closeDialog);
  const sessions = useStore(s => s.sessions);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  useEffect(() => {
    initialize();
  }, [initialize]);
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);
  const sessionForDialog = sessions.find(s => s.id === dialogState.context.sessionId);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
        <DeepDownLayout sidebar={<Sidebar />}>
          <ChatPanel />
        </DeepDownLayout>
        <Toaster richColors />
        <CommandPalette open={commandPaletteOpen} setOpen={setCommandPaletteOpen} />
        <RenameSessionDialog
          open={dialogState.type === 'rename'}
          onOpenChange={(open) => !open && closeDialog()}
          sessionId={dialogState.context.sessionId}
          currentTitle={sessionForDialog?.title}
        />
        <DeleteSessionDialog
          open={dialogState.type === 'delete'}
          onOpenChange={(open) => !open && closeDialog()}
          sessionId={dialogState.context.sessionId || ''}
        />
      </div>
    </ThemeProvider>
  );
}