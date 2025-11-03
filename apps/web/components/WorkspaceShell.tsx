"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import SidebarHistory from "./SidebarHistory";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DeployModal from "@/components/DeployModal";
import {
  Loader2,
  Eye,
  Code2,
  Pencil,
  Wifi,
  WifiOff,
  Plus,
  Square,
  LogOut,
  Rocket,
} from "lucide-react";

export default function WorkspaceShell() {
  const router = useRouter();

  // ✅ Backend base URL (env first, fallback to localhost)
  const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL as string | undefined) ||
    "http://localhost:5000";

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const [displayedCode, setDisplayedCode] = useState("");
  const [code, setCode] = useState("");
  const [iframeSrc, setIframeSrc] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "code" | "editor">(
    "preview"
  );
  const [controller, setController] = useState<AbortController | null>(null);
  const [projectKey, setProjectKey] = useState(0);
  const [showDeploy, setShowDeploy] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  // ✅ Auto-scroll logs
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // ✅ Load history on mount
  useEffect(() => {
    const h = JSON.parse(localStorage.getItem("arjunai_history") || "[]");
    setHistory(h);
  }, []);

  // ✅ Health check
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(API_BASE + "/api/health");
        setIsConnected(res.ok);
      } catch {
        setIsConnected(false);
      }
    };
    check();
    const i = setInterval(check, 4000);
    return () => clearInterval(i);
  }, [API_BASE]);

  // ✅ Logger (safe string concatenation)
  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, new Date().toLocaleTimeString() + " " + msg]);
  };

  // ✅ Logout
 // ✅ Clean logout function for BuilderPage and WorkspaceShell
