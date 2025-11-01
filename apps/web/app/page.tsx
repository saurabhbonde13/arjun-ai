// apps/web/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  else redirect("/workspace");

  return (
    <main className="flex h-screen items-center justify-center bg-[#0B1120] text-white">
      <p>Redirecting...</p>
    </main>
  );
}
