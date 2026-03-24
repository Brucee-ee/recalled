export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    // Parse body if it's a string (Vercel sometimes doesn't auto-parse)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // Override model to ensure we use a valid one
    body.model = "claude-sonnet-4-6";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Log error details for debugging
    if (!response.ok) {
      console.error("Anthropic error:", JSON.stringify(data));
    }

    return res.status(response.status).json(data);

  } catch (err) {
    console.error("Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}