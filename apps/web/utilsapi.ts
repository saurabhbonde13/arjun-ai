export async function generateApp(prompt: string, provider: string = "auto") {
  const res = await fetch("http://localhost:5000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, provider }),
  });

  if (!res.ok) {
    throw new Error("Generation failed");
  }

  const data = await res.json();
  return data.result;
}
