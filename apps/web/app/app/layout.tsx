import "../globals.css";

export const metadata = {
  title: "ArjunAI Workspace",
  description: "Build and preview full-stack apps instantly.",
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-[#0B1120] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
