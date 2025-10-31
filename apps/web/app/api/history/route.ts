import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder demo history data
  return NextResponse.json([
    { id: "demo-1", prompt: "Portfolio site for a designer", createdAt: new Date().toISOString() },
    { id: "demo-2", prompt: "Restaurant booking app", createdAt: new Date().toISOString() }
  ]);
}
