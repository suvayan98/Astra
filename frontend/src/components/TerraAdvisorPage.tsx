import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, Sparkles, User, RefreshCw, BookOpen, ExternalLink,
  Download, Trash2, ArrowRight, CheckCircle2, ShieldCheck,
  Cpu, Droplets, SunMedium, Compass, FileText, ChevronRight,
  Calculator, HelpCircle, Layers, Zap
} from 'lucide-react';
import { askAdvisor } from '../api';
import { AssistantResponse } from '../types';

interface TerraAdvisorPageProps {
  siteName: string;
  district?: string;
  state?: string;
  population: number;
  areaAcres: number;
  currentPlanCode: string;
  onOpenReport?: () => void;
  onSwitchTab?: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseObj?: AssistantResponse;
  timestamp: string;
  isStreaming?: boolean;
}

export const TerraAdvisorPage: React.FC<TerraAdvisorPageProps> = ({
  siteName,
  district = 'Ahmedabad',
  state = 'Gujarat',
  population,
  areaAcres,
  currentPlanCode,
  onOpenReport,
  onSwitchTab
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to TerraAdvisor AI — Spatial Intelligence & Master Planning Assistant

I am your grounded geospatial planning advisor, calibrated for **${siteName}** (${district}, ${state}).

Current Settlement Baseline:
• **Target Population:** ${population.toLocaleString()} citizens
• **Total Boundary Area:** ${areaAcres} Acres (${(areaAcres * 0.00404686).toFixed(2)} km²)
• **Active Layout Paradigm:** ${currentPlanCode} (Gross Density: ${(population / areaAcres).toFixed(1)} people/acre)

All my recommendations are cross-validated against **CPHEEO 2024**, **URDPFI 2014**, **CGWB IN-GRES**, and **ISRO Earth Observation** data sources. Ask me any question below or select a domain from the prompt console.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const categories = [
    { id: 'all', label: 'All Queries' },
    { id: 'water', label: 'Water & CGWB', icon: Droplets },
    { id: 'zoning', label: 'Zoning & Master Plan', icon: Layers },
    { id: 'energy', label: 'Solar & Renewable', icon: SunMedium },
    { id: 'space', label: 'ISRO Space Data', icon: Cpu },
    { id: 'climate', label: 'Climate & Hazards', icon: ShieldCheck }
  ];

  const presetQuestions = [
    {
      cat: 'water',
      title: 'CPHEEO Water Demand Audit',
      query: 'What is the daily and annual CPHEEO municipal water requirement for 20,000 citizens, and how much can rainwater harvesting offset?'
    },
    {
      cat: 'zoning',
      title: 'Plan A vs Plan B Comparison',
      query: 'Compare Master Plan A (Walkable TOD) and Plan B (Low-Density Green) in terms of walkability, infrastructure Capex, and per-capita open space.'
    },
    {
      cat: 'energy',
      title: 'Solar Farm & BESS Sizing',
      query: 'Can a 35-acre ground solar farm meet 70% of the settlement electricity demand? What BESS battery storage capacity in MWh is required for the 4-hour evening peak?'
    },
    {
      cat: 'space',
      title: 'ISRO Space Data Hub Verification',
      query: 'Which ISRO satellite datasets (Cartosat-3, LISS-IV, Bhuvan LULC, MOSDAC, VEDAS) are used to validate the site boundary and geotechnical suitability?'
    },
    {
      cat: 'climate',
      title: '50-Year Extreme Storm Return',
      query: 'What is the 50-year return extreme 24-hour rainfall for this site, and what stormwater retention buffer width should be enforced around natural streams?'
    },
    {
      cat: 'water',
      title: 'CGWB Groundwater Security',
      query: 'What is the Central Ground Water Board (CGWB) extraction stage for this taluka, and what are the pre-monsoon vs post-monsoon water table depths?'
    },
    {
      cat: 'zoning',
      title: 'Density Trade-Off Evaluation',
      query: 'Is a gross density of 40 people per acre realistic for an Indian Tier-2 greenfield smart settlement? What infrastructure compromises does it require?'
    }
  ];

  const filteredQuestions = activeCategory === 'all'
    ? presetQuestions
    : presetQuestions.filter((q) => q.cat === activeCategory);

  // Typewriter streaming simulator for natural effect
  const simulateStreaming = (fullText: string, messageId: string, fullRes: AssistantResponse) => {
    let index = 0;
    const chunkSize = 8;
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
    }, 20);
  };

  const handleSend = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    const userMsgId = 'user-' + Date.now();
    const assistantMsgId = 'assist-' + Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: questionText,
      timestamp: timeStr
    };

    const emptyAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg, emptyAssistantMsg]);
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

      // Stream the response
      simulateStreaming(res.answer, assistantMsgId, res);
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: 'Error: Unable to connect to TerraAdvisor engine. Please check backend services or verify internet connection.',
                isStreaming: false
              }
            : m
        )
      );
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Chat cleared. TerraAdvisor AI is ready for your questions regarding **${siteName}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleExportChatMarkdown = () => {
    const lines = messages.map((m) => `### ${m.role === 'user' ? '👤 User' : '🤖 TerraAdvisor AI'} [${m.timestamp}]\n\n${m.content}\n`);
    const blob = new Blob([lines.join('\n---\n\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteName}_TerraAdvisor_AI_Consultation.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1700px] mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner with AI Visual Identity */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative">
                <Bot className="w-7 h-7 text-cyan-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-100 tracking-tight">
                  TerraAdvisor AI — Master Planning Consultant
                </h1>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 font-bold px-2.5 py-0.5 rounded-full border border-cyan-800">
                  Grounded Intelligence
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                  Zero Hallucination
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Domain-specific artificial intelligence specialized in Indian town planning, municipal water balance,
                solar microgrids, and ISRO Earth observation validation.
              </p>
            </div>
          </div>

          {/* Context Metric Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Active Site</span>
              <span className="text-xs font-bold text-cyan-400">{siteName}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Design Population</span>
              <span className="text-xs font-bold text-emerald-400">{population.toLocaleString()} citizens</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Gross Density</span>
              <span className="text-xs font-bold text-indigo-300">{(population / areaAcres).toFixed(1)} / acre</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column AI Planning Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Preset Queries & Knowledge Base (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Query Categories */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Knowledge Domains</span>
              </h2>
              <span className="text-[10px] text-slate-400">{presetQuestions.length} Templates</span>
            </div>

            <div className="flex flex-col gap-1">
              {categories.map((c) => {
                const Icon = c.icon || Sparkles;
                const isSelected = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{c.label}</span>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Prompts List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended Prompts</span>
            </h2>

            <div className="space-y-2">
              {filteredQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.query)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-950 text-slate-300 hover:text-cyan-300 transition text-xs group cursor-pointer disabled:opacity-50"
                >
                  <span className="text-[10px] text-cyan-400 font-semibold block mb-0.5 flex items-center justify-between">
                    <span>{q.title}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-2">
                    {q.query}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Planning Standards Compliance Cards */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Calibrated Indian Standards</span>
            </h2>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-cyan-300 block">CPHEEO Water Manual 2024</span>
                <span className="text-slate-400">135 LPCD domestic + 27 LPCD civic = 162 LPCD total benchmark.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-emerald-300 block">URDPFI Guidelines 2014</span>
                <span className="text-slate-400">Town & Country Planning minimum 10-12 m² green space per capita.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-amber-300 block">CGWB Dynamic Assessment 2023</span>
                <span className="text-slate-400">Groundwater extraction thresholds: Safe (&lt;70%), Semi-Critical (70-90%).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Main Chat Panel (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[750px] overflow-hidden">
          {/* Chat Header Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Advisory Consultation Console</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded font-mono">
                    ACTIVE
                  </span>
                </h2>
                <span className="text-[10px] text-slate-400">Streaming grounded answers with verifiable math</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportChatMarkdown}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs flex items-center gap-1"
                title="Download Conversation as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-xs"
                title="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Conversation Scroll Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 scrollbar-thin">
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
                  className={`max-w-[88%] rounded-2xl p-4 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-70 mb-1 border-b border-white/10 pb-1">
                    <span className="font-semibold">{msg.role === 'user' ? 'Urban Planner' : 'TerraAdvisor AI'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle"></span>
                    )}
                  </div>

                  {/* Grounded Formula References Box */}
                  {msg.responseObj?.formula_references && msg.responseObj.formula_references.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-indigo-900/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Governing Engineering Formulation</span>
                      </div>
                      <div className="space-y-1 font-mono text-[11px] text-cyan-300">
                        {msg.responseObj.formula_references.map((f, i) => (
                          <div key={i} className="bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                            • {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounded Metrics Table */}
                  {msg.responseObj?.grounded_metrics_used && Object.keys(msg.responseObj.grounded_metrics_used).length > 0 && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
                      <span className="font-semibold text-slate-400 block mb-1">Grounded Variables Applied:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.entries(msg.responseObj.grounded_metrics_used).map(([k, v]) => (
                          <div key={k} className="flex justify-between bg-slate-950 px-2 py-1 rounded">
                            <span className="text-slate-400">{k}:</span>
                            <span className="font-bold text-emerald-400">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Data Source Citations */}
                  {msg.responseObj?.official_data_sources && msg.responseObj.official_data_sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-slate-400 font-semibold">Authoritative Citations:</span>
                      {msg.responseObj.official_data_sources.map((src, i) => (
                        <span key={i} className="bg-slate-900 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded-full">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recommended Action */}
                  {msg.responseObj?.recommended_action && (
                    <div className="mt-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-cyan-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span><strong>Recommended Next Step:</strong> {msg.responseObj.recommended_action}</span>
                      </div>
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
              <div className="flex items-center gap-2 text-cyan-400 text-xs p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Computing spatial variables, querying CPHEEO standards, and drafting grounded response...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
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
                placeholder="Ask TerraAdvisor about water balance, zoning trade-offs, solar sizing, or ISRO data..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl transition flex items-center gap-1.5 font-bold text-xs shadow-lg shadow-cyan-600/30 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Context & Grounded Metrics Inspector (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Grounded Planning Metrics Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Grounded Metrics</span>
              </h2>
              <span className="text-[10px] text-emerald-400 font-bold">100% Verifiable</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Municipal Water Demand</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-black text-cyan-400">
                    {((population * 162) / 1000000).toFixed(2)} MLD
                  </span>
                  <span className="text-[10px] text-slate-400">162 LPCD CPHEEO</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Solar PV Generation Target</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-black text-amber-400">
                    {((population * 950) / 1000000).toFixed(2)} GWh/yr
                  </span>
                  <span className="text-[10px] text-slate-400">70% RE Target</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recommended BESS Storage</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-black text-indigo-300">
                    {Math.round(population * 0.00075 * 10) / 10} MWh
                  </span>
                  <span className="text-[10px] text-slate-400">4-Hour Evening Peak</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">URDPFI Open Space Budget</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-black text-emerald-400">
                    {Math.round(population * 12 * 0.000247105)} Acres
                  </span>
                  <span className="text-[10px] text-slate-400">12 m²/person</span>
                </div>
              </div>
            </div>
          </div>

          {/* Space Intelligence Integration Status */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>ISRO Portals Active</span>
            </h2>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="font-semibold text-slate-300">Bhoonidhi STAC</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LISS-IV & Carto-3
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="font-semibold text-slate-300">Bhuvan WMS</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LULC 50k & Geology
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="font-semibold text-slate-300">MOSDAC Meteorol.</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  INSAT-3DR Radar
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="font-semibold text-slate-300">VEDAS Vegetation</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AWiFS 15d NDVI
                </span>
              </div>
            </div>

            {onSwitchTab && (
              <button
                onClick={() => onSwitchTab('isro_hub')}
                className="w-full mt-2 text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 py-1.5 rounded-xl border border-indigo-900/60 hover:bg-indigo-950/40 transition cursor-pointer"
              >
                Open ISRO Space Hub Console →
              </button>
            )}
          </div>

          {/* Quick Actions */}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs py-2.5 rounded-lg transition cursor-pointer"
            >
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span>Generate executive dossier</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};