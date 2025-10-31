"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

export default function EditorPane() {
  const [code, setCode] = useState("// Your generated code will appear here\n");

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "CODE_UPDATE") setCode(e.data.payload);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div className="h-[65vh]">
      <Editor height="100%" defaultLanguage="typescript" value={code} onChange={(v) => setCode(v || "")} />
    </div>
  );
}
