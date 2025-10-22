import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import useStore from '@/lib/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { getAnimationProps } from '@/lib/animations';
export function ChatPanel() {
  const currentChat = useStore(s => s.currentChat);
  const sendMessage = useStore(s => s.sendMessage);
  const toggleSidebar = useStore(s => s.toggleSidebar);
  const settings = useStore(s => s.settings);
  const isMobile = useIsMobile();
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { bubbleShape, chatWidth, showTimestamps, animationSpeed, reduceMotion } = settings;
  const animationProps = getAnimationProps({ animationSpeed, reduceMotion });
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentChat?.messages, currentChat?.streamingMessage]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const WelcomeScreen = () => (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="w-16 h-16 mb-4 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome to Deep Down AI</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2">Start a conversation or press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd> to get started.</p>
    </div>
  );
  const isImageUrl = (url: string) => /\.(jpeg|jpg|gif|png|webp)$/.test(url);
  const bubbleClasses = bubbleShape === 'rounded' ? 'rounded-2xl' : 'rounded-lg';
  const userBubbleClasses = bubbleShape === 'rounded' ? 'rounded-br-none' : 'rounded-br-sm';
  const assistantBubbleClasses = bubbleShape === 'rounded' ? 'rounded-bl-none' : 'rounded-bl-sm';
  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold truncate">{currentChat?.title || 'Chat'}</h2>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-8 mx-auto" style={{ maxWidth: `${chatWidth}%` }}>
            <div className="space-y-8">
              {!currentChat || currentChat.messages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                <AnimatePresence initial={false}>
                  {currentChat.messages.map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={animationProps.variants}
                      transition={animationProps.transition}
                      className={cn('flex items-start gap-4', message.role === 'user' && 'justify-end')}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 border-2 border-indigo-500">
                          <AvatarFallback className="bg-indigo-500 text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'max-w-md lg:max-w-2xl p-4',
                          bubbleClasses,
                          message.role === 'user'
                            ? `${userBubbleClasses} bg-indigo-600 text-white`
                            : `${assistantBubbleClasses} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm`
                        )}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          {message.content}
                          {message.toolCalls?.map((toolCall, index) => {
                            if (toolCall.name === 'generate_image' && typeof toolCall.result === 'string' && isImageUrl(toolCall.result)) {
                              return (
                                <div key={index} className="mt-4">
                                  <img src={toolCall.result} alt={JSON.stringify(toolCall.arguments)} className="rounded-lg max-w-full h-auto" />
                                </div>
                              )
                            }
                            return null;
                          })}
                        </div>
                        {showTimestamps && (
                          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                            {format(new Date(message.timestamp), 'p')}
                          </p>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                  {(currentChat.isProcessing || currentChat.streamingMessage) && (
                    <motion.div
                      layout
                      initial="initial"
                      animate="animate"
                      variants={animationProps.variants}
                      transition={animationProps.transition}
                      className="flex items-start gap-4"
                    >
                      <Avatar className="h-8 w-8 border-2 border-indigo-500">
                        <AvatarFallback className="bg-indigo-500 text-white">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("max-w-md lg:max-w-2xl p-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm", bubbleClasses, assistantBubbleClasses)}>
                        {currentChat.streamingMessage ? (
                          <p className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            {currentChat.streamingMessage}<span className="animate-pulse">▍</span>
                          </p>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" style={{ animationDelay: '0s' }} />
                            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" style={{ animationDelay: '0.2s' }} />
                            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" style={{ animationDelay: '0.4s' }} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="w-full resize-none rounded-lg bg-slate-100 dark:bg-slate-800 pr-20 pl-4 py-3 min-h-[52px]"
            rows={1}
            disabled={currentChat?.isProcessing}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button type="submit" size="icon" disabled={!input.trim() || currentChat?.isProcessing}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
        <p className="text-xs text-center text-slate-400 mt-2">
          Built with ❤️ at Cloudflare. AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}