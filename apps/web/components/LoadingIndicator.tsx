"use client";
import { motion } from "framer-motion";

export default function LoadingIndicator() {
  const dots = ["", ".", "..", "..."];
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
        className="text-accent text-lg font-semibold"
      >
        Generating{dots[Math.floor(Date.now() / 400) % dots.length]}
      </motion.div>
      <p className="text-slate-400 text-sm mt-2">
        AI is building your project files...
      </p>
    </div>
  );
}
