import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

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

function pickString(val) {
  return typeof val === 'string' ? val : '';
}

function setJson(res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
}

function isValidPublicKey(key) {
  return PUBLIC_KEY_REGEX.test(key);
}

function sanitizeProfile(raw) {
  // This is intentionally strict: only expose approved fields.
  const name = pickString(raw?.name);
  const bloodGroup = pickString(raw?.bloodGroup || raw?.bloodgroup);
  const address = pickString(raw?.address);

  // allergies: accept string or array or object
  let allergies = [];
  if (Array.isArray(raw?.allergies)) {
    allergies = raw.allergies
      .map((a) => (typeof a === 'string' ? a : (a?.allergen || a?.name)))
      .filter(Boolean);
  } else if (typeof raw?.allergies === 'string') {
    allergies = raw.allergies.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (raw?.allergies && typeof raw.allergies === 'object') {
    allergies = Object.values(raw.allergies)
      .map((a) => (typeof a === 'string' ? a : (a?.allergen || a?.name)))
      .filter(Boolean);
  }

  // medicalNotes: accept list<string> or string
  let medicalNotes = [];
  if (Array.isArray(raw?.medicalNotes)) {
    medicalNotes = raw.medicalNotes.filter((x) => typeof x === 'string');
  } else if (typeof raw?.medicalNotes === 'string') {
    medicalNotes = raw.medicalNotes.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  // emergencyContacts: accept list of {name, phone} or object map
  let emergencyContacts = [];
  const contacts = raw?.emergencyContacts || raw?.emergencyContact || raw?.emergencyContactsList;
  if (Array.isArray(contacts)) {
    emergencyContacts = contacts
      .map((c) => ({ name: pickString(c?.name), phone: pickString(c?.phone) }))
      .filter((c) => c.name || c.phone);
  } else if (contacts && typeof contacts === 'object') {
    emergencyContacts = Object.values(contacts)
      .map((c) => ({ name: pickString(c?.name), phone: pickString(c?.phone) }))
      .filter((c) => c.name || c.phone);
  }

  return {
    name,
    bloodGroup,
    allergies,
    emergencyContacts,
    address,
    medicalNotes
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET');
      setJson(res);
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    const key = typeof req.query?.key === 'string' ? req.query.key : '';
    const token = typeof req.query?.t === 'string' ? req.query.t : '';

    if (!key || !token) {
      res.statusCode = 400;
      setJson(res);
      res.end(JSON.stringify({ error: 'Missing key or token' }));
      return;
    }

    if (!isValidPublicKey(key) || token.length > 4096) {
      res.statusCode = 400;
      setJson(res);
      res.end(JSON.stringify({ error: 'Invalid request' }));
      return;
    }

    let payload;
    try {
      payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    } catch {
      res.statusCode = 401;
      setJson(res);
      res.end(JSON.stringify({ error: 'Invalid or expired token' }));
      return;
    }

    if (!payload || payload.k !== key) {
      res.statusCode = 401;
      setJson(res);
      res.end(JSON.stringify({ error: 'Token does not match key' }));
      return;
    }

    const app = getAdminApp();

    // Map publicKey -> uid
    const db = app.firestore();
    const mappingDoc = await db.collection('publicKeys').doc(key).get();
    const mapping = mappingDoc.data();
    const uid = mapping?.uid;
    if (!uid) {
      res.statusCode = 404;
      setJson(res);
      res.end(JSON.stringify({ error: 'Unknown key' }));
      return;
    }

    // Profile (Firestore: users/{uid})
    const profileDoc = await db.collection('users').doc(uid).get();
    const rawProfile = profileDoc.data();
    if (!rawProfile) {
      res.statusCode = 404;
      setJson(res);
      res.end(JSON.stringify({ error: 'Profile not found' }));
      return;
    }

    setJson(res);
    res.statusCode = 200;
    res.end(JSON.stringify({ key, profile: sanitizeProfile(rawProfile) }));
  } catch (e) {
    console.error('profile handler failed', e);
    setJson(res);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
}
