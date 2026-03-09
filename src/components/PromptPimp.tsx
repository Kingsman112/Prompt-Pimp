import { useState, useCallback, useRef } from "react";
import { Sparkles, Zap, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PromptPimp = () => {
  const [input, setInput] = useState("");
  const [enhanced, setEnhanced] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const enhance = useCallback(async (text: string) => {
    if (!text.trim() || text.trim().length < 10) {
      setEnhanced("");
      setKeywords([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: { prompt: text },
      });

      if (error) {
        toast.error("Failed to enhance prompt");
        console.error(error);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setEnhanced(data.enhanced || "");
      setKeywords(data.keywords || []);
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => enhance(value), 800);
  };

  const handleCopy = async () => {
    if (!enhanced) return;
    await navigator.clipboard.writeText(enhanced);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Zap className="w-7 h-7 text-primary glow-text" />
          <h1 className="text-2xl font-bold tracking-tight">
            Prompt<span className="text-primary glow-text">Pimp</span>
          </h1>
          <span className="text-muted-foreground text-sm font-mono ml-2 hidden sm:inline">
            // make your prompts legendary
          </span>
        </div>
      </header>

      {/* Main split */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Left panel */}
        <section className="flex-1 flex flex-col p-6 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="ml-2 text-sm text-muted-foreground font-mono">your_lazy_prompt.txt</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Type your basic prompt here...&#10;&#10;e.g. 'Write me a blog post about AI'"
            className="flex-1 min-h-[300px] bg-card border border-border rounded-lg p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:glow-border transition-shadow"
          />
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            {input.length > 0 ? `${input.length} chars — ${loading ? "enhancing..." : "waiting for input"}` : "start typing to see the magic ✨"}
          </p>
        </section>

        {/* Right panel */}
        <section className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground font-mono">the_pro_version.txt</span>
            </div>
            {enhanced && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "copied!" : "copy"}
              </button>
            )}
          </div>

          <div className={`flex-1 min-h-[300px] bg-card border rounded-lg p-4 font-mono text-sm overflow-auto transition-all ${enhanced ? "border-primary glow-border" : "border-border"}`}>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Pimping your prompt...</span>
              </div>
            ) : enhanced ? (
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{enhanced}</p>
            ) : (
              <p className="text-muted-foreground italic">Your enhanced prompt will appear here...</p>
            )}
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground font-mono mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" /> secret keywords detected:
              </p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-mono bg-secondary text-primary rounded-full border border-primary/30 animate-pulse-glow"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4">
        <p className="text-center text-xs text-muted-foreground font-mono">
          developed by <span className="text-primary">Muhammad Younis</span> — prompt-pimp v1.0
        </p>
      </footer>
    </div>
  );
};

export default PromptPimp;
