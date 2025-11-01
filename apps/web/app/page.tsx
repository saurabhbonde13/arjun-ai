// apps/web/app/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function HomePage() {
  // ✅ Get the current session (NextAuth)
  const session = await getServerSession();

  // 🧭 If not logged in → go to /login
  if (!session) {
    redirect("/login");
  }

  // ✅ If logged in → go to /workspace
  redirect("/workspace");

  // Fallback (should never reach here)
  return (
    <main className="flex h-screen items-center justify-center bg-[#0B1120] text-white">
      <p>Redirecting...</p>
    </main>
  );
}
