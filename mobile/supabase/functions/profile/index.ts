import { createClient } from 'npm:@supabase/supabase-js@2';
import { jwtVerify } from 'npm:jose@5';

const KEY_REGEX = /^HID-[A-Z0-9_-]{8,64}$/;
const SECURITY_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

type ProfileRow = {
  id: string;
  name: string | null;
  blood_group: string | null;
  address: string | null;
  allergies: string[] | null;
  medical_notes: string[] | null;
  emergency_contacts: { name?: string; phone?: string }[] | null;
};

async function resolveSecret(admin: ReturnType<typeof createClient>): Promise<string | null> {
  const envSecret = Deno.env.get('PROFILE_JWT_SECRET');
  if (envSecret && envSecret.length >= 32) return envSecret;
  const { data } = await admin
    .from('app_secrets')
    .select('value')
    .eq('name', 'profile_jwt_secret')
    .maybeSingle();
  const value = typeof data?.value === 'string' ? data.value : '';
  return value.length >= 32 ? value : null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function errorPage(status: number, message: string): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HelpID</title><style>body{font-family:system-ui,sans-serif;background:#faf9f7;color:#1c1b1a;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:420px;text-align:center}h1{font-size:20px;margin:0 0 8px}p{color:#6e6a67;font-size:14px;line-height:1.5}</style></head><body><main><h1>HelpID</h1><p>${escapeHtml(message)}</p></main></body></html>`,
    { status, headers: SECURITY_HEADERS },
  );
}

function profilePage(profile: ProfileRow, publicKey: string): Response {
  const allergies = (profile.allergies ?? []).filter(Boolean);
  const notes = (profile.medical_notes ?? []).filter(Boolean);
  const contacts = (profile.emergency_contacts ?? [])
    .filter((c) => c?.name || c?.phone)
    .map(
      (c) =>
        `<li><span>${escapeHtml(c.name ?? '')}</span><a href="tel:${escapeHtml((c.phone ?? '').replace(/[^\d+*#]/g, ''))}">${escapeHtml(c.phone ?? '')}</a></li>`,
    )
    .join('');

  const section = (title: string, inner: string) =>
    `<section><h2>${title}</h2>${inner}</section>`;

  return new Response(
    `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HelpID emergency card</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: "Segoe UI", system-ui, -apple-system, sans-serif; background:#faf9f7; color:#1c1b1a; }
  main { max-width: 560px; margin: 0 auto; padding: 28px 20px 48px; }
  .brand { display:flex; align-items:center; gap:8px; font-weight:800; letter-spacing:.2px; }
  .mark { width:28px;height:28px;border-radius:9px;background:#c62828;display:grid;place-items:center;color:#fff;font-size:14px; }
  .eyebrow { margin-top:28px; color:#c62828; font-size:11px; letter-spacing:1.6px; font-weight:700; }
  h1 { font-size:30px; letter-spacing:-.8px; margin:6px 0 10px; }
  .blood { display:inline-block; background:#c62828; color:#fff; font-weight:800; padding:6px 12px; border-radius:8px; font-size:14px; }
  .meta { color:#6e6a67; font-size:12px; margin-top:10px; }
  section { background:#fff; border:1px solid #e8e3de; border-radius:16px; padding:16px; margin-top:16px; }
  h2 { font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#6e6a67; margin:0 0 10px; }
  p, li, span { font-size:14px; line-height:1.5; }
  p { margin:0; }
  ul { margin:0; padding:0; list-style:none; display:grid; gap:8px; }
  li { display:flex; justify-content:space-between; gap:12px; }
  a { color:#c62828; text-decoration:none; font-weight:600; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; }
  .chip { background:#fbeae9; border:1px solid #f1ccc9; color:#a31f1f; padding:4px 9px; border-radius:999px; font-size:12px; }
  .muted { color:#9a948f; font-size:13px; }
  footer { margin-top:22px; text-align:center; color:#9a948f; font-size:11px; line-height:1.6; }
  .key { font-family: ui-monospace, Menlo, monospace; font-size:11px; color:#6e6a67; }
</style></head>
<body><main>
  <div class="brand"><div class="mark">+</div>HelpID</div>
  <div class="eyebrow">EMERGENCY MEDICAL PROFILE</div>
  <h1>${escapeHtml(profile.name ?? 'Unnamed profile')}</h1>
  <span class="blood">${escapeHtml(profile.blood_group ?? 'Blood group not set')}</span>
  <div class="meta">Public key <span class="key">${escapeHtml(publicKey)}</span></div>

  ${section(
    'Emergency contacts',
    contacts ? `<ul>${contacts}</ul>` : '<p class="muted">No contacts listed.</p>',
  )}
  ${section(
    'Allergies',
    allergies.length
      ? `<div class="chips">${allergies.map((a) => `<span class="chip">${escapeHtml(a)}</span>`).join('')}</div>`
      : '<p class="muted">None listed.</p>',
  )}
  ${section('Medical conditions', notes.length ? `<ul>${notes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>` : '<p class="muted">None listed.</p>')}
  ${section('Address', profile.address ? `<p>${escapeHtml(profile.address)}</p>` : '<p class="muted">Not provided.</p>')}

  <footer>HelpID supports responders. It does not replace emergency services.<br>This card is shared with a time-limited token. Do not index or cache it.</footer>
</main></body></html>`,
    { status: 200, headers: SECURITY_HEADERS },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'GET') return errorPage(405, 'Method not allowed.');

  const url = new URL(req.url);
  const key = url.searchParams.get('key') ?? '';
  const token = url.searchParams.get('t') ?? '';
  if (!key || !token) return errorPage(400, 'Missing key or token.');
  if (!KEY_REGEX.test(key) || token.length > 4096) return errorPage(400, 'Invalid request.');

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return errorPage(500, 'Server is not configured.');

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const jwtSecret = await resolveSecret(admin);
  if (!jwtSecret) return errorPage(500, 'Server is not configured.');

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret), {
      algorithms: ['HS256'],
    });
    if (payload.k !== key) return errorPage(401, 'Token does not match key.');
  } catch {
    return errorPage(401, 'This link is invalid or has expired.');
  }

  const { data: mapping } = await admin
    .from('public_keys')
    .select('uid')
    .eq('key', key)
    .maybeSingle();
  if (!mapping?.uid) return errorPage(404, 'Unknown emergency card.');

  const { data: profile } = await admin
    .from('profiles')
    .select('id,name,blood_group,address,allergies,medical_notes,emergency_contacts')
    .eq('id', mapping.uid)
    .maybeSingle();
  if (!profile) return errorPage(404, 'Emergency profile not found.');

  if (url.searchParams.get('format') === 'json') {
    return new Response(JSON.stringify({ key, profile }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  return profilePage(profile as ProfileRow, key);
});
