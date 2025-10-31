"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Rocket } from "lucide-react";

export default function DeployModal({ html, onClose }: { html: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [repoName, setRepoName] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleExportGitHub = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/deploy/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: githubToken, repoName, html }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-[#0B1120] border border-[#1d2840] rounded-2xl p-8 w-[400px] shadow-2xl">
        <h2 className="text-xl font-semibold text-[#00A8E8] mb-4">🚀 Deploy / Export</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="GitHub Token (from developer settings)"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            className="w-full bg-[#111a2e] text-sm px-3 py-2 rounded-lg outline-none border border-[#1d2840]"
          />
          <input
            type="text"
            placeholder="Repository Name"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            className="w-full bg-[#111a2e] text-sm px-3 py-2 rounded-lg outline-none border border-[#1d2840]"
          />

          <button
            onClick={handleExportGitHub}
            disabled={loading}
            className="w-full bg-[#24292F] hover:bg-[#1b1f23] text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Github className="w-4 h-4" />
            {loading ? "Exporting..." : "Export to GitHub"}
          </button>

          {result?.repoUrl && (
            <p className="text-sm mt-2 text-green-400">
              ✅ Repo created:{" "}
              <a
                href={result.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-400"
              >
                {result.repoUrl}
              </a>
            </p>
          )}
        </div>

        <button onClick={onClose} className="mt-4 text-gray-400 hover:text-white text-sm">
          Close
        </button>
      </div>
    </motion.div>
  );
}
