"use client";
import { useEffect, useRef } from "react";

export default function PreviewPane() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (e.data?.type === "HTML_PREVIEW" && iframeRef.current) {
        const doc = iframeRef.current.contentDocument!;
        doc.open();
        doc.write(e.data.payload);
        doc.close();
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);

  return <iframe ref={iframeRef} title="preview" className="w-full h-[65vh] rounded-xl bg-white" />;
}
