import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const PUBLIC_KEY_REGEX = /^HID-[A-Z0-9_-]{8,64}$/;

function getAdminApp() {
  if (admin.apps?.length) return admin.app();

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY env var (stringified JSON service account)');
  }

  const credential = admin.credential.cert(JSON.parse(serviceAccountJson));
  return admin.initializeApp({ credential });
}

function getJwtSecret() {
  const secret = process.env.PROFILE_JWT_SECRET;
  if (!secret) throw new Error('Missing PROFILE_JWT_SECRET env var');
  return secret;
}

function generatePublicKey() {
  // URL-safe, crypto-secure
  const b = crypto.randomBytes(8).toString('base64url').toUpperCase();
  return `HID-${b}`;
}

function isValidPublicKey(key) {
  return PUBLIC_KEY_REGEX.test(key);
}

function sanitizeOrigin(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  const proto = forwardedProto === 'http' || forwardedProto === 'https' ? forwardedProto : 'https';
  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const host = rawHost.replace(/[^a-zA-Z0-9.\-:]/g, '');
  if (!host) return '';
  return `${proto}://${host}`;
}

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

    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    const idToken = match?.[1];
    if (!idToken) {
      res.statusCode = 401;
      setJson(res);
      res.end(JSON.stringify({ error: 'Missing Authorization Bearer token' }));
      return;
    }

    const app = getAdminApp();
    const decoded = await app.auth().verifyIdToken(idToken);
    const uid = decoded?.uid;
    if (!uid) {
      res.statusCode = 401;
      setJson(res);
      res.end(JSON.stringify({ error: 'Invalid Firebase ID token' }));
      return;
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
    const requestedKey = typeof body.publicKey === 'string' ? body.publicKey.trim() : '';
    if (requestedKey && !isValidPublicKey(requestedKey)) {
      res.statusCode = 400;
      setJson(res);
      res.end(JSON.stringify({ error: 'Invalid public key format' }));
      return;
    }

    const db = app.firestore();
    let publicKey = requestedKey;

    if (!publicKey) {
      // Retry a few times to avoid rare key collisions.
      for (let i = 0; i < 5; i += 1) {
        const candidate = generatePublicKey();
        const existing = await db.collection('publicKeys').doc(candidate).get();
        if (!existing.exists) {
          publicKey = candidate;
          break;
        }
      }
      if (!publicKey) {
        res.statusCode = 503;
        setJson(res);
        res.end(JSON.stringify({ error: 'Unable to allocate key' }));
        return;
      }
    }

    // Map publicKey -> uid (hides uid in the URL). Do not allow cross-user key takeover.
    const now = Date.now();
    const mappingRef = db.collection('publicKeys').doc(publicKey);
    const existing = await mappingRef.get();
    const existingUid = existing.data()?.uid;
    if (existingUid && existingUid !== uid) {
      res.statusCode = 409;
      setJson(res);
      res.end(JSON.stringify({ error: 'Public key already in use' }));
      return;
    }

    await mappingRef.set(
      { uid, updatedAt: now, createdAt: existing.exists ? existing.data()?.createdAt : admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    const token = jwt.sign({ k: publicKey }, getJwtSecret(), { expiresIn: '3h', algorithm: 'HS256' });

    const origin = sanitizeOrigin(req);
    const url = origin
      ? `${origin}/e/${encodeURIComponent(publicKey)}?t=${encodeURIComponent(token)}`
      : '';

    setJson(res);
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        publicKey,
        expiresInSeconds: 3 * 60 * 60,
        token,
        url
      })
    );
  } catch (e) {
    console.error('mint handler failed', e);
    setJson(res);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
}
