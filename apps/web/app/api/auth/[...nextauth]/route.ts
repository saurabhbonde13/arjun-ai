// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next"; // works in App Router across v4/v5
import { authOptions } from "@/lib/authOptions";

// Avoid TS inference issues by casting to any
const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
