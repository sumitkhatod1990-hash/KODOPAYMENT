import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, Send, Loader2, Sparkles, RefreshCw, Bot, User, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  error?: boolean;
}

function useSafeThemeDark(): boolean {
  try {
    const ctx = useDashboardTheme();
    return ctx ? ctx.dark : false;
  } catch {
    return false;
  }
}

export const SupportChat: React.FC = () => {
  const { user } = useAuth();
  const isDark = useSafeThemeDark();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'public' | 'authenticated'>(user ? 'authenticated' : 'public');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentMode(user ? 'authenticated' : 'public');
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    setInput('');
    setErrorBanner(null);

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: messageContent, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];

    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reach support chat');
      }

      if (data.mode) {
        setCurrentMode(data.mode);
      }

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.reply || 'No response received.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setErrorBanner(err.message || 'Unable to connect to AI Support service');
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an error getting an answer. Please check your connection or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const publicStarterPrompts = [
    "How does QivroPay hosted checkout work?",
    "What payment methods are supported?",
    "How do I test in Sandbox mode?"
  ];

  const authenticatedStarterPrompts = [
    "What is my total payment volume?",
    "Show me my recent payments",
    "What is my settlement & reconciliation status?"
  ];

  const activePrompts = currentMode === 'authenticated' ? authenticatedStarterPrompts : publicStarterPrompts;

  // Robust Markdown renderer for AI support responses
  const renderFormattedText = (rawText: string) => {
    const cleanText = rawText
      .replace(/\\#/g, '#')
      .replace(/\\\|/g, '|')
      .replace(/\\`/g, '`')
      .replace(/\\\*/g, '*')
      .replace(/\\_/g, '_')
      .replace(/\\-/g, '-');

    const codeBlockRegex = /```(?:[a-zA-Z]*)\n?([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(cleanText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: cleanText.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', content: match[1].trim() });
      lastIndex = codeBlockRegex.lastIndex;
    }
    if (lastIndex < cleanText.length) {
      parts.push({ type: 'text', content: cleanText.slice(lastIndex) });
    }

    const renderInline = (text: string): React.ReactNode => {
      const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      return tokens.map((token, i) => {
        if (token.startsWith('`') && token.endsWith('`')) {
          return (
            <code key={i} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
              {token.slice(1, -1)}
            </code>
          );
        }
        if (token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
              {token.slice(2, -2)}
            </strong>
          );
        }
        return token;
      });
    };

    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {parts.map((part, partIdx) => {
          if (part.type === 'code') {
            return (
              <div key={partIdx} className="my-2 rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800 shadow-sm">
                <pre>{part.content}</pre>
              </div>
            );
          }

          const lines = part.content.split('\n');
          return (
            <div key={partIdx} className="space-y-1.5">
              {lines.map((line, lineIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={lineIdx} className="h-1" />;

                if (trimmed.startsWith('#')) {
                  const headingText = trimmed.replace(/^#+\s*/, '');
                  return (
                    <div key={lineIdx} className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2 mb-1">
                      {renderInline(headingText)}
                    </div>
                  );
                }

                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                  const bulletText = trimmed.substring(2);
                  return (
                    <div key={lineIdx} className="flex items-start gap-2 pl-1.5 my-0.5">
                      <span className="text-blue-500 font-bold shrink-0">•</span>
                      <span className="flex-1">{renderInline(bulletText)}</span>
                    </div>
                  );
                }

                return <p key={lineIdx}>{renderInline(line)}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };


  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="QivroPay Support AI"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isDark
            ? 'bg-[#111827] text-white border border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.7)]'
            : 'bg-white text-slate-900 border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)]'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <HelpCircle className={`w-7 h-7 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#111827]" />
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-24 w-auto sm:w-[420px] max-h-[620px] h-[calc(100vh-140px)] sm:h-[560px] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border transition-all duration-200 ${
            isDark
              ? 'bg-[#0b0e14] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'bg-[#111622] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight">QivroPay Support AI</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {currentMode === 'authenticated' ? (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> Account Assistant ({user?.company || 'Merchant'})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Globe className="w-3.5 h-3.5" /> Public Guide Mode
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
              aria-label="Close support chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center px-4 py-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base mb-1">How can I help you today?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                  {currentMode === 'authenticated'
                    ? `I can answer questions about your ${user?.company || 'merchant'} account, payments, refunds, settlements, and products.`
                    : 'Ask me anything about QivroPay payments, sandbox testing, API integration, and features.'}
                </p>

                <div className="w-full space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left pl-1 mb-1">
                    Suggested Questions
                  </div>
                  {activePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition border font-medium ${
                        isDark
                          ? 'bg-[#151c2a] border-slate-800 hover:border-blue-500/50 text-slate-200'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-700'
                      }`}
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl text-xs ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : msg.error
                        ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-bl-none'
                        : isDark
                        ? 'bg-[#151c2b] text-slate-100 border border-slate-800 rounded-bl-none'
                        : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-none'
                    }`}
                  >
                    {msg.role === 'assistant' ? renderFormattedText(msg.content) : <p>{msg.content}</p>}
                    {msg.timestamp && (
                      <div
                        className={`text-[9px] mt-1.5 text-right ${
                          msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div
                  className={`p-3 rounded-2xl rounded-bl-none text-xs flex items-center gap-2 ${
                    isDark ? 'bg-[#151c2b] text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>QivroPay AI is thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div
            className={`p-3 border-t shrink-0 ${
              isDark ? 'bg-[#111622] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {errorBanner && (
              <div className="mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] flex items-center justify-between">
                <span>{errorBanner}</span>
                <button onClick={() => setErrorBanner(null)} className="hover:underline font-bold ml-2">Dismiss</button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentMode === 'authenticated'
                    ? "Ask about your account, volume, payments..."
                    : "Ask about QivroPay checkout, docs, sandbox..."
                }
                disabled={loading}
                className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                  isDark
                    ? 'bg-[#182030] border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                }`}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2 text-[10px] text-center text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Protected by QivroPay Server Tenant Isolation</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
