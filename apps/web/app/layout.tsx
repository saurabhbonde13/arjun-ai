import "./globals.css";
import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";

// ✅ If you have session/auth providers, import them here
// import { SessionProviderWrapper } from "./providers/session-provider";

export const metadata: Metadata = {
  title: "ArjunAI — where prompts hit the target",
  description: "Generate production-ready apps from a single prompt.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ✅ body contains your entire site UI */}
      <body className="min-h-screen bg-surface text-ink antialiased font-sans">
        {/* ✅ Keep your session/auth provider wrapper if you use it */}
        {/* <SessionProviderWrapper> */}

        {/* ✅ Header and Footer wrap all pages */}
        <Header />
        <main className="pt-16">{children}</main>
        <Footer />

        {/* </SessionProviderWrapper> */}
      </body>
    </html>
  );
}
