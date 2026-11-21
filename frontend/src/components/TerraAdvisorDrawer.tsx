import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, Sparkles, X, User, CheckCircle2,
  BookOpen, ArrowRight, CornerDownLeft, RefreshCw,
  Calculator, Download, Copy, Check, ExternalLink,
  Trash2, MessageSquare, ChevronRight, Maximize2
} from 'lucide-react';
import { askAdvisor } from '../api';
import { AssistantResponse } from '../types';

interface TerraAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onSwitchToFullPage?: () => void;
  siteName: string;
  population: number;
  areaAcres: number;
  currentPlanCode: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseObj?: AssistantResponse;
  timestamp: string;
  isStreaming?: boolean;
}

export const TerraAdvisorDrawer: React.FC<TerraAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  onSwitchToFullPage,
  siteName,
  population,
  areaAcres,
  currentPlanCode
}) => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: `Hello! I am **TerraAdvisor AI**, your geospatial urban intelligence assistant.\n\nI am calibrated for **${siteName}** (${population.toLocaleString()} citizens, ${areaAcres} acres).\n\nAsk me about CPHEEO water security, zoning density trade-offs, solar microgrid sizing, or ISRO satellite ground-truth validation.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: "CPHEEO Water Demand", query: "How much water will 20,000 people require under CPHEEO standards?" },
    { label: "Plan A vs Plan B", query: "Compare Master Plan A and Plan B in terms of walkability and Capex." },
    { label: "Solar Farm & BESS", query: "Can a 35-acre solar farm meet 70% electricity demand? What BESS storage is needed?" },
    { label: "Rainwater Harvesting", query: "Where should we build rainwater harvesting structures?" },
    { label: "Density Trade-Offs", query: "Is 40 people per acre gross density realistic for this settlement?" },
    { label: "ISRO Satellite Audit", query: "What ISRO satellite products validate this site boundary?" }
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Streaming typewriter simulator
  const simulateStreaming = (fullText: string, messageId: string, fullRes: AssistantResponse) => {
    let index = 0;
    const chunkSize = 6;
    const interval = setInterval(() => {
      index += chunkSize;
      if (index >= fullText.length) {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content: fullText, isStreaming: false, responseObj: fullRes }
              : m
          )
        );
        setLoading(false);
      } else {
        const partial = fullText.slice(0, index);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content: partial, isStreaming: true }
              : m
          )
        );
      }
    }, 18);
  };

  const handleSend = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'user-' + Date.now();
    const assistMsgId = 'assist-' + Date.now();

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: questionText,
      timestamp: timeStr
    };

    const emptyAssistMsg: ChatMessage = {
      id: assistMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg, emptyAssistMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askAdvisor({
        question: questionText,
        site_name: siteName,
        population: population,
        area_acres: areaAcres,
        current_plan_code: currentPlanCode
      });

      simulateStreaming(res.answer, assistMsgId, res);
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistMsgId
            ? {
                ...m,
                content: 'Error connecting to the TerraAI analysis engine. Please try again.',
                isStreaming: false
              }
            : m
        )
      );
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Assistant Button (Always accessible when drawer is closed) */}
      {!isOpen && (
        <button
          onClick={onOpen || onClose}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white px-4 py-3 rounded-full shadow-2xl shadow-cyan-500/40 border border-cyan-400/50 hover:scale-105 transition-all duration-200 group cursor-pointer"
          title="Open TerraAdvisor AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </div>
          <span className="text-xs font-black tracking-wide pr-1">TerraAdvisor AI</span>
        </button>
      )}

      {/* Slide-Over Drawer Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-slate-900 border-l border-cyan-500/30 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>TerraAdvisor AI</span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-semibold">
                      Grounded Expert
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Urban Planning & ISRO Space Intelligence Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMessages([
                      {
                        id: 'init-msg',
                        role: 'assistant',
                        content: `Chat cleared. Ready for your questions on **${siteName}**.`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                  }}
                  className="text-slate-400 hover:text-slate-200 text-xs p-1.5 rounded-lg hover:bg-slate-800 transition"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {onSwitchToFullPage && (
                  <button
                    onClick={onSwitchToFullPage}
                    className="text-slate-400 hover:text-cyan-300 text-xs p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    title="Expand to Full Page Studio Mode"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-200 text-sm p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Site Context Bar */}
            <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span>Site: <strong className="text-cyan-400">{siteName}</strong></span>
                <span>•</span>
                <span>Pop: <strong className="text-emerald-400">{population.toLocaleString()}</strong></span>
                <span>•</span>
                <span>Area: <strong className="text-slate-200">{areaAcres} Ac</strong></span>
              </div>
              <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                {currentPlanCode}
              </span>
            </div>

            {/* Chat History Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-white rounded-tr-none'
                        : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none space-y-2.5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-60 mb-1">
                      <span>{msg.role === 'user' ? 'You' : 'TerraAdvisor'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {msg.content}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle"></span>
                      )}
                    </div>

                    {/* Grounded Formula References Box */}
                    {msg.responseObj?.formula_references && msg.responseObj.formula_references.length > 0 && (
                      <div className="pt-2.5 mt-2.5 border-t border-slate-800/90 space-y-1">
                        <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[10px]">
                          <Calculator className="w-3 h-3" />
                          <span>Grounded Formulas Applied:</span>
                        </div>
                        {msg.responseObj.formula_references.map((f, i) => (
                          <div key={i} className="text-[11px] font-mono text-cyan-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            • {f}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Official Citations */}
                    {msg.responseObj?.official_data_sources && msg.responseObj.official_data_sources.length > 0 && (
                      <div className="pt-1.5 text-[10px] text-slate-400 flex flex-wrap items-center gap-1">
                        <span className="font-semibold">Sources:</span>
                        {msg.responseObj.official_data_sources.map((src, i) => (
                          <span key={i} className="bg-slate-900 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-800">
                            {src}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Recommended Action */}
                    {msg.responseObj?.recommended_action && (
                      <div className="mt-2 p-2 rounded-lg bg-cyan-950/50 border border-cyan-800/60 text-[10px] text-cyan-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span><strong>Action:</strong> {msg.responseObj.recommended_action}</span>
                      </div>
                    )}

                    {/* Copy Button */}
                    {msg.role === 'assistant' && !msg.isStreaming && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}

              {loading && !messages.some((m) => m.isStreaming) && (
                <div className="flex items-center gap-2 text-cyan-400 text-xs p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Analyzing spatial database and formulating response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips Carousel */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  disabled={loading}
                  className="text-[11px] bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 rounded-xl px-3 py-1.5 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask TerraAdvisor about water, zoning, solar, or simulations..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition cursor-pointer shadow-md shadow-cyan-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};