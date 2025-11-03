"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/50 border-b border-white/10">
      <div className="container flex items-center justify-between h-16 px-6 md:px-10">
        {/* === LEFT SECTION: LOGO + BRAND === */}
        <Link href="/home" className="flex items-center gap-3 group">
          {/* Logo with hover animation */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="relative flex items-center justify-center"
          >
            <Image
              src="/arjunai-logo.png"
              alt="ArjunAI Logo"
              width={44}
              height={44}
              className="object-contain bg-transparent select-none"
              priority
            />
            {/* Subtle glow ring (appears on hover) */}
            <div className="absolute inset-0 rounded-full bg-[#00A8E8]/10 blur-md opacity-0 group-hover:opacity-100 transition duration-300"></div>
          </motion.div>

          <span className="text-lg font-semibold tracking-tight text-white group-hover:text-[#00A8E8] transition-colors duration-300">
            ArjunAI
          </span>
        </Link>

        {/* === CENTER NAVIGATION === */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          {[
            { href: "/home", label: "Home" },
            { href: "/demo", label: "Demo" },
            { href: "/about", label: "About" },
            { href: "/pricing", label: "Pricing" },
          ].map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`hover:text-white/90 transition ${
                pathname === n.href ? "text-white font-medium" : ""
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* === RIGHT ACTION BUTTONS === */}
        <div className="flex items-center gap-3 md:gap-5">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-[#00A8E8] px-4 py-2 font-medium text-zinc-900 hover:opacity-90 transition"
          >
            Build
          </Link>
          <Link
            href="/login"
            className="text-zinc-300 hover:text-white/90 text-sm font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
