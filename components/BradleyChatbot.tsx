import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, ArrowUp, RotateCcw, Sparkles, Shield, Check, Copy, ExternalLink, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface BradleyChatbotProps {
  user: any | null;
}

const SUGGESTED_TOPICS = [
  "50/30/20 Budgeting Rule",
  "How Compound Interest Works",
  "FICO Score Factors",
  "Roth vs Traditional IRA",
  "Understanding W-2 & W-4 Forms"
];

const MAX_DAILY = 5;

function cleanPlainText(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    .replace(/[*#`]/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const BradleyChatbot: React.FC<BradleyChatbotProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState<number>(MAX_DAILY);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "I am Bradley, an AI assistant created by BeginFin. I am not a financial advisor, and I cannot provide personalized financial advice.\n\nHow can I help clarify any personal finance concepts from the BeginFin curriculum today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize remaining messages count for today from localStorage
  useEffect(() => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`beginfin_bradley_usage_${user.uid || user.email}_${todayStr}`);
    if (stored) {
      const used = parseInt(stored, 10);
      setRemainingMessages(Math.max(0, MAX_DAILY - used));
    } else {
      setRemainingMessages(MAX_DAILY);
    }
  }, [user]);

  // 5-Minute Session Nudge
  useEffect(() => {
    if (!user) return;

    const storedDismissed = sessionStorage.getItem('beginfin_bradley_nudge_dismissed');
    if (storedDismissed === 'true') {
      setNudgeDismissed(true);
      return;
    }

    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const timer = setTimeout(() => {
      if (!isOpen && !nudgeDismissed) {
        setShowNudge(true);
      }
    }, FIVE_MINUTES_MS);

    return () => clearTimeout(timer);
  }, [user, isOpen, nudgeDismissed]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setShowNudge(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleDismissNudge = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNudge(false);
    setNudgeDismissed(true);
    sessionStorage.setItem('beginfin_bradley_nudge_dismissed', 'true');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading || !user) return;

    if (remainingMessages <= 0) {
      const quotaMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "You have used your 5 daily questions with Bradley on the web app. Your quota resets tomorrow!\n\n💡 Tip: Want unlimited questions with zero daily limits? Connect Bradley directly to your AI tool via MCP: /bradley/mcp",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, quotaMsg]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyForApi = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, text: m.text }));

      let authToken = '';
      try {
        if (auth.currentUser) {
          authToken = await auth.currentUser.getIdToken();
        }
      } catch (err) {
        console.warn('Failed to retrieve auth token:', err);
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/chat/bradley', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: query,
          history: historyForApi,
          userId: user.uid || 'authenticated-user'
        })
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: cleanPlainText(data.reply),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        if (typeof data.remainingToday === 'number') {
          setRemainingMessages(data.remainingToday);
          const todayStr = new Date().toISOString().split('T')[0];
          localStorage.setItem(
            `beginfin_bradley_usage_${user.uid || user.email}_${todayStr}`,
            (MAX_DAILY - data.remainingToday).toString()
          );
        } else {
          setRemainingMessages(prev => Math.max(0, prev - 1));
        }
      } else if (res.status === 429) {
        setRemainingMessages(0);
        const limitMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: data.error || "You have reached your daily limit of 5 messages with Bradley. Your daily limit resets tomorrow.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, limitMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: data.error || "Unable to reach Bradley right now. Please try again in a few moments.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error("Bradley chat error:", err);
      const fallbackErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Network connection interrupted. Please verify your connection and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: "I am Bradley, an AI assistant created by BeginFin. I am not a financial advisor, and I cannot provide personalized financial advice.\n\nHow can I help clarify any personal finance concepts from the BeginFin curriculum today?",
        timestamp: new Date()
      }
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Only render for authenticated registered users
  if (!user) return null;

  return (
    <>
      {/* Floating Action Trigger in Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
        {/* 5-Minute Session Nudge Tooltip */}
        <AnimatePresence>
          {showNudge && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={() => {
                setIsOpen(true);
                setShowNudge(false);
              }}
              className="mb-3 max-w-[290px] bg-slate-900/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.22)] border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-slate-900 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">
                <Sparkles className="w-4 h-4 text-[#7F7FFA]" />
              </div>
              <div className="flex-1 pr-2">
                <p className="text-[10px] font-bold text-[#7F7FFA] uppercase tracking-widest leading-none mb-1">BeginFin AI</p>
                <p className="text-xs font-medium text-slate-100 leading-snug">
                  Confused? Let Bradley by BeginFin help.
                </p>
              </div>
              <button
                onClick={handleDismissNudge}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tactile Pebble Trigger Button */}
        <motion.button
          id="bradley-chat-pebble-button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', damping: 20, stiffness: 400 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Bradley AI Chat" : "Open Bradley AI Chat"}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-all duration-300 flex items-center justify-center border ${
            isOpen 
              ? 'bg-[#1c1c1e] text-white border-white/20 ring-4 ring-black/5' 
              : 'bg-[#1c1c1e]/95 hover:bg-[#1c1c1e] text-white border-white/15 backdrop-blur-xl ring-4 ring-slate-900/5'
          }`}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white/90" />
          ) : (
            <>
              <MessageSquare className="w-5 h-5 text-white/90" />
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#1c1c1e]"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Jony Ive / Apple-Inspired Chat Surface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] max-h-[640px] h-[80vh] bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_24px_64px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.08] flex flex-col overflow-hidden font-sans select-none"
          >
            {/* Header: Pure Apple Minimalism */}
            <div className="bg-white/80 backdrop-blur-md px-5 py-3.5 flex items-center justify-between border-b border-black/[0.06]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-[#2c2c2e] to-[#1c1c1e] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-white/10">
                    B
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm tracking-tight">Bradley</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium tracking-tight border border-black/[0.04]">
                      {remainingMessages} of {MAX_DAILY} left
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium tracking-tight">Powered by Google Gemini®</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  aria-label="Close"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Disclaimer Ribbon */}
            <div className="bg-slate-50/80 border-b border-black/[0.04] px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Educational clarity only • Not financial advice</span>
              </div>
              <span className="text-[9px] text-slate-400">5/day quota</span>
            </div>

            {/* MCP Promotion Banner */}
            <div 
              onClick={() => {
                setIsOpen(false);
                navigate('/bradley/mcp');
              }}
              className="bg-indigo-50/80 hover:bg-indigo-100/80 border-b border-indigo-100 px-4 py-1.5 flex items-center justify-between text-[10px] text-indigo-700 font-semibold cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Server className="w-3 h-3 text-[#7F7FFA] shrink-0" />
                <span>Use Bradley directly in your AI tool</span>
              </div>
              <span className="flex items-center gap-0.5 text-[#7F7FFA] font-bold">
                MCP <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>

            {/* Chat Body & Conversation Bubbles */}
            <div 
              role="log" 
              aria-live="polite" 
              aria-atomic="false"
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/30"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[88%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`p-3.5 text-[13px] leading-relaxed transition-all ${
                        msg.role === 'user'
                          ? 'bg-[#1c1c1e] text-white rounded-[1.25rem] rounded-tr-xs shadow-sm font-normal'
                          : 'bg-[#f2f2f7] text-[#1c1c1e] rounded-[1.25rem] rounded-tl-xs border border-black/[0.04] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      <div className="whitespace-pre-wrap select-text">{msg.text}</div>
                    </div>

                    {msg.role === 'model' && (
                      <div className="mt-1 flex items-center gap-3 px-1 text-[10px] text-slate-400">
                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="hover:text-slate-700 flex items-center gap-1 transition-colors py-0.5"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-[#f2f2f7] border border-black/[0.04] rounded-[1.25rem] rounded-tl-xs px-4 py-3 text-slate-500 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Chips */}
            {messages.length <= 2 && remainingMessages > 0 && (
              <div className="px-4 py-2 bg-white/70 backdrop-blur-sm border-t border-black/[0.04] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {SUGGESTED_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(`Can you explain ${topic}?`)}
                    disabled={isLoading}
                    className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:scale-95 rounded-full px-3 py-1 whitespace-nowrap transition-all shrink-0 border border-black/[0.03] disabled:opacity-50"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}

            {/* Input Capsule */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-black/[0.06]"
            >
              <div className="flex items-center gap-2 bg-[#f2f2f7]/90 rounded-full border border-black/[0.06] p-1.5 pl-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    remainingMessages > 0 
                      ? "Ask Bradley about personal finance concepts..." 
                      : "Daily limit of 5 questions reached"
                  }
                  disabled={isLoading || remainingMessages <= 0}
                  maxLength={350}
                  className="flex-1 bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60 font-normal"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading || remainingMessages <= 0}
                  aria-label="Send query"
                  className="w-8 h-8 rounded-full bg-[#1c1c1e] hover:bg-black disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-all shrink-0 active:scale-90 disabled:cursor-not-allowed shadow-sm"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 px-2 text-[10px] text-slate-400">
                <span>Google policies: <a href="https://policies.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">policies.google.com</a></span>
                <span>{remainingMessages} message{remainingMessages === 1 ? '' : 's'} remaining today</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
