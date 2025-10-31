import "./globals.css";
import type { Metadata } from "next";
import SessionProviderWrapper from "@/components/SessionProviderWrapper"; // ✅ Import provider

export const metadata: Metadata = {
  title: "ArjunAI",
  description: "Where prompts hit the target 🎯",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B1120] text-white antialiased font-sans">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
