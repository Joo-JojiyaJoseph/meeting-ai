import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useAsk } from "@/features/assistant/api";

const SUGGESTIONS = ["Key decisions", "Action items", "Open risks", "Next steps"];

/**
 * A scoped-feeling AI chat rail for a single meeting. It calls the same
 * grounded /v1/assistant/ask endpoint as the full Assistant page, just
 * pre-seeded with the meeting title so the question reads naturally.
 */
export function AskAboutMeeting({ meetingTitle }) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState([]);
  const ask = useAsk();
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const submit = (e, override) => {
    e.preventDefault();
    const question = (override ?? input).trim();
    if (!question) return;
    const fullQuestion = meetingTitle ? `In "${meetingTitle}": ${question}` : question;
    setInput("");
    const idx = turns.length;
    setTurns((t) => [...t, { question, pending: true }]);
    ask.mutate(
      { question: fullQuestion },
      {
        onSuccess: (answer) => setTurns((t) => t.map((turn, i) => (i === idx ? { ...turn, answer, pending: false } : turn))),
        onError: () =>
          setTurns((t) =>
            t.map((turn, i) => (i === idx ? { ...turn, pending: false, answer: { answer: "Couldn't get an answer — try again.", citations: [] } } : turn)),
          ),
      },
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-surface shadow-card">
      <div className="flex items-center gap-2 bg-ai px-4 py-3 text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="font-display text-sm font-semibold">Ask about this meeting</p>
      </div>

      <div ref={scrollRef} className="max-h-72 flex-1 space-y-3 overflow-y-auto p-3.5">
        {turns.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={(e) => submit(e, s)}
                className="focus-ring rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-200 hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {turns.map((turn, i) => (
          <div key={i} className="space-y-2">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-500 px-3 py-2 text-xs text-white">{turn.question}</div>
            <div className="flex items-start gap-1.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ai text-white">
                <Bot className="h-3 w-3" />
              </span>
              {turn.pending ? (
                <motion.div className="inline-flex gap-1 rounded-2xl rounded-tl-sm bg-canvas px-3 py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1 w-1 rounded-full bg-ink-soft"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                    />
                  ))}
                </motion.div>
              ) : (
                <p className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-canvas px-3 py-2 text-xs leading-relaxed text-ink">{turn.answer?.answer}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-line p-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="focus-ring h-9 flex-1 rounded-lg border border-line bg-canvas px-3 text-xs"
        />
        <button
          type="submit"
          disabled={ask.isPending || !input.trim()}
          className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ai text-white transition disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
