import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs-extra";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import fetch from "node-fetch";
import archiver from "archiver";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

// ✅ Serve generated HTML files
app.use(
  "/projects",
  express.static(path.join(process.cwd(), "public", "projects"))
);

const PORT = process.env.PORT || 5000;
const CLAUDE_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";

if (!CLAUDE_KEY) {
  console.error("❌ Missing CLAUDE_API_KEY in .env");
  process.exit(1);
}

const client = new Anthropic({ apiKey: CLAUDE_KEY });
console.log("✅ Claude key loaded successfully");

// ------------------------------------------------------
// 🌍 Health Check
// ------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ------------------------------------------------------
// 🗑️ Delete a Project
// ------------------------------------------------------
app.post("/api/delete", async (req: Request, res: Response) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: "Missing filePath" });
  try {
    await fs.remove(path.join(process.cwd(), "public", filePath));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ------------------------------------------------------
// 🧠 Generate Project (Restored Clarification Logic)
// ------------------------------------------------------
app.post("/api/generate", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const projectId = Date.now().toString();
  const projectDir = path.join(process.cwd(), "public", "projects");
  await fs.ensureDir(projectDir);
  const filePath = path.join(projectDir, `${projectId}.html`);

  console.log(`🧠 Generating website for: "${prompt}"`);

  try {
    // 🧩 Step 1: Ask Claude to check if the prompt is clear
    const clarifyRes = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `The user said: "${prompt}". 
If the prompt is vague, respond ONLY in JSON like this:
{"clarify": true, "question": "Ask one follow-up question"}.
If it is clear enough to generate, respond ONLY in JSON:
{"clarify": false}.`,
        },
      ],
    });

    const clarifyTextBlock = clarifyRes.content.find(
      (b: any) => b.type === "text"
    ) as { text?: string } | undefined;
    const clarifyText = clarifyTextBlock?.text?.trim() || "{}";

    let clarify: { clarify: boolean; question?: string };
    try {
      clarify = JSON.parse(clarifyText);
    } catch {
      clarify = { clarify: false };
    }

    // 🧠 Step 2: If Claude requests clarification → ask user
    if (clarify.clarify && clarify.question) {
      console.log("🧩 Claude needs clarification:", clarify.question);
      return res.json({ question: clarify.question });
    }

    // 🧩 Step 3: Generate full HTML website
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Generate a complete, production-ready HTML5 website for this idea:
"${prompt}"

Requirements:
- Include full <html>, <head>, <style>, and <body>.
- Use modern, elegant responsive design.
- Avoid markdown or backticks.`,
        },
      ],
    });

    const textBlock = response.content.find(
      (b: any) => b.type === "text"
    ) as { text?: string } | undefined;
    const html = textBlock?.text?.trim() || "";

    if (!html.includes("<html") || !html.includes("<body")) {
      throw new Error("Claude did not return valid HTML.");
    }

    await fs.writeFile(filePath, html);
    console.log(`✅ Generated website saved at: ${filePath}`);

    res.json({
      success: true,
      result: html,
      filePath: `projects/${projectId}.html`,
    });
  } catch (error: any) {
    console.error("❌ Generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------
// 💾 Auto-save edits
// ------------------------------------------------------
app.post("/api/save-html", async (req: Request, res: Response) => {
  const { id, html } = req.body;
  if (!id || !html) return res.status(400).json({ error: "Missing id or html" });

  const filePath = path.join(process.cwd(), "public", "projects", `${id}.html`);
  try {
    await fs.outputFile(filePath, html);
    console.log(`💾 Auto-saved project ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Save error:", err);
    res.status(500).json({ error: "Failed to save HTML" });
  }
});

// ------------------------------------------------------
// 💬 Chat Persistence
// ------------------------------------------------------
app.post("/api/save-chat", async (req: Request, res: Response) => {
  const { file, chat } = req.body;
  if (!file || !Array.isArray(chat))
    return res.status(400).json({ error: "Invalid request" });

  const chatFile = path.join(process.cwd(), "public", "projects", "chatHistory.json");
  let chatData: Record<string, any> = {};

  try {
    if (await fs.pathExists(chatFile)) {
      chatData = JSON.parse(await fs.readFile(chatFile, "utf-8"));
    }

    chatData[file] = chat;
    await fs.writeFile(chatFile, JSON.stringify(chatData, null, 2));

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving chat:", err);
    res.status(500).json({ error: "Failed to save chat" });
  }
});

app.get("/api/project/chat", async (req: Request, res: Response) => {
  const file = req.query.file as string;
  if (!file) return res.status(400).json({ error: "Missing file parameter" });

  const chatFile = path.join(process.cwd(), "public", "projects", "chatHistory.json");
  try {
    if (!(await fs.pathExists(chatFile))) {
      return res.json({ chat: [] });
    }

    const chatData = JSON.parse(await fs.readFile(chatFile, "utf-8"));
    const chat = chatData[file] || [];
    res.json({ chat });
  } catch (err) {
    console.error("❌ Error reading chat:", err);
    res.status(500).json({ error: "Failed to load chat" });
  }
});

// ------------------------------------------------------
// 🚀 DEPLOYMENT ROUTES (GitHub + Vercel + ZIP)
// ------------------------------------------------------

// ✅ Deploy to GitHub
app.post("/api/deploy/github", async (req: Request, res: Response) => {
  const { token, repoName, html } = req.body;
  if (!token || !repoName || !html)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const repoRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        description: "Generated by ArjunAI 🚀",
        auto_init: true,
      }),
    });

    const repo = (await repoRes.json()) as any;
    if (!repo.full_name) throw new Error(repo.message || "Failed to create repo");

    const content = Buffer.from(html).toString("base64");
    const uploadRes = await fetch(
      `https://api.github.com/repos/${repo.full_name}/contents/index.html`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Add generated website via ArjunAI",
          content,
        }),
      }
    );

    const uploadData: any = await uploadRes.json();
    if (!uploadData.commit)
      throw new Error(uploadData.message || "Failed to upload file");

    res.json({
      success: true,
      repoUrl: repo.html_url,
      message: "✅ Repo created and HTML uploaded successfully!",
    });
  } catch (error: any) {
    console.error("❌ GitHub deployment error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Deploy to Vercel
app.post("/api/deploy/vercel", async (req: Request, res: Response) => {
  const { html, projectName, vercelToken } = req.body;
  if (!html || !projectName || !vercelToken)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        files: [
          {
            file: "index.html",
            data: html,
          },
        ],
        target: "production",
      }),
    });

    const data: any = await response.json();
    if (data.error) throw new Error(data.error.message || "Vercel deployment failed");

    res.json({
      success: true,
      url: data.url ? `https://${data.url}` : null,
    });
  } catch (error: any) {
    console.error("❌ Vercel deployment error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Export as ZIP
app.post("/api/deploy/zip", async (req: Request, res: Response) => {
  const { html, projectName } = req.body;
  if (!html || !projectName)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const tmpDir = path.join(process.cwd(), "tmp", projectName);
    await fs.ensureDir(tmpDir);
    const htmlPath = path.join(tmpDir, "index.html");
    await fs.writeFile(htmlPath, html);

    const zipPath = path.join(tmpDir, `${projectName}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);
    archive.file(htmlPath, { name: "index.html" });
    await archive.finalize();

    output.on("close", () => {
      console.log(`📦 ZIP created: ${zipPath}`);
      res.download(zipPath);
    });
  } catch (error: any) {
    console.error("❌ ZIP export error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend running: http://localhost:${PORT}`);
  console.log(`📂 Serving from: ${path.join(process.cwd(), "public", "projects")}`);
});
