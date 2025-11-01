// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.includes("/login") || url === baseUrl) {
        return `${baseUrl}/workspace`;
      }
      if (url.includes("/logout")) {
        return `${baseUrl}/login`;
      }
      return url.startsWith(baseUrl) ? url : `${baseUrl}/workspace`;
    },

    async session({ session }) {
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ Export the NextAuth handler with the same config
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
