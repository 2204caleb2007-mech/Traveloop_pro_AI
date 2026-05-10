import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatWithSupport } from "@/lib/chat.functions";

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user"|"assistant", content: string}[]>([
    { role: "assistant", content: "Hi! How can I help you plan your next trip?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatFn = useServerFn(chatWithSupport);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const newHistory = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    const result = await chatFn({ data: { messages: newHistory } });
    setLoading(false);

    if (result.error) {
      setMessages([...newHistory, { role: "assistant", content: "Oops, " + result.error }]);
    } else if (result.response) {
      setMessages([...newHistory, { role: "assistant", content: result.response }]);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[90]">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setOpen(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background shadow-lg shadow-[var(--neon-violet)]/20 hover:scale-105 transition-transform"
            >
              <MessageCircle className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[90] flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:right-6"
          >
            <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                <h3 className="font-semibold text-sm">GlobeX Support</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    m.role === "user" 
                      ? "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] font-medium rounded-tr-sm" 
                      : "bg-secondary text-foreground rounded-tl-sm"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/30 px-3 py-1">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading}
                  className="rounded-full bg-[var(--neon-violet)]/20 p-2 text-[var(--neon-violet)] hover:bg-[var(--neon-violet)]/30 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
