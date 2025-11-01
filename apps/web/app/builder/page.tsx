"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Loader2,
  Trash2,
  Eye,
  Code2,
  LogOut,
  ArrowUpCircle,
  Wifi,
  WifiOff,
  Plus,
  X,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Auth Guard — handle login redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B1120] text-white">
        Checking session...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // ✅ Main App State
  const [chat, setChat] = useState<{ role: "user" | "claude"; content: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [iframeSrc, setIframeSrc] = useState("");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState<{ prompt: string; file: string; time: string }[]>([]);
  const [typedCode, setTypedCode] = useState("");
  const [fullCode, setFullCode] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [claudeTyping, setClaudeTyping] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const claudeTypeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://arjun-ai-backend.onrender.com";

  // ✅ Scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat, claudeTyping]);

  // ✅ Check backend connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        setIsConnected(res.ok);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  // ✅ Load project history
  useEffect(() => {
    const h = JSON.parse(localStorage.getItem("arjunai_history") || "[]");
    setHistory(h);
  }, []);

  // ✅ Auto-start generation if prompt passed
  useEffect(() => {
    const p = sessionStorage.getItem("builderPrompt");
    if (p) {
      handleGenerate(p);
      sessionStorage.removeItem("builderPrompt");
    }
  }, []);

  // ✅ Stop generation manually
  const handleStopGeneration = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (claudeTypeIntervalRef.current) clearInterval(claudeTypeIntervalRef.current);
    setIsGenerating(false);
    setClaudeTyping("");
    setChat((prev) => [
      ...prev,
      { role: "claude", content: "⚠️ Generation stopped by user." },
    ]);
  };

  // ✅ Generate via Claude
  const handleGenerate = async (prompt: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setChat((prev) => [...prev, { role: "user", content: prompt }]);

    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal,
      });

      const data = await res.json();

      if (data.question) {
        startClaudeTyping(data.question);
        setIsGenerating(false);
        return;
      }

      if (!data.result) {
        startClaudeTyping("⚠️ No HTML returned. Please retry.");
        setIsGenerating(false);
        return;
      }

      const html = data.result;
      setFullCode(html);
      setTypedCode(html);
      setIframeSrc(`${API_BASE}/${data.filePath}?t=${Date.now()}`);
      startClaudeTyping("✅ Website generated successfully!");

      const newHistory = [
        { prompt, file: data.filePath, time: new Date().toLocaleString() },
        ...history.filter((h) => h.prompt !== prompt),
      ];
      setHistory(newHistory);
      localStorage.setItem("arjunai_history", JSON.stringify(newHistory));
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("⚠️ Generation manually stopped");
      } else {
        startClaudeTyping(`❌ Error: ${err.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const startClaudeTyping = (text: string) => {
    if (claudeTypeIntervalRef.current) clearInterval(claudeTypeIntervalRef.current);
    setClaudeTyping("");
    let i = 0;
    const speed = 25;
    claudeTypeIntervalRef.current = setInterval(() => {
      setClaudeTyping((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        if (claudeTypeIntervalRef.current) clearInterval(claudeTypeIntervalRef.current);
        setChat((prev) => [...prev, { role: "claude", content: text }]);
        setClaudeTyping("");
      }
    }, speed);
  };

  const handleUserReply = async () => {
    if (isGenerating || !currentPrompt.trim()) return;
    const reply = currentPrompt.trim();
    setCurrentPrompt("");
    handleGenerate(reply);
  };

  const handleDelete = async (file: string) => {
    await fetch(`${API_BASE}/api/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath: file }),
    });
    const newHistory = history.filter((h) => h.file !== file);
    setHistory(newHistory);
    localStorage.setItem("arjunai_history", JSON.stringify(newHistory));
  };

  const confirmNewProject = () => {
    setChat([]);
    setIframeSrc("");
    setTypedCode("");
    setFullCode("");
    setCurrentPrompt("");
    setClaudeTyping("");
    setShowConfirm(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem("arjunai_history");
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0B1120] to-[#101a33] text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1d2840] p-4 flex flex-col justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center justify-center mb-5 cursor-pointer"
            onClick={() => router.push("/workspace")}
          >
            <Image
              src="/arjunai-logo.svg"
              alt="ArjunAI Logo"
              width={50}
              height={50}
              className="rounded-md"
            />
          </motion.div>

          <h2 className="text-lg font-semibold text-[#00A8E8] mb-4 flex justify-between items-center">
            Projects
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1 text-xs bg-[#085a7a] hover:bg-[#0a7a9a] px-2 py-1 rounded-md text-white"
            >
              <Plus className="w-3 h-3" /> New
            </button>
          </h2>

          <ul className="space-y-2">
            {history.length === 0 && (
              <p className="text-xs text-gray-500">No saved projects yet</p>
            )}
            {history.map((p, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-[#111a2e] px-3 py-2 rounded-lg text-sm hover:bg-[#15233b] transition-all"
              >
                <span
                  className="cursor-pointer truncate"
                  onClick={() => setIframeSrc(`${API_BASE}/${p.file}`)}
                  title={p.prompt}
                >
                  {p.prompt.split(" ").slice(0, 4).join(" ")}…
                </span>
                <Trash2
                  className="w-4 h-4 text-red-400 cursor-pointer"
                  onClick={() => handleDelete(p.file)}
                />
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 mt-6 bg-red-500 hover:bg-red-600 py-2 rounded-lg"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col border-r border-[#1d2840] p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-lg font-semibold text-[#00A8E8]">Claude Assistant</h1>
          <div className="flex items-center gap-1 text-xs">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Disconnected</span>
              </>
            )}
          </div>
        </div>

        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto bg-[#0d1528] rounded-lg p-6 space-y-4 border border-[#1d2840]"
        >
          {chat.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex w-full ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl text-[15px] ${
                  msg.role === "user"
                    ? "bg-[#00A8E8] text-white"
                    : "bg-[#131c34] text-gray-200 border border-[#1d2840]"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {claudeTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-5 py-3 rounded-2xl bg-[#131c34] text-gray-200 border border-[#1d2840]">
                {claudeTyping}
                <span className="animate-pulse">▍</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 p-3 bg-[#111a2e] rounded-lg border border-[#1d2840] focus:outline-none focus:ring-2 focus:ring-[#00A8E8]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!isGenerating && currentPrompt.trim()) handleUserReply();
              }
            }}
          />
          {isGenerating ? (
            <button
              type="button"
              onClick={handleStopGeneration}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 text-white"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!isGenerating && currentPrompt.trim()) handleUserReply();
              }}
              className="px-4 py-3 bg-[#00A8E8] hover:bg-[#0095d1] rounded-lg flex items-center gap-2 text-white"
            >
              <ArrowUpCircle className="w-5 h-5" /> Send
            </button>
          )}
        </form>
      </div>

      {/* Preview / Code Panel */}
      <div className="w-1/2 bg-[#0d1528]">
        <div className="flex justify-end gap-2 p-3 border-b border-[#1d2840]">
          <button
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1 rounded-md ${
              viewMode === "preview" ? "bg-[#00A8E8]" : "text-gray-400"
            }`}
          >
            <Eye className="inline w-4 h-4 mr-1" /> Preview
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`px-3 py-1 rounded-md ${
              viewMode === "code" ? "bg-[#00A8E8]" : "text-gray-400"
            }`}
          >
            <Code2 className="inline w-4 h-4 mr-1" /> Code
          </button>
        </div>

        {viewMode === "preview" && iframeSrc && (
          <iframe
            src={iframeSrc}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        )}

        {viewMode === "code" && (
          <motion.pre
            className="p-4 text-gray-200 h-full overflow-auto text-sm font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {typedCode || "⚙️ No code generated yet."}
          </motion.pre>
        )}
      </div>

      {/* Confirm Reset */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0d1528] border border-[#1d2840] rounded-2xl p-6 w-96 text-center shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex justify-end mb-2">
                <button onClick={() => setShowConfirm(false)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                </button>
              </div>
              <h2 className="text-lg font-semibold mb-3 text-[#00A8E8]">Start a new project?</h2>
              <p className="text-sm text-gray-400 mb-5">
                Your current chat and preview will be cleared.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={confirmNewProject}
                  className="bg-[#00A8E8] px-4 py-2 rounded-lg text-white hover:bg-[#0095d1]"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-gray-700 px-4 py-2 rounded-lg text-gray-200 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
