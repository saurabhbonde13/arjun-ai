"use client";
import { useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { toast } from "sonner";
import LoadingIndicator from "./LoadingIndicator";

export default function AssistantChat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!prompt.trim()) return;
    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: prompt }]);
    setPrompt("");

    // Simulate AI thinking delay
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "✨ Project generated successfully!\n✅ All files verified.\n🚀 Ready to preview or deploy.",
        },
      ]);
      setLoading(false);
      toast.success("✅ Build Verified — your app is ready!");
    }, 3500);
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex-1 overflow-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-white/10 text-white"
                : "bg-white/5 text-slate-300"
            }`}
          >
            {m.role === "assistant" ? (
              <TypeAnimation
                sequence={[m.content, 500]}
                speed={60}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre-wrap",
                }}
              />
            ) : (
              m.content
            )}
          </div>
        ))}

        {loading && <LoadingIndicator />}
      </div>

      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your app..."
          className="flex-1 px-3 py-2 rounded-xl bg-white/10 focus:outline-none"
        />
        <button
          onClick={send}
          className="px-4 py-2 rounded-xl bg-accent text-black font-semibold"
          disabled={loading}
        >
          {loading ? "Working..." : "Generate"}
        </button>
      </div>
    </div>
  );
}
