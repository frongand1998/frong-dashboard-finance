'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { getTransactions, getTransactionsSummary } from '@/server-actions/transactions';
import { getCategorySummary } from '@/server-actions/categories';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
  'What are my top spending categories this month?',
  'How does my income compare to my expenses?',
  'Where can I cut back to save more money?',
  'Give me a summary of my recent transactions.',
  'What is my average daily spending?',
  'Which category do I spend the most on?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAgentPage() {
  const { currency } = useCurrency();
  const [context, setContext] = useState<Record<string, unknown> | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load financial context once
  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const [txResult, summaryResult, catResult] = await Promise.all([
          getTransactions(200, 0),
          getTransactionsSummary(startDate, endDate),
          getCategorySummary(startDate, endDate),
        ]);

        const rawSummary = summaryResult.success && summaryResult.data
          ? (summaryResult.data as { income: number; expenses: number })
          : null;

        setContext({
          transactions: txResult.success ? txResult.data : [],
          summary: rawSummary
            ? {
                income: formatCurrency(rawSummary.income, currency.code),
                expenses: formatCurrency(rawSummary.expenses, currency.code),
                net: formatCurrency(rawSummary.income - rawSummary.expenses, currency.code),
              }
            : null,
          categories: catResult.success ? catResult.data : [],
        });
      } catch {
        // context loading failed silently — agent still works without it
      } finally {
        setContextLoading(false);
      }
    };
    load();
  }, [currency.code]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        );
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  }, [messages, context, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  return (
    <PageShell>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-accent" />
              AI Finance Agent
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ask anything about your finances — powered by Claude
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => { setMessages([]); setError(null); }}
              className="gap-2 text-muted-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              New chat
            </Button>
          )}
        </div>

        {/* Chat area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Your Finance Assistant</h2>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {contextLoading
                        ? 'Loading your financial data…'
                        : 'I have access to your transactions, income, and spending. Ask me anything!'}
                    </p>
                  </div>

                  {/* Suggested prompts */}
                  {!contextLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { setInput(p); inputRef.current?.focus(); }}
                          className="text-left text-xs px-3 py-2 rounded-lg border border-border bg-white hover:border-accent hover:text-accent transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {m.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-accent" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          m.role === 'user'
                            ? 'bg-accent text-white rounded-tr-sm'
                            : 'bg-muted text-foreground rounded-tl-sm'
                        }`}
                      >
                        {m.content || (
                          <span className="flex gap-1 items-center py-0.5">
                            <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce [animation-delay:300ms]" />
                          </span>
                        )}
                      </div>
                      {m.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {error && (
                    <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                      <span>{error.includes('ANTHROPIC_API_KEY')
                        ? 'API key not configured. Add ANTHROPIC_API_KEY to your .env.local file.'
                        : error}</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your finances… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent min-h-10.5 max-h-32"
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
                  }}
                  disabled={contextLoading}
                />
                {isLoading ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleStop}
                    className="h-10.5 w-10.5 p-0 shrink-0 flex items-center justify-center border border-border"
                  >
                    <span className="w-3 h-3 bg-foreground rounded-sm" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!input.trim() || contextLoading}
                    className="h-10.5 w-10.5 p-0 shrink-0 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </form>
              <p className="text-xs text-muted-foreground mt-1.5 px-1">
                AI responses are for informational purposes only, not financial advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
