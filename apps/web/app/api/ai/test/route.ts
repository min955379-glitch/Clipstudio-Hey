import { NextRequest, NextResponse } from 'next/server';

// Only these fixed providers may be contacted. Never return provider error bodies,
// which might contain credentials. No keys or responses are persisted or logged.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  // Compare against the public Host header: nextUrl can contain an internal
  // listening address behind a reverse proxy. Browsers cannot forge Host.
  try {
    const parsed = new URL(origin || '');
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.host !== request.headers.get('host')) throw new Error();
  } catch { return reply({ error: 'Request origin is not allowed.' }, 403); }
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 4096) return reply({ error: 'Request is too large.' }, 413);
  let data: unknown;
  try { const raw = await request.text(); if (raw.length > 4096) return reply({ error: 'Request is too large.' }, 413); data = JSON.parse(raw); }
  catch { return reply({ error: 'Invalid request.' }, 400); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return reply({ error: 'Invalid request.' }, 400);
  const { provider, key, accountId } = data as Record<string, unknown>;
  if (!['groq', 'gemini', 'cloudflare'].includes(String(provider)) || typeof key !== 'string' || key.length < 1 || key.length > 512 || /\s/.test(key)) return reply({ error: 'Enter a valid key without spaces.' }, 400);
  if (provider === 'cloudflare' && (typeof accountId !== 'string' || !/^[a-fA-F0-9]{32}$/.test(accountId))) return reply({ error: 'Enter your 32-character Cloudflare account ID.' }, 400);
  const endpoints: Record<string, string> = {
    groq: 'https://api.groq.com/openai/v1/models',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
    cloudflare: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/models/search?per_page=50`,
  };
  const headers: Record<string, string> = provider === 'gemini' ? { 'x-goog-api-key': key } : { Authorization: `Bearer ${key}` };
  try {
    const response = await fetch(endpoints[String(provider)], { headers, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000) });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) return reply({ error: 'The provider rejected this key or its permissions. Check the key and account access.' }, 400);
      if (response.status === 429) return reply({ error: 'The provider is rate limiting requests. Try again later.' }, 429);
      return reply({ error: 'The provider could not complete the test. Check your account details and try again.' }, 502);
    }
    const result = await response.json();
    if (provider === 'cloudflare' && result.success !== true) return reply({ error: 'Cloudflare could not verify this account or token.' }, 400);
    return reply({ ok: true, message: 'Key verified with the provider. It has not been saved.' });
  } catch { return reply({ error: 'Could not reach the provider. Please try again later.' }, 502); }
}
