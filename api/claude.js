// ============================================================
// api/claude.js — Vercel Serverless Function
//
// This file acts as a middleman between the app and Anthropic.
// The browser calls /api/claude, this function calls Anthropic
// using your secret key, then sends the response back.
//
// Your API key lives in Vercel's environment variables —
// it never touches the browser.
// ============================================================

export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Pull the API key from Vercel environment variables
  // You set this in the Vercel dashboard — never hardcode it here
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    // Forward the request body straight to Anthropic
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Send Anthropic's response back to the browser
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Failed to reach Anthropic" });
  }
}
