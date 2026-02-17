import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Allow', 'POST');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    const idToken = match?.[1];
    if (!idToken) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Missing Authorization Bearer token' }));
      return;
    }

    const app = getAdminApp();
    const decoded = await app.auth().verifyIdToken(idToken);
    const uid = decoded?.uid;
    if (!uid) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Invalid Firebase ID token' }));
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const requestedKey = typeof body.publicKey === 'string' ? body.publicKey.trim() : '';
    const publicKey = requestedKey || generatePublicKey();

    // Map publicKey -> uid (hides uid in the URL)
    const now = Date.now();
    const db = app.firestore();
    const mappingRef = db.collection('publicKeys').doc(publicKey);
    await mappingRef.set(
      {
        uid,
        updatedAt: now,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    const token = jwt.sign({ k: publicKey }, getJwtSecret(), { expiresIn: '3h' });

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = `${proto}://${host}`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        publicKey,
        expiresInSeconds: 3 * 60 * 60,
        token,
        url: `${origin}/e/${encodeURIComponent(publicKey)}?t=${encodeURIComponent(token)}`
      })
    );
  } catch (e) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e?.message || 'Internal error' }));
  }
}
