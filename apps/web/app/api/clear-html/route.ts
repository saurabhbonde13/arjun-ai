import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), "public", "test.html");
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      console.log("🧹 Deleted old test.html");
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing test.html:", error);
    return NextResponse.json({ success: false, error });
  }
}
