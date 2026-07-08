import { useState, useCallback, useRef } from 'react';
import { sendChatMessage } from '../lib/api';
import type { ChatMessage, Language } from '../types';

interface UseChatReturn {
  messages: ChatMessage[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
}

export function useChat(language: Language): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idCounter = useRef(0);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: `local-${++idCounter.current}`,
      conversation_id: conversationId ?? '',
      sender: 'user',
      content: text,
      original_language: language,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        conversation_id: conversationId ?? undefined,
        message: text,
        language,
      });

      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      const assistantMsg: ChatMessage = {
        id: response.message_id,
        conversation_id: response.conversation_id,
        sender: 'assistant',
        content: response.reply,
        original_language: language,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
      // Remove the optimistically added user message on error? No — keep it, show error below.
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading, language]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return { messages, conversationId, isLoading, error, sendMessage, clearConversation };
}
