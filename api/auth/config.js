/**
 * Trading-OS v2.0 Public Authentication Configuration
 * Safely exposes whether Google OAuth is enabled and the public Client ID (never secret)
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const isGoogleConfigured = Boolean(
    clientId &&
    clientId.trim().length > 5 &&
    clientSecret &&
    clientSecret.trim().length > 5
  );

  return res.status(200).json({
    googleAuthEnabled: isGoogleConfigured,
    googleClientId: isGoogleConfigured ? clientId.trim() : null
  });
}
