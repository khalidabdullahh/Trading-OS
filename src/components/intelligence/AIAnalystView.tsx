import React, { useState } from "react";
import {
  BrainCircuit,
  Send,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle2,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { AIAnalystService } from "../../services/ai/aiAnalystService";
import { UserInsight, PsychologyPattern } from "../../types/domain";

export const AIAnalystView: React.FC = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "👋 **Trading-OS Context-Aware AI Analyst initialized.**\nI have audited your trading journal, execution logs, and trading constitution.\n\nAsk me anything like:\n- *'How did my performance look this week?'*\n- *'Which session gave me the best win rate?'*\n- *'Did I violate any trading plan rules?'*"
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const insights: UserInsight[] = AIAnalystService.generatePersonalInsights();
  const psychologyPatterns: PsychologyPattern[] = AIAnalystService.getPsychologyPatterns();

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean || isThinking) return;

    const newMsgs = [...messages, { sender: "user" as const, text: clean }];
    setMessages(newMsgs);
    setQuery("");
    setIsThinking(true);

    try {
      const response = await AIAnalystService.queryAnalyst(clean);
      setMessages([...newMsgs, { sender: "ai", text: response }]);
    } catch (err: any) {
      setMessages([...newMsgs, { sender: "ai", text: `⚠️ Analyst Error: ${err.message}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setQuery(promptText);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-cyan-500" />
              <span>Context-Aware AI Trading Analyst & Cognitive Engine</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 text-[10px] font-bold">
              AI v2.0 ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deep quantitative reasoning over your personal trade logs, plan adherence, and execution psychology.
          </p>
        </div>
      </div>

      {/* Grid: Chat Terminal & Cognitive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left: Interactive Chat Terminal */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-5 shadow-sm flex flex-col h-[520px]">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-cyan-500" />
              <span>Analyst Conversation</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Context: Full Trade History</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 font-sans">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-cyan-500 text-slate-950 font-semibold rounded-tr-none"
                      : "bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none font-sans"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 text-slate-400 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-500 animate-spin" />
                  <span>Analyzing trade logs & session metrics...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-sans">
            <span className="text-slate-400 shrink-0">Prompts:</span>
            {[
              "Audit my win rate and PnL",
              "Which session performs best?",
              "Did I break any rules?"
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(p)}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-500 text-slate-600 dark:text-slate-300 transition shrink-0 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="pt-2 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask the AI Analyst about your performance, setups, or mistakes..."
              className="flex-1 p-2.5 bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-900 dark:text-slate-100 font-sans"
            />
            <button
              type="submit"
              disabled={isThinking || !query.trim()}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>

        {/* Right: Personal Insights & Psychology Patterns */}
        <div className="lg:col-span-5 space-y-4">
          {/* Insights Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-3 font-sans">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span>Data-Driven Personal Insights</span>
              </span>
              <span className="text-[10px] text-emerald-500 font-mono font-bold">&gt;90% Confidence</span>
            </div>

            <div className="space-y-2.5">
              {insights.map(ins => (
                <div
                  key={ins.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{ins.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-500">
                      {ins.category}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {ins.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Psychology Patterns Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] shadow-sm space-y-3 font-sans">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <Activity className="h-4 w-4 text-purple-400" />
                <span>Behavioral Pattern Diagnostics</span>
              </span>
            </div>

            <div className="space-y-2">
              {psychologyPatterns.map(p => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Freq: {p.frequency}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    💡 <em>Remedy:</em> {p.remedyAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
