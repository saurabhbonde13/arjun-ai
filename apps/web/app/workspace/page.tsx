"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function WorkspacePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBuild = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first.");
      return;
    }

    // Save prompt to sessionStorage so builder can access it
    sessionStorage.setItem("builderPrompt", prompt);

    // Navigate to builder
    setLoading(true);
    router.push("/builder");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1120] text-gray-100 px-4">
      <div className="max-w-2xl w-full bg-[#0f1a30] p-10 rounded-2xl shadow-xl border border-[#1d2840]">
        <h1 className="text-3xl font-bold text-[#00A8E8] text-center">
          Arjun AI
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          where prompts hit the target 🎯
        </p>

        <textarea
          className="w-full h-40 bg-[#111a2e] text-gray-100 p-4 rounded-lg border border-[#1d2840] resize-none focus:outline-none focus:ring-2 focus:ring-[#00A8E8]"
          placeholder="Describe what you want to build..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleBuild}
          disabled={loading}
          className="mt-6 w-full bg-[#00A8E8] hover:bg-[#0095d1] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Building...
            </>
          ) : (
            "Generate / Build Website"
          )}
        </button>
      </div>
    </div>
  );
}
