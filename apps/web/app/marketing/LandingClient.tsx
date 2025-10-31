"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function LandingClient() {
  const router = useRouter();
  const [demoText, setDemoText] = useState("");
  const promptDemo = "Create a portfolio website for a designer";

  // Typewriter animation effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDemoText(promptDemo.slice(0, i));
      i++;
      if (i > promptDemo.length) clearInterval(interval);
    }, 70);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.main
      className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.h1
        className="text-5xl md:text-6xl font-bold mb-4 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        ArjunAI
      </motion.h1>

      <p className="text-[#00A8E8] mb-8 text-lg md:text-xl">
        Where prompts hit the target
      </p>

      {/* Animated typing prompt */}
      <div className="bg-[#11182a]/60 border border-[#1d2840] rounded-lg p-4 mb-6 w-full max-w-lg text-center font-mono text-sm text-gray-300 backdrop-blur-md">
        <span className="text-[#00A8E8]">user@arjunai:</span> {demoText}
        <span className="animate-pulse text-[#00A8E8]">|</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <motion.button
          onClick={() => router.push("/app")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#00A8E8] hover:bg-[#0090c8] text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-[#00A8E8]/30"
        >
          Try Now
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="border border-[#00A8E8]/50 hover:border-[#00A8E8] text-[#00A8E8] font-medium px-6 py-3 rounded-lg transition-all"
          onClick={() => alert("🔐 Sign-in coming soon!")}
        >
          Sign In
        </motion.button>
      </div>

      <p className="text-xs text-gray-500 mt-10">
        © {new Date().getFullYear()} ArjunAI — Built for creators
      </p>
    </motion.main>
  );
}
