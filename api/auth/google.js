/**
 * Trading-OS v2.0 Production Google OAuth Initiation Endpoint
 * Generates cryptographically signed CSRF state and redirects to Google OAuth Authorization Server
 */

import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const authSecret = process.env.AUTH_SECRET || "trading_os_production_auth_secret_2026";

  if (!clientId || !clientSecret || clientId.trim().length < 5 || clientSecret.trim().length < 5) {
    // If request wants JSON, return JSON, else redirect with error query
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(400).json({
        error: "Google sign-in is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
      });
    }
    return res.redirect(302, '/?error=google_not_configured');
  }

  // Determine callback URL
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const defaultCallback = `${proto}://${host}/api/auth/google/callback`;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || defaultCallback;

  // Generate cryptographically signed CSRF state
  const nonce = crypto.randomBytes(16).toString('hex');
  const returnUrl = req.query.returnUrl && req.query.returnUrl.startsWith('/') ? req.query.returnUrl : '/';
  const statePayload = Buffer.from(JSON.stringify({ nonce, ts: Date.now(), returnUrl })).toString('base64url');
  const stateSignature = crypto.createHmac('sha256', authSecret).update(statePayload).digest('base64url');
  const state = `${statePayload}.${stateSignature}`;

  // Set HTTP-Only Secure cookie for state validation
  const isProd = process.env.NODE_ENV === 'production' || (req.headers['x-forwarded-proto'] === 'https');
  const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; Max-Age=600${isProd ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', `trading_os_oauth_state=${state}; ${cookieOptions}`);

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId.trim());
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl.trim());
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return res.redirect(302, googleAuthUrl.toString());
}
