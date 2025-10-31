import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
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
    signIn: "/login",  // 👈 Login page
    signOut: "/login", // 👈 Logout always goes here
    error: "/login",   // 👈 Error page fallback
  },

  callbacks: {
    // ✅ Always force redirect to /workspace after login
    async redirect({ url, baseUrl }) {
      // if logging in, go to workspace
      if (url.includes("/login") || url === baseUrl) {
        return `${baseUrl}/workspace`;
      }
      // if logging out, go to login
      if (url.includes("/logout")) {
        return `${baseUrl}/login`;
      }
      return url.startsWith(baseUrl) ? url : `${baseUrl}/workspace`;
    },

    // ✅ Preserve session object
    async session({ session, token }) {
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
