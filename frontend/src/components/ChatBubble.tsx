import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types';
import { Spinner } from './Spinner';
import { cn } from '../lib/utils';

interface ChatBubbleProps {
  message: ChatMessageType;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === 'user';
  return (
    <div className={cn('flex items-end gap-2 animate-slide-in-up', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-1',
        isUser ? 'bg-accent-green/20' : 'bg-bg-card border border-bg-border'
      )}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-accent-green" aria-hidden />
          : <Bot className="w-3.5 h-3.5 text-text-secondary" aria-hidden />
        }
      </div>
      {/* Bubble */}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-text-muted mt-1.5">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

interface TypingIndicatorProps {}

export function TypingIndicator({}: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-bg-card border border-bg-border">
        <Bot className="w-3.5 h-3.5 text-text-secondary" aria-hidden />
      </div>
      <div className="chat-bubble-assistant flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-text-muted">Thinking...</span>
      </div>
    </div>
  );
}

interface ChatListProps {
  messages: ChatMessageType[];
  isLoading: boolean;
}

export function ChatList({ messages, isLoading }: ChatListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
