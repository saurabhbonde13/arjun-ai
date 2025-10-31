import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

export async function POST(request: Request) {
  try {
    const { html, projectId } = await request.json();
    const dirPath = path.join(process.cwd(), "public", "projects");
    await fs.ensureDir(dirPath);

    const fileName = `${projectId || Date.now()}.html`;
    const filePath = path.join(dirPath, fileName);

    await fs.writeFile(filePath, html, "utf-8");
    console.log(`✅ Project saved: ${fileName}`);

    return NextResponse.json({ success: true, path: `/projects/${fileName}` });
  } catch (error) {
    console.error("❌ Error saving HTML:", error);
    return NextResponse.json({ success: false, error });
  }
}
