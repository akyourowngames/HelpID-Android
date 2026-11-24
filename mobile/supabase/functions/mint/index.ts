import { createClient } from 'npm:@supabase/supabase-js@2';
import { SignJWT } from 'npm:jose@5';

const KEY_REGEX = /^HID-[A-Z0-9_-]{8,64}$/;
const TOKEN_TTL_SECONDS = 60 * 60 * 24;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function generateKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  const encoded = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
    .toUpperCase();
  return `HID-${encoded}`;
}

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!/^Bearer\s+.+$/i.test(authHeader)) {
    return json({ error: 'Missing Authorization Bearer token' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: 'Server is not configured' }, 500);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const uid = userData?.user?.id;
  if (userError || !uid) return json({ error: 'Invalid Supabase session token' }, 401);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const jwtSecret = await resolveSecret(admin);
  if (!jwtSecret) return json({ error: 'Signing secret is not configured' }, 500);

  let body: { publicKey?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const requested = typeof body.publicKey === 'string' ? body.publicKey.trim() : '';
  let publicKey = '';

  if (requested) {
    if (!KEY_REGEX.test(requested)) return json({ error: 'Invalid public key format' }, 400);
    const { data: existing } = await admin
      .from('public_keys')
      .select('uid')
      .eq('key', requested)
      .maybeSingle();
    if (existing && existing.uid !== uid) return json({ error: 'Key not owned' }, 403);
    if (existing) publicKey = requested;
  }

  if (!publicKey) {
    const { data: own } = await admin
      .from('public_keys')
      .select('key')
      .eq('uid', uid)
      .maybeSingle();
    if (own?.key) publicKey = own.key;
  }

  if (!publicKey) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = generateKey();
      const { data: collision } = await admin
        .from('public_keys')
        .select('key')
        .eq('key', candidate)
        .maybeSingle();
      if (collision) continue;
      const { error } = await admin.from('public_keys').insert({ key: candidate, uid });
      if (!error) {
        publicKey = candidate;
        break;
      }
    }
  }

  if (!publicKey) return json({ error: 'Unable to allocate key' }, 503);

  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const token = await new SignJWT({ k: publicKey, sub: uid })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(new TextEncoder().encode(jwtSecret));

  const url = `${supabaseUrl}/functions/v1/profile?key=${encodeURIComponent(publicKey)}&t=${encodeURIComponent(token)}`;

  return json({ publicKey, token, url, expiresAt });
});
