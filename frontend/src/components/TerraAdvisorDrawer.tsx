import React, { useState } from 'react';
import {
  Bot, Send, Sparkles, X, User, CheckCircle2,
  BookOpen, ArrowRight, CornerDownLeft, RefreshCw
} from 'lucide-react';
import { askAdvisor } from '../api';
import { AssistantResponse } from '../types';

interface TerraAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  population: number;
  areaAcres: number;
  currentPlanCode: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  responseObj?: AssistantResponse;
}

export const TerraAdvisorDrawer: React.FC<TerraAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  siteName,
  population,
  areaAcres,
  currentPlanCode
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am **TerraAdvisor AI**, your geospatial urban intelligence assistant. I can analyze land suitability, verify CPHEEO water demand, compare master plan trade-offs, and simulate long-term climate scenarios for **${siteName}** (${population.toLocaleString()} people, ${areaAcres} acres).\n\nAsk me any question or choose one of the recommended prompts below.`
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const quickPrompts = [
    "How much water will 20,000 people require?",
    "Is this land suitable for a new city?",
    "Compare Plan A and Plan B",
    "Can this settlement achieve 70% renewable electricity?",
    "Where should we build rainwater harvesting structures?",
    "Which area should be reserved for agriculture?",
    "What happens if the population doubles in 20 years?"
  ];

  const handleSend = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: questionText };
    setMessages((prev) => [...prev, userMsg]);
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

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.answer,
        responseObj: res
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error connecting to the TerraAI analysis engine. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-cyan-500/30 shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>TerraAdvisor AI</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded font-semibold">
                  Grounded Expert
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Urban Planning & Space Data Intelligence Assistant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Grounded Formula Citations */}
                {msg.responseObj && msg.responseObj.formula_references && msg.responseObj.formula_references.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-cyan-300 font-mono">
                    <strong className="block text-slate-400 font-sans uppercase mb-1">Grounded Formulas Used:</strong>
                    {msg.responseObj.formula_references.map((f, i) => (
                      <div key={i}>• {f}</div>
                    ))}
                  </div>
                )}

                {/* Official Sources */}
                {msg.responseObj && msg.responseObj.official_data_sources && (
                  <div className="text-[10px] text-slate-400 font-sans">
                    <strong>Sources: </strong>{msg.responseObj.official_data_sources.join(', ')}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing spatial databases and computing planning metrics...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Carousel */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 rounded-xl px-2.5 py-1 whitespace-nowrap transition cursor-pointer"
            >
              {prompt}
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
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
