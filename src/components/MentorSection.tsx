import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Bot, User, BrainCircuit, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "coach";
  text: string;
  topic?: string;
  timestamp: Date;
}

const PRESET_QUESTIONS = [
  "How do I eliminate filler words like 'um' and 'like'?",
  "What are some tips to overcome public speaking anxiety?",
  "How can I improve my vocal projection and clarity?",
  "How should I structure a 5-minute presentation?"
];

export default function MentorSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "coach",
      text: "Hello! I am your AI Presentation & Public Speaking Mentor. Ask me any doubt or select a topic below to get expert-level, actionable strategies to improve your voice projection, pacing, body language, or presentation design.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>(PRESET_QUESTIONS);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setError("");
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Auto-complete Daily Activity Task 3: "Ask a question in the AI Mentor section"
    try {
      const savedTasksStr = localStorage.getItem("present_coach_completed_tasks");
      let tasks: string[] = [];
      if (savedTasksStr) {
        tasks = JSON.parse(savedTasksStr);
      }
      if (!tasks.includes("task3")) {
        tasks.push("task3");
        localStorage.setItem("present_coach_completed_tasks", JSON.stringify(tasks));
      }
    } catch (e) {
      console.error("Failed to update daily tasks status from mentor", e);
    }

    try {
      const payloadHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/coach/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: payloadHistory
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact mentor");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "coach",
          text: data.response,
          topic: data.topic,
          timestamp: new Date()
        }
      ]);

      if (data.suggestedFollowUp && Array.isArray(data.suggestedFollowUp)) {
        setSuggestedFollowUps(data.suggestedFollowUp);
      }
    } catch (err: any) {
      console.error("Mentor error:", err);
      setError("Unable to reach the Mentor. Please check your connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  // Helper to safely render simple Markdown rules like headers, bold text, and bullet points
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-base font-bold text-slate-800 mt-4 mb-2 first:mt-0 font-display">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="text-lg font-bold text-slate-900 mt-5 mb-2 first:mt-0 font-display">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h2 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-3 first:mt-0 font-display">
            {line.replace("# ", "")}
          </h2>
        );
      }

      // Bullet points
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const cleanLine = line.trim().substring(2);
        return (
          <li key={idx} className="ml-5 list-disc my-1.5 text-slate-700 leading-relaxed text-sm">
            {formatBoldText(cleanLine)}
          </li>
        );
      }

      // Numbered lists
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-2 text-sm text-slate-700 leading-relaxed ml-1">
            <span className="font-bold text-blue-600 bg-blue-50 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1">{formatBoldText(numMatch[2])}</div>
          </div>
        );
      }

      // Empty space
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Default paragraph
      return (
        <p key={idx} className="text-sm text-slate-700 my-1.5 leading-relaxed">
          {formatBoldText(line)}
        </p>
      );
    });
  };

  // Helper to format text with **bold** markers
  const formatBoldText = (str: string) => {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    if (parts.length === 1) return str;

    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="mentor-studio">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <BrainCircuit className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Doubts & Guidance</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">AI Presentation Mentor</h1>
          <p className="text-slate-500 mt-1">
            Get instant, context-specific solutions to polish your public speaking, reduce anxiety, and nail your delivery.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Instructions & Preset prompts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bot className="h-5 w-5 text-blue-600" />
              <h3 className="font-display font-bold text-slate-800 text-lg">Your Speaking Mentor</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Struggling with filler words or keeping eye contact? Our mentor uses customized educational guidelines to give step-by-step guidance.
            </p>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Suggested Questions</span>
              <div className="flex flex-col gap-2.5">
                {PRESET_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="text-left text-xs text-slate-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-3 rounded-xl transition duration-150 font-medium leading-normal flex items-start gap-2 group"
                  >
                    <HelpCircle className="h-4 w-4 text-slate-400 group-hover:text-blue-500 mt-0.5 shrink-0" />
                    <span className="group-hover:text-blue-700">{q}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white space-y-2 relative overflow-hidden shadow-sm">
                <Sparkles className="absolute -right-2 -bottom-2 h-20 w-20 text-white/10" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Practice Active Loop</h4>
                <p className="text-xs text-blue-50 leading-relaxed">
                  After getting tips from the mentor, head over to the <strong>Live Practice</strong> screen to record your speech and test out the new advice!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Container */}
        <div className="lg:col-span-8 flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Chat Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-800 block">Mentor Chat</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Active Presentation Coach
                </span>
              </div>
            </div>

            {messages.length > 1 && (
              <button
                onClick={() => setMessages([messages[0]])}
                className="text-[10px] text-slate-500 hover:text-slate-800 font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1 transition"
                title="Reset conversation"
              >
                <RefreshCw className="h-3 w-3" />
                Clear Chat
              </button>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto text-left"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === "user" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-600"
                }`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl text-left ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none shadow-sm"
                  }`}>
                    {m.role === "user" ? (
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{m.text}</p>
                    ) : (
                      <div className="space-y-1">
                        {m.topic && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded mb-2">
                            {m.topic}
                          </span>
                        )}
                        <div className="space-y-1">{renderMessageContent(m.text)}</div>
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] text-slate-400 block px-1 ${m.role === "user" ? "text-right" : ""}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* AI is thinking */}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 max-w-[90%] mx-auto">
                <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Clarification Error</span>
                  <span className="leading-relaxed">{error}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Follow-up suggestions box (if any exist) */}
          {!isLoading && suggestedFollowUps.length > 0 && (
            <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto whitespace-nowrap flex items-center gap-2 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Follow-up:</span>
              {suggestedFollowUps.slice(0, 3).map((f, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(f)}
                  className="text-[11px] text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1 rounded-full transition font-medium shrink-0 shadow-xs"
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Chat input */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask the mentor a doubt... (e.g. 'How do I reduce stage fright?')"
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[40px] max-h-[120px] transition shadow-inner placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center shrink-0 shadow transition duration-150 hover:shadow-md"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
