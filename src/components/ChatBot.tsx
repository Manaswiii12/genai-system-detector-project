import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, FileText, BookOpen, ShieldAlert, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/resumeStore";
import ReactMarkdown from "react-markdown";

const domains = [
  { id: "general", label: "General", icon: Globe },
  { id: "resume", label: "Resume", icon: FileText },
  { id: "research", label: "Research", icon: BookOpen },
  { id: "fake_detection", label: "Fake Detection", icon: ShieldAlert },
] as const;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [activeDomain, setActiveDomain] = useState<string>("general");
  const endRef = useRef<HTMLDivElement>(null);
  const { resumeData, atsScore } = useResumeStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    let assistantContent = "";
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          resumeContext: resumeData ? { ...resumeData, atsScore } : null,
          domain: activeDomain,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Chat failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${e.message}` }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg transition-transform hover:scale-105",
          open && "scale-0"
        )}
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden",
          open ? "h-[520px] opacity-100" : "h-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="gradient-primary p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
              <div>
                <h3 className="font-semibold text-primary-foreground text-sm">GeniusAI Assistant</h3>
                <p className="text-primary-foreground/70 text-xs">Intelligent multi-domain routing</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-1">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDomain(d.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all",
                  activeDomain === d.id
                    ? "bg-primary-foreground text-primary"
                    : "bg-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/30"
                )}
              >
                <d.icon className="w-3 h-3" />
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Hi! I can help you with resume advice. Try asking:</p>
              <div className="space-y-1.5">
                {["How can I improve my resume?", "Am I suitable for a Java Developer role?", "Rewrite my project description"].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="block w-full text-left text-xs bg-secondary hover:bg-secondary/80 rounded-lg px-3 py-2 text-secondary-foreground transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
                  msg.role === "user"
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ol]:mt-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your resume..."
              className="flex-1 text-sm"
              disabled={streaming}
            />
            <Button type="submit" size="icon" className="gradient-primary shrink-0" disabled={streaming || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
