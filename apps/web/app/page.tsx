// apps/web/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // 🔒 Not logged in → redirect to login
    redirect("/login");
  } else {
    // ✅ Logged in → go to workspace
    redirect("/workspace");
  }

  return (
    <main className="flex items-center justify-center h-screen bg-[#0B1120] text-white">
      <p>Redirecting...</p>
    </main>
  );
}
