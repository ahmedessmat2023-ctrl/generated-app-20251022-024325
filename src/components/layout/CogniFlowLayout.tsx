import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import useStore from '@/lib/store';
interface DeepDownLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}
export function DeepDownLayout({ sidebar, children }: DeepDownLayoutProps) {
  const isMobile = useIsMobile();
  const isSidebarOpen = useStore(s => s.isSidebarOpen);
  const setSidebarOpen = useStore(s => s.setSidebarOpen);
  if (isMobile) {
    return (
      <>
        <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80 border-r-0">
            {sidebar}
          </SheetContent>
        </Sheet>
        <main className="h-screen w-screen">{children}</main>
      </>
    );
  }
  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen w-screen items-stretch">
      <ResizablePanel
        defaultSize={20}
        minSize={15}
        maxSize={25}
        className="min-w-[280px] max-w-[400px]"
      >
        {sidebar}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}