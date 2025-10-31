"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Github, Mail, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden bg-gradient-to-b from-[#050a16] via-[#0B1120] to-[#111a2e] text-white">
      {/* 🔹 Floating Glow Effects */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#00A8E8]/30 blur-[150px] rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#0080c8]/20 blur-[120px] rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* 🔹 Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-[#111a2e]/80 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md text-center border border-[#1d2840]"
      >
        {/* ✅ Animated Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-4 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="/arjunai-logo.svg"
            alt="ArjunAI Logo"
            width={80}
            height={80}
            priority
          />
        </motion.div>

        <h1 className="text-3xl font-bold text-[#00A8E8]">ArjunAI</h1>
        <p className="text-gray-400 mb-8 tracking-wide">
          where prompts hit the target 🎯
        </p>

        <motion.button
          onClick={() => signIn("google", { callbackUrl: "/workspace" })}
          whileHover={{ scale: 1.05 }}
          className="w-full bg-[#4285F4] hover:bg-[#357ae8] text-white py-3 rounded-lg flex items-center justify-center gap-2 mb-3 shadow-lg"
        >
          <ArrowRight className="w-4 h-4" /> Sign in with Google
        </motion.button>

        <motion.button
          onClick={() => signIn("github", { callbackUrl: "/workspace" })}
          whileHover={{ scale: 1.05 }}
          className="w-full bg-[#24292F] hover:bg-[#1b1f23] text-white py-3 rounded-lg flex items-center justify-center gap-2 mb-3 shadow-lg"
        >
          <Github className="w-4 h-4" /> Sign in with GitHub
        </motion.button>

        <motion.button
          onClick={() => signIn("email", { callbackUrl: "/workspace" })}
          whileHover={{ scale: 1.05 }}
          className="w-full bg-[#00A8E8] hover:bg-[#0095d1] text-white py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg"
        >
          <Mail className="w-4 h-4" /> Continue with Email
        </motion.button>

        <p className="text-xs text-gray-500 mt-6">
          By continuing, you agree to ArjunAI’s Terms & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
