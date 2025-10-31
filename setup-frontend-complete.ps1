# ============================================================
#  ArjunAI Frontend Auto-Builder  (Safe Version)
#  Location:  C:\arjunai\setup-frontend-complete.ps1
# ============================================================

$base = "C:\arjunai\apps\web"
Write-Host "🚀 Setting up ArjunAI frontend at $base ..."

# -------------------- 1. FOLDERS --------------------
$folders = @(
  "$base\app",
  "$base\app\(marketing)",
  "$base\app\app",
  "$base\components",
  "$base\app\api\auth\[...nextauth]",
  "$base\app\api\history"
)
foreach ($f in $folders) {
  if (-not (Test-Path $f)) {
    New-Item -ItemType Directory -Force -Path $f | Out-Null
    Write-Host "📁 Created $f"
  }
}

# -------------------- 2. globals.css --------------------
$globals = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
body { @apply bg-[#0B1120] text-white antialiased; }
'@
$globals | Set-Content -Encoding UTF8 -Path "$base\app\globals.css"


# -------------------- 3. tailwind.config.ts --------------------
$tailwind = @'
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { bg: "#0B1120", accent: "#00A8E8" },
      boxShadow: { glow: "0 10px 40px rgba(0,168,232,0.15)" }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;
'@
$tailwind | Set-Content -Encoding UTF8 -Path "$base\tailwind.config.ts"


# -------------------- 4. Marketing layout --------------------
$layout = @'
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
'@
$layout | Set-Content -Encoding UTF8 -Path "$base\app\(marketing)\layout.tsx"


# -------------------- 5. Landing page --------------------
$landing = @'
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0b1120_0%,#070b17_60%,#05070e_100%)]" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/arjunai-logo.svg" width={40} height={40} alt="ArjunAI" />
            <div>
              <div className="text-xl font-semibold">ArjunAI</div>
              <div className="text-sm text-slate-300 -mt-0.5">Where prompts hit the target.</div>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/api/auth/signin" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">Sign In</Link>
            <Link href="/app" className="px-4 py-2 rounded-xl bg-accent text-black font-medium shadow-glow flex items-center gap-2">Try Now <ArrowRight size={16} /></Link>
          </nav>
        </header>
      </div>
    </main>
  );
}
'@
$landing | Set-Content -Encoding UTF8 -Path "$base\app\(marketing)\page.tsx"


# -------------------- 6. Workspace page --------------------
$workspacePage = @'
"use client";
import WorkspaceShell from "@/components/WorkspaceShell";
export default function AppPage(){ return <WorkspaceShell/>; }
'@
$workspacePage | Set-Content -Encoding UTF8 -Path "$base\app\app\page.tsx"


# -------------------- 7. WorkspaceShell component --------------------
$workspaceShell = @'
"use client";
import { useState } from "react";
import SidebarHistory from "./SidebarHistory";
import EditorPane from "./EditorPane";
import PreviewPane from "./PreviewPane";
import AssistantChat from "./AssistantChat";
import VerifiedBadge from "./VerifiedBadge";
import RegenerateFixButtons from "./RegenerateFixButtons";

export default function WorkspaceShell(){
  const [mode, setMode] = useState<'code'|'live'|'logic'>('live');
  return (
    <div className="grid grid-cols-12 gap-3 p-3 h-[calc(100dvh-24px)] text-white">
      <aside className="col-span-3 rounded-2xl bg-white/5 p-3 overflow-auto"><SidebarHistory /></aside>
      <main className="col-span-6 grid grid-rows-[auto_1fr_auto] gap-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Editor & Preview</div>
          <div className="flex gap-2">
            {['code','live','logic'].map(m => (
              <button key={m} onClick={()=>setMode(m as any)} className={`px-3 py-1.5 rounded-xl ${mode===m?'bg-accent text-black':'bg-white/10'}`}>{m}</button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-2 overflow-hidden">
          {mode==='code' && <EditorPane/>}
          {mode==='live' && <PreviewPane/>}
          {mode==='logic' && <div className="p-4 text-slate-200"><div id="logic-explain"/></div>}
        </div>
        <div className="flex items-center justify-between">
          <VerifiedBadge />
          <RegenerateFixButtons />
        </div>
      </main>
      <aside className="col-span-3 rounded-2xl bg-white/5 p-3 overflow-auto"><AssistantChat /></aside>
    </div>
  );
}
'@
$workspaceShell | Set-Content -Encoding UTF8 -Path "$base\components\WorkspaceShell.tsx"


# -------------------- 8. SidebarHistory component --------------------
$sidebar = @'
"use client";
import { useEffect, useState } from "react";
import { History } from "lucide-react";

export default function SidebarHistory(){
  const [items,setItems] = useState<{id:string,prompt:string,createdAt:string}[]>([]);
  useEffect(()=>{ (async()=>{
    const res = await fetch("/api/history",{ cache:"no-store"}).catch(()=>null);
    const data = await res?.json().catch(()=>[]);
    setItems(data||[]);
  })(); },[]);
  return (
    <div>
      <div className="flex items-center gap-2 mb-3"><History size={16}/> <b>Project History</b></div>
      <ul className="space-y-2">
        {items.map(it=> (
          <li key={it.id} className="bg-white/5 rounded-xl p-2 text-sm cursor-pointer hover:bg-white/10" onClick={()=>location.href=`/app?load=${it.id}`}>
            <div className="line-clamp-2">{it.prompt}</div>
            <div className="text-xs text-slate-400 mt-1">{new Date(it.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
'@
$sidebar | Set-Content -Encoding UTF8 -Path "$base\components\SidebarHistory.tsx"


Write-Host "✅ All ArjunAI frontend files created successfully!"
