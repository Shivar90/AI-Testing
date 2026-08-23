// Vercel serverless function: server-side Groq proxy.
//
// OWASP-aligned pattern for protecting the Groq API key on a public Vercel
// deployment: the key lives ONLY in a Vercel environment variable
// (GROQ_API_KEY) and is never sent to or stored in the browser. The client
// posts the analysis request here; this function calls Groq and returns the
// result. No persistence, no auth needed beyond the key being server-side.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Only allow POST.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: 'GROQ_API_KEY is not configured on the server.' });
  }

  const { model, messages } = req.body ?? {};

  // Basic shape validation — never forward arbitrary body contents blindly.
  if (
    typeof model !== 'string' ||
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    return res.status(400).json({ error: 'Invalid request body.' });
  }

  try {
    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: data?.error?.message ?? 'Groq request failed.' });
    }

    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ error: 'Could not reach Groq.' });
  }
}
