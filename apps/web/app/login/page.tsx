"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Github, Mail, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number }[]>([]);

  // ✅ Generate random particle positions client-side only
  useEffect(() => {
    const count = 15;
    const newParticles = Array.from({ length: count }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []); // ✅ fully closed correctly

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden bg-gradient-to-b from-[#050a16] via-[#0B1120] to-[#111a2e] text-white">
      {/* 🌌 Layer 1: Animated gradient flow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/60 via-[#102040]/40 to-[#0B1120]/60 blur-3xl"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* 🌠 Layer 2: Floating Glow Orbs */}
      <motion.div
        className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-[#00A8E8]/25 blur-[140px] rounded-full"
        animate={{ x: [0, 40, -60, 0], y: [0, -50, 50, 0], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[5%] right-[5%] w-[300px] h-[300px] bg-indigo-500/25 blur-[140px] rounded-full"
        animate={{ x: [0, -40, 60, 0], y: [0, 50, -50, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🌟 Floating Particles (client-safe) */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-[6px] h-[6px] rounded-full bg-white/30"
          style={{ left: p.x, top: p.y }}
          animate={{
            y: [p.y, p.y - 200],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* 🔹 Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-[#111a2e]/80 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md text-center border border-[#1d2840] z-10"
      >
        {/* ✅ Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-4 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
         src="/arjunai-logo.png"
         alt="ArjunAI Logo"
         width={80}
         height={80}
         className="object-contain bg-transparent"
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
