// apps/web/lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // keep a stable id on the token
        token.id = (account as any).providerAccountId || token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      // attach id on session.user (don’t rely on types)
      if (session?.user) {
        (session.user as any).id = (token as any)?.id ?? (token as any)?.sub ?? null;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
} as any; // <-- remove type friction across next-auth versions
