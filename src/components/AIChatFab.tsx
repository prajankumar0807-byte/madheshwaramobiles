import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { chatWithAI } from "@/lib/ai.functions";

type Msg = { role: "user" | "assistant"; content: string };

export const AIChatFab = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "👋 Hi! I'm the SMM Assistant. Ask me about phones, accessories, repairs, or our store." },
  ]);
  const chat = useServerFn(chatWithAI);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const { reply } = await chat({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: "Connection issue. Please WhatsApp +91 81249 95343." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
        className="fixed bottom-24 right-6 z-50 group"
      >
        <div className="absolute inset-0 rounded-full gradient-gold-bg blur-xl opacity-70 animate-pulse-glow" />
        <div className="relative h-14 w-14 rounded-full glass-card gold-border flex items-center justify-center shadow-gold transition-transform group-hover:scale-110">
          <Sparkles className="h-6 w-6 text-gold" />
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[560px]">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md sm:hidden" onClick={() => setOpen(false)} />
          <div className="relative h-full sm:h-[560px] flex flex-col glass-card sm:rounded-3xl border-[color:var(--gold)]/40 overflow-hidden shadow-gold animate-rise">
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--gold)]/20">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full gradient-gold-bg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-background" />
                </div>
                <div>
                  <div className="font-display text-sm gradient-gold-text">SMM Assistant</div>
                  <div className="text-[10px] text-muted-foreground tracking-wider">AI POWERED</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-gold">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    m.role === "user"
                      ? "gradient-gold-bg text-background"
                      : "glass border-[color:var(--gold)]/20"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex gap-1 px-4">
                  <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-gold animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="h-2 w-2 rounded-full bg-gold animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              )}
              <div ref={endRef} />
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="p-3 border-t border-[color:var(--gold)]/20 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about phones, repairs, accessories…"
                className="flex-1 rounded-full px-4 py-2 bg-secondary/60 border border-[color:var(--gold)]/20 text-sm outline-none focus:border-[color:var(--gold)]"
                maxLength={500}
              />
              <button type="submit" disabled={busy} className="h-10 w-10 rounded-full gradient-gold-bg flex items-center justify-center shadow-gold disabled:opacity-50">
                <Send className="h-4 w-4 text-background" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
