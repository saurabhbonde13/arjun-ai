"use client";

import React, { useEffect, useRef } from "react";

interface LivePreviewProps {
  code: string;
  language?: string;
}

export default function LivePreview({ code, language }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;
    if (!doc) return;

    // Handle both HTML-only and full React code
    let html = code;

    if (language === "react" || code.includes("React")) {
      html = `
        <html>
          <head>
            <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
            <style>body { margin: 0; font-family: sans-serif; }</style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              ${code}
            </script>
          </body>
        </html>
      `;
    }

    doc.open();
    doc.write(html);
    doc.close();
  }, [code, language]);

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-gray-800">
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin"
        title="Live Preview"
      />
    </div>
  );
}