const handleLogout = async () => {
  try {
    // Clear all local & session storage to prevent auto redirects or cached session data
    localStorage.clear();
    sessionStorage.clear();

    // Clear service workers cache (important for NextAuth/Vercel)
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }
    }

    // Wait for NextAuth to finish signing out
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  } catch (err) {
    console.error("❌ Logout failed:", err);
  }
};

  // ✅ Typing for Claude messages (keep only for AI responses)
  const simulateTyping = async (text: string) => {
    setIsTyping(true);
    setTypingMessage("");
    for (let i = 0; i < text.length; i++) {
      setTypingMessage((prev) => prev + text[i]);
      await new Promise((r) => setTimeout(r, 20));
    }
    setIsTyping(false);
    setMessages((prev) => [...prev, { sender: "ai", text }]);
  };

  // ✅ Generate Project
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const isNewProject = messages.length === 0; // first message check
    setIsGenerating(true);
    setLogs(["🧠 Generating..."]);
    setMessages((prev) => [...prev, { sender: "user", text: prompt }]);
    if (isNewProject) setProjectTitle(prompt);
    setPrompt("");
    setIframeSrc("");

    const abortCtrl = new AbortController();
    setController(abortCtrl);

    try {
      const res = await fetch(API_BASE + "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, firstPrompt: isNewProject }),
        signal: abortCtrl.signal,
      });

      const data = await res.json();

      if (data.question) {
        await simulateTyping(data.question);
        setIsGenerating(false);
        return;
      }

      if (!data.result) throw new Error(data.error || "No HTML returned");

      // ✅ Instant code display (no typing animation)
      await simulateTyping("✅ Generation complete! Preview and code are ready.");
      setCode(data.result);
      setDisplayedCode(data.result);

      setIframeSrc(
        API_BASE + "/" + data.filePath + "?t=" + String(Date.now())
      );
      setSelectedFile(data.filePath);

      const title = projectTitle || prompt;
      const shortTitle = title.split(" ").slice(0, 4).join(" ");

      const updatedChat = [
        ...messages,
        { sender: "user", text: title }, // store the title/prompt used
        { sender: "ai", text: "✅ Generation complete! Preview and code are ready." },
      ];

      const localHistory = JSON.parse(localStorage.getItem("arjunai_history") || "[]");
      const updatedHistory = [
        {
          prompt: title,
          file: data.filePath,
          title: shortTitle,
          time: new Date().toLocaleString(),
          chat: updatedChat,
        },
        ...localHistory.filter((h: any) => h.file !== data.filePath),
      ];
      localStorage.setItem("arjunai_history", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);

      await fetch(API_BASE + "/api/save-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: data.filePath, chat: updatedChat }),
      });

      addLog("✅ Generation complete");
    } catch (err: any) {
      if (err.name === "AbortError") {
        addLog("🛑 Generation stopped by user");
      } else {
        addLog("❌ Error: " + err.message);
      }
    } finally {
      setIsGenerating(false);
      setController(null);
    }
  };

  const handleStop = () => controller?.abort();

  // ✅ New Project
  const handleNewProject = () => {
    setPrompt("");
    setCode("");
    setDisplayedCode("");
    setIframeSrc("");
    setSelectedFile(null);
    setMessages([]);
    setLogs(["🆕 New project started"]);
    setProjectTitle(null);
    setIsTyping(false);
    setTypingMessage("");
    setController(null);
    setViewMode("preview");
    setProjectKey((k) => k + 1);
  };

  // ✅ Select Existing Project
  const handleSelectProject = async (item: any) => {
    setPrompt("");
    setSelectedFile(item.file);
    setProjectTitle(item.prompt);
    setLogs(["📂 Loaded project: " + item.prompt]);
    setIframeSrc(API_BASE + "/" + item.file + "?t=" + String(Date.now()));

    try {
      const res = await fetch(
        API_BASE + "/api/project/chat?file=" + encodeURIComponent(item.file)
      );
      const data = await res.json();
      if (data.chat?.length) setMessages(data.chat);
      else if (item.chat?.length) setMessages(item.chat);
      else setMessages([{ sender: "system", text: "Loaded old project." }]);
    } catch {
      setMessages([{ sender: "system", text: "Loaded old project." }]);
    }

    try {
      const res = await fetch(API_BASE + "/" + item.file);
      const html = await res.text();
      setCode(html);
      setDisplayedCode(html);
      setProjectKey((k) => k + 1);
    } catch {
      addLog("⚠️ Could not load code content for this project");
    }
  };

  // ✅ Auto-save chat
  useEffect(() => {
    if (!selectedFile || messages.length === 0) return;
    const interval = setInterval(async () => {
      try {
        const title = projectTitle || "Untitled Project";
        const shortTitle = title.split(" ").slice(0, 4).join(" ");

        const localHistory = JSON.parse(localStorage.getItem("arjunai_history") || "[]");
        const updatedHistory = [
          {
            prompt: title,
            file: selectedFile,
            title: shortTitle,
            time: new Date().toLocaleString(),
            chat: messages,
          },
          ...localHistory.filter((h: any) => h.file !== selectedFile),
        ];
        localStorage.setItem("arjunai_history", JSON.stringify(updatedHistory));
        setHistory(updatedHistory);

        await fetch(API_BASE + "/api/save-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: selectedFile, chat: messages }),
        });
      } catch (err) {
        console.warn("⚠️ Auto-save failed:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [messages, selectedFile, projectTitle, API_BASE]);

  return (
    <div className="flex flex-col h-screen bg-[#0B1120] text-gray-100 overflow-hidden">
      {/* HEADER */}
      <header className="p-4 border-b border-[#1d2840] flex justify-between items-center">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => router.push("/builder")}
        >
          <Image
            src="/arjunai-logo.png"
            alt="ArjunAI Logo"
            width={42}
            height={42}
            priority
          />
          <div>
            <h1 className="text-lg text-[#00A8E8] font-semibold">ArjunAI</h1>
            <div className="text-xs text-gray-400">where prompts hit the target</div>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          {/* 🚀 Deploy / Export Button */}
          <button
            onClick={() => setShowDeploy(true)}
            className="px-3 py-1 bg-[#00A8E8] hover:bg-[#0095d1] rounded-md flex items-center gap-1 text-white"
          >
            <Rocket className="w-4 h-4" /> Deploy / Export
          </button>

          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded-md ${
                viewMode === "preview" ? "bg-[#00A8E8]" : "text-gray-400"
              }`}
              onClick={() => setViewMode("preview")}
            >
              <Eye className="inline w-4 h-4 mr-1" /> Preview
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                viewMode === "code" ? "bg-[#00A8E8]" : "text-gray-400"
              }`}
              onClick={() => setViewMode("code")}
            >
              <Code2 className="inline w-4 h-4 mr-1" /> Code
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                viewMode === "editor" ? "bg-[#00A8E8]" : "text-gray-400"
              }`}
              onClick={() => setViewMode("editor")}
            >
              <Pencil className="inline w-4 h-4 mr-1" /> Editor
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded-md flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>

          {isConnected ? (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <Wifi className="w-4 h-4" /> Connected
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-red-400">
              <WifiOff className="w-4 h-4" /> Disconnected
            </div>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#0d1528] border-r border-[#1d2840] flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-[#1d2840] flex justify-center">
            <button
              onClick={handleNewProject}
              className="px-3 py-2 bg-[#085a7a] hover:bg-[#0a7a9a] rounded-md flex items-center gap-1 text-sm w-full justify-center"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2">
            <SidebarHistory
              history={history}
              onSelect={handleSelectProject}
              activeId={selectedFile}
              onDelete={(it: any) => {
                const newList = history.filter((x) => x.file !== it.file);
                localStorage.setItem("arjunai_history", JSON.stringify(newList));
                setHistory(newList);
                setLogs(["🗑️ Deleted project: " + (it.prompt || it.title || "")]);
              }}
            />
          </div>
        </aside>

        {/* CHAT + INPUT */}
        <div className="flex flex-col flex-1 p-4 overflow-hidden">
          <div className="flex-1 bg-[#111a2e] rounded-lg p-4 overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-3 rounded-2xl ${
                  m.sender === "user"
                    ? "ml-auto bg-[#00A8E8] text-white"
                    : "mr-auto bg-[#1d2840] text-gray-200"
                }`}
              >
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div className="mr-auto bg-[#1d2840] text-gray-200 p-3 rounded-2xl max-w-[80%] font-mono">
                {typingMessage}
                <span className="animate-pulse">▌</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 p-3 bg-[#0d1528] rounded-lg text-gray-100 border border-[#1d2840]"
              onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-3 bg-[#00A8E8] hover:bg-[#0095d1] rounded-lg text-white flex items-center gap-2"
            >
              {isGenerating && <Loader2 className="animate-spin w-4 h-4" />}
              {isGenerating ? "Generating..." : "Generate"}
            </button>

            {isGenerating && (
              <button
                onClick={handleStop}
                className="px-4 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white flex items-center gap-2"
              >
                <Square className="w-4 h-4" /> Stop
              </button>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          key={projectKey}
          className="w-1/2 bg-[#0d1528] border-l border-[#1d2840] overflow-hidden"
        >
          {viewMode === "preview" && iframeSrc && (
            <iframe
              src={iframeSrc}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin"
            />
          )}

          {viewMode === "code" && (
            <motion.div
              key={"code-" + projectKey}
              className="h-full overflow-y-auto bg-[#111a2e]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <pre className="p-4 text-gray-200 text-sm font-mono whitespace-pre-wrap">
                {displayedCode || (isGenerating ? "⌛ Generating..." : "⚙️ No code yet")}
              </pre>
            </motion.div>
          )}

          {viewMode === "editor" && (
            <Editor
              key={"editor-" + projectKey}
              height="100%"
              defaultLanguage="html"
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                wordWrap: "on",
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          )}
        </div>
      </main>

      {/* 🚀 Deploy Modal */}
      {showDeploy && (
        <DeployModal html={code || ""} onClose={() => setShowDeploy(false)} />
      )}
    </div>
  );
}
