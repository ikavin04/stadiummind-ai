import { useState, useRef, useEffect } from 'react';
import { Send, Globe, Trash2, MessageSquare } from 'lucide-react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { ChatList } from '../components/ChatBubble';
import { Spinner } from '../components/Spinner';
import { useChat } from '../hooks/useChat';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { useAppStore } from '../store/useAppStore';
import { LANGUAGES } from '../lib/i18n';
import { t } from '../lib/i18n';
import { cn } from '../lib/utils';
import type { Language } from '../types';

const QUICK_QUESTIONS_KEYS = [
  'where_gate',
  'where_food',
  'parking_info',
  'medical_help',
  'lost_item',
  'match_schedule',
] as const;

export function FanAssistant() {
  const { language, setLanguage } = useAppStore();
  const { status } = useDashboardSocket();
  const { messages, isLoading, error, sendMessage, clearConversation } = useChat(language);
  const [input, setInput] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close lang menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (key: string) => {
    const question = t(key, language);
    sendMessage(question);
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
    clearConversation(); // start fresh conversation in new language
  };

  const currentLang = LANGUAGES.find((l) => l.code === language)!;
  const isRtl = currentLang.dir === 'rtl';

  return (
    <Layout wsStatus={status}>
      <div className="flex flex-col h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* ── Header ── */}
        <div className="shrink-0 border-b border-bg-border px-6 py-4">
          <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-green/15 border border-accent-green/25 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-accent-green" aria-hidden />
              </div>
              <div>
                <h1 className="text-base font-bold text-text-primary">{t('fanAssistant', language)}</h1>
                <p className="text-xs text-text-muted">FIFA World Cup 2026 · MetLife Stadium</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language selector */}
              <div className="relative" ref={langMenuRef}>
                <button
                  id="btn-language-selector"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  aria-label={t('selectLanguage', language)}
                  aria-expanded={showLangMenu}
                  className="btn-ghost flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" aria-hidden />
                  <span className="text-sm">{currentLang.flag} {currentLang.label}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-2 glass-card !p-1.5 min-w-[160px] z-20 animate-slide-in-up">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        id={`lang-${lang.code}`}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={cn(
                          'w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                          language === lang.code
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                        )}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {language === lang.code && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-green" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear chat */}
              {messages.length > 0 && (
                <button
                  onClick={clearConversation}
                  aria-label="Clear conversation"
                  className="btn-ghost !px-2.5"
                >
                  <Trash2 className="w-4 h-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-6 py-8">
              <div className="text-center space-y-2">
                <div className="text-5xl">🏟️</div>
                <h2 className="text-lg font-bold text-text-primary">Hi! I'm StadiumMind</h2>
                <p className="text-sm text-text-secondary max-w-xs">
                  Your AI guide for FIFA World Cup 2026 at MetLife Stadium. Ask me anything!
                </p>
              </div>

              {/* Quick questions */}
              <div className="w-full max-w-md space-y-2">
                <p className="text-xs text-text-muted text-center mb-3">{t('quickQuestions', language)}</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_QUESTIONS_KEYS.map((key) => (
                    <button
                      key={key}
                      id={`quick-${key}`}
                      onClick={() => handleQuickQuestion(key)}
                      className="glass-card !p-3 text-left text-xs text-text-secondary hover:text-text-primary hover:border-accent-green/30 transition-all duration-150"
                    >
                      {t(key, language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ChatList messages={messages} isLoading={isLoading} />
          )}
        </div>

        {/* ── Input area ── */}
        <div className="shrink-0 border-t border-bg-border px-6 py-4 bg-bg-surface/50 backdrop-blur-xl">
          {error && (
            <p className="text-xs text-accent-red mb-2 max-w-3xl mx-auto">
              ⚠️ {error}
            </p>
          )}
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('typeMessage', language)}
                rows={1}
                dir={isRtl ? 'rtl' : 'ltr'}
                aria-label="Chat message input"
                className="input-field resize-none max-h-32 overflow-y-auto"
                style={{ fieldSizing: 'content' } as React.CSSProperties}
              />
            </div>
            <button
              id="btn-send-message"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label={t('send', language)}
              className={cn(
                'btn-primary flex items-center gap-2 py-3 shrink-0 transition-all',
                (!input.trim() || isLoading) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? <Spinner size="sm" /> : <Send className="w-4 h-4" aria-hidden />}
              <span className="hidden sm:inline">{t('send', language)}</span>
            </button>
          </div>
          <p className="text-xs text-text-muted text-center mt-2">
            Powered by Gemini · RAG over MetLife Stadium knowledge base
          </p>
        </div>
      </div>
    </Layout>
  );
}
