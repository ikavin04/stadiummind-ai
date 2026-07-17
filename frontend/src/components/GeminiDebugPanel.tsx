/**
 * GeminiDebugPanel — Admin-only debug panel for live Gemini mode toggle.
 *
 * Visible only to the 'manager' role. Lets a judge or demo presenter flip
 * between mock mode (safe default) and real Gemini (uses live API quota)
 * without restarting the server. The budget guard is always respected — if
 * quota is exhausted, the toggle to real mode is blocked.
 *
 * This is intentionally a plain, unobtrusive debug widget. It should not
 * look like a core product feature.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Zap, ZapOff, AlertTriangle } from 'lucide-react';
import { getGeminiUsage, setGeminiMode } from '../lib/api';
import { cn } from '../lib/utils';

export function GeminiDebugPanel() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: usage, isLoading } = useQuery({
    queryKey: ['gemini-usage'],
    queryFn: getGeminiUsage,
    refetchInterval: 15_000,
  });

  const toggleMutation = useMutation({
    mutationFn: (useMock: boolean) => setGeminiMode(useMock),
    onSuccess: (result) => {
      if (!result.success && result.message) {
        setError(result.message);
      } else {
        setError(null);
      }
      queryClient.invalidateQueries({ queryKey: ['gemini-usage'] });
    },
    onError: () => setError('Failed to contact backend.'),
  });

  if (isLoading || !usage) return null;

  const isMock = usage.effective_mock_mode;
  const budgetPct = Math.round((usage.used / usage.limit) * 100);

  return (
    <div
      className={cn(
        'rounded-xl border p-4 text-xs font-mono space-y-3 transition-colors duration-300',
        isMock
          ? 'bg-bg-surface border-bg-border text-text-muted'
          : 'bg-accent-green/5 border-accent-green/30 text-text-primary',
      )}
      role="region"
      aria-label="Gemini AI mode panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 shrink-0" aria-hidden />
          <span className="font-semibold uppercase tracking-widest text-[10px]">
            Gemini AI Mode
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
              isMock
                ? 'bg-bg-border text-text-muted'
                : 'bg-accent-green/20 text-accent-green',
            )}
          >
            {isMock ? 'Mock' : 'Live'}
          </span>
        </div>

        {/* Toggle button */}
        <button
          id="gemini-mode-toggle"
          onClick={() => {
            setError(null);
            toggleMutation.mutate(!isMock);
          }}
          disabled={toggleMutation.isPending || usage.exhausted && isMock}
          aria-label={isMock ? 'Enable real Gemini' : 'Switch to mock mode'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            isMock
              ? 'border-accent-green/40 text-accent-green hover:bg-accent-green/10'
              : 'border-bg-border text-text-muted hover:bg-bg-border/30',
          )}
        >
          {isMock ? (
            <><Zap className="w-3 h-3" aria-hidden /> Enable Real</>
          ) : (
            <><ZapOff className="w-3 h-3" aria-hidden /> Use Mock</>
          )}
        </button>
      </div>

      {/* Budget bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Daily Budget</span>
          <span className={cn(
            usage.exhausted ? 'text-accent-red' : 'text-text-secondary',
          )}>
            {usage.used} / {usage.limit} calls used
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-border overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              budgetPct >= 90 ? 'bg-accent-red' :
              budgetPct >= 60 ? 'bg-accent-amber' :
              'bg-accent-green',
            )}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Exhausted warning */}
      {usage.exhausted && (
        <div className="flex items-center gap-1.5 text-accent-amber">
          <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden />
          <span>Daily API limit reached — responses will use cached knowledge until tomorrow (UTC).</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-accent-red">{error}</p>
      )}

      {/* Disclaimer */}
      <p className="text-text-muted text-[10px] leading-relaxed border-t border-bg-border pt-2">
        Set <code className="text-text-secondary">USE_MOCK_GEMINI</code> in env for a persistent default. Resets on server restart.
      </p>
    </div>
  );
}
