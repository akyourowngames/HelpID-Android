// Server-only Gemini proxy (keeps API key secret in Vercel env)
// POST /api/gemini  { prompt: string }

import fetch from 'node-fetch';

const MAX_PROMPT_CHARS = 4000;
const GEMINI_TIMEOUT_MS = 15000;

function setJson(res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Allow', 'POST');
      setJson(res);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      setJson(res);
      res.end(JSON.stringify({ error: 'Missing GEMINI_API_KEY env var' }));
      return;
    }
    const proxyToken = process.env.GEMINI_PROXY_TOKEN;
    if (proxyToken) {
        const authHeader = String(req.headers.authorization || '');
        const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1] || '';
        if (token !== proxyToken) {
          res.statusCode = 401;
          setJson(res);
          res.end(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }
    }

    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    } catch {
      res.statusCode = 400;
      setJson(res);
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt.trim()) {
      res.statusCode = 400;
      setJson(res);
      res.end(JSON.stringify({ error: 'Missing prompt' }));
      return;
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
      res.statusCode = 413;
      setJson(res);
      res.end(JSON.stringify({ error: `Prompt too long (max ${MAX_PROMPT_CHARS} chars)` }));
      return;
    }

    // Gemini v1beta generateContent
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await r.json().catch(() => ({ error: 'Invalid upstream response' }));

    res.statusCode = r.ok ? 200 : r.status;
    setJson(res);
    res.end(JSON.stringify({ ok: r.ok, data }));
  } catch (e) {
    if (e?.name === 'AbortError') {
      res.statusCode = 504;
      setJson(res);
      res.end(JSON.stringify({ error: 'Upstream timeout' }));
      return;
    }
    console.error('gemini handler failed', e);
    res.statusCode = 500;
    setJson(res);
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
}
