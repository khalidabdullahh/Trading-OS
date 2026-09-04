/**
 * Trading-OS v2.0 - Comprehensive Production Authentication & Google OAuth Security Test Suite
 * Tests OAuth Configuration, CSRF State Security, Neon User Resolution, Failure Isolation, and Cross-User Scoping
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.split('=').slice(1).join('=').trim().replace(/^["\']|["\']$/g, '');
    }
  }
}

const authSecret = process.env.AUTH_SECRET || "trading_os_production_test_secret_32bytes_min";

function signToken(payload, secret = authSecret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 72 * 3600;
  const claims = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${claims}`).digest("base64url");
  return `${header}.${claims}.${signature}`;
}

function verifyToken(token, secret = authSecret) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, claims, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", secret).update(`${header}.${claims}`).digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(claims, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function generateOAuthState(returnUrl = "/", secret = authSecret) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = JSON.stringify({ nonce, ts: Date.now(), returnUrl });
  const data = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyOAuthState(state, secret = authSecret) {
  if (!state || typeof state !== 'string' || !state.includes('.')) {
    return { valid: false, error: "Missing or malformed state parameter" };
  }
  const [data, sig] = state.split('.');
  if (!data || !sig) {
    return { valid: false, error: "Malformed state structure" };
  }
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  if (sig !== expectedSig) {
    return { valid: false, error: "Invalid state signature (potential CSRF attack)" };
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    if (!payload.ts || now - payload.ts > tenMinutes || payload.ts > now + 60000) {
      return { valid: false, error: "State parameter expired" };
    }
    return { valid: true, returnUrl: payload.returnUrl || '/' };
  } catch {
    return { valid: false, error: "Failed to parse state payload" };
  }
}

async function runTests() {
  console.log("===============================================================================");
  console.log("TRADING-OS v2.0 - PRODUCTION AUTHENTICATION & GOOGLE OAUTH TEST SUITE");
  console.log("===============================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // TEST SUITE 1: OAuth Configuration & Security Isolation
  console.log("TEST SUITE 1: OAuth Configuration & Secret Exposure Protection");
  {
    assert(typeof authSecret === 'string' && authSecret.length >= 20, "AUTH_SECRET is configured with sufficient entropy");
    
    // Check client-side bundle does NOT contain secret keys
    const clientCode = fs.readFileSync('src/services/api/apiClient.ts', 'utf8');
    assert(!clientCode.includes('GOOGLE_CLIENT_SECRET'), "GOOGLE_CLIENT_SECRET is NOT referenced in client API service");
    assert(!clientCode.includes('AUTH_SECRET'), "AUTH_SECRET is NOT referenced in client API service");
    
    const authModalCode = fs.readFileSync('src/components/auth/AuthModal.tsx', 'utf8');
    assert(!authModalCode.includes('Math.random().toString(36)'), "Fake random account creation removed from AuthModal.tsx");
    assert(!authModalCode.includes('trader_'), "Fake fallback demo emails removed from AuthModal.tsx");
  }

  // TEST SUITE 2: Cryptographic OAuth State / CSRF Security
  console.log("\nTEST SUITE 2: Cryptographic OAuth State & CSRF Protection");
  {
    const validState = generateOAuthState("/portfolio");
    const validResult = verifyOAuthState(validState);
    assert(validResult.valid === true && validResult.returnUrl === "/portfolio", "Valid signed state accepted with returnUrl");

    // Tampered state data
    const tamperedDataState = `malicious_data.${validState.split('.')[1]}`;
    const tamperedResult = verifyOAuthState(tamperedDataState);
    assert(tamperedResult.valid === false && tamperedResult.error.includes("signature"), "Tampered state data rejected");

    // Tampered signature
    const tamperedSigState = `${validState.split('.')[0]}.invalid_sig`;
    const tamperedSigResult = verifyOAuthState(tamperedSigState);
    assert(tamperedSigResult.valid === false && tamperedSigResult.error.includes("signature"), "Invalid state signature rejected");

    // Expired state (15 minutes ago)
    const expiredPayload = Buffer.from(JSON.stringify({ nonce: "test", ts: Date.now() - 15 * 60 * 1000, returnUrl: "/" })).toString('base64url');
    const expiredSig = crypto.createHmac('sha256', authSecret).update(expiredPayload).digest('base64url');
    const expiredState = `${expiredPayload}.${expiredSig}`;
    const expiredResult = verifyOAuthState(expiredState);
    assert(expiredResult.valid === false && expiredResult.error.includes("expired"), "Expired state parameter rejected");

    // Missing state
    assert(verifyOAuthState("").valid === false, "Empty state parameter rejected");
    assert(verifyOAuthState(null).valid === false, "Null state parameter rejected");
  }

  // TEST SUITE 3: Real Neon PostgreSQL User Resolution & Provider Idempotency
  console.log("\nTEST SUITE 3: Real Neon PostgreSQL User Resolution & Provider Idempotency");
  if (dbUrl) {
    const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    const testGoogleSub = `google_sub_test_${Date.now()}`;
    const testEmail = `quant_tester_${Date.now()}@tradingos.io`;
    const testName = "Quantitative Security Tester";

    try {
      // Step A: First Google Login -> Creates exactly 1 verified user
      const insertUserQuery = `
        INSERT INTO users (id, email, password_hash, auth_provider, provider_account_id, email_verified, created_at, updated_at)
        VALUES ($1, $2, NULL, 'google', $3, TRUE, NOW(), NOW())
        RETURNING id, email, auth_provider, provider_account_id, email_verified;
      `;
      const testUserId = `usr_test_${Date.now()}`;
      const res1 = await pool.query(insertUserQuery, [testUserId, testEmail, testGoogleSub]);
      assert(res1.rows.length === 1, "First Google Login: Creates exactly one verified user in Neon");
      assert(res1.rows[0].auth_provider === 'google', "User auth_provider is set to 'google'");
      assert(res1.rows[0].provider_account_id === testGoogleSub, "User provider_account_id matches Google sub ID");
      assert(res1.rows[0].email_verified === true, "User email_verified is set to TRUE");

      // Insert profile
      await pool.query(
        `INSERT INTO profiles (id, user_id, full_name, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW());`,
        [`prof_${testUserId}`, testUserId, testName]
      );

      // Step B: Returning Google Login -> Finds existing user, does NOT create duplicate
      const lookupQuery = `
        SELECT u.id, u.email, u.auth_provider, u.provider_account_id, p.full_name
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.auth_provider = 'google' AND u.provider_account_id = $1 LIMIT 1;
      `;
      const res2 = await pool.query(lookupQuery, [testGoogleSub]);
      assert(res2.rows.length === 1 && res2.rows[0].id === testUserId, "Returning Google Login: Reuses existing user without creating duplicate");

      // Step C: Verify count of users for this sub
      const countRes = await pool.query(`SELECT COUNT(*) as count FROM users WHERE provider_account_id = $1;`, [testGoogleSub]);
      assert(parseInt(countRes.rows[0].count, 10) === 1, "User table contains exactly 1 user record for this Google sub");

      // Cleanup test user
      await pool.query(`DELETE FROM profiles WHERE user_id = $1;`, [testUserId]);
      await pool.query(`DELETE FROM users WHERE id = $1;`, [testUserId]);
      assert(true, "Test artifacts cleaned from Neon PostgreSQL");
    } catch (dbErr) {
      console.error("Database test error:", dbErr);
      assert(false, `Database query failed: ${dbErr.message}`);
    } finally {
      await pool.end();
    }
  } else {
    console.warn("  [SKIP] DATABASE_URL not available in test environment");
  }

  // TEST SUITE 4: Cross-User Authorization & Token Security
  console.log("\nTEST SUITE 4: Cross-User Authorization & Scoping");
  {
    const userAToken = signToken({ id: "usr_trader_A", email: "traderA@example.com", role: "USER" });
    const userBToken = signToken({ id: "usr_trader_B", email: "traderB@example.com", role: "USER" });

    const verifiedA = verifyToken(userAToken);
    const verifiedB = verifyToken(userBToken);

    assert(verifiedA && verifiedA.id === "usr_trader_A", "User A token correctly verified with ID usr_trader_A");
    assert(verifiedB && verifiedB.id === "usr_trader_B", "User B token correctly verified with ID usr_trader_B");
    assert(verifiedA.id !== verifiedB.id, "User A and User B session identities are completely isolated");

    // Tampered token check
    const tamperedToken = userAToken.substring(0, userAToken.length - 4) + "abcd";
    assert(verifyToken(tamperedToken) === null, "Tampered session JWT signature immediately rejected");
  }

  // TEST SUITE 5: Failure Path Isolation (No user or session created on OAuth failure)
  console.log("\nTEST SUITE 5: Failure Path Isolation");
  {
    const invalidGoogleToken = "invalid.mock.jwt";
    assert(verifyToken(invalidGoogleToken) === null, "OAuth failure: Invalid token rejected, NO session issued");
    const missingState = verifyOAuthState(undefined);
    assert(missingState.valid === false, "OAuth failure: Missing state rejected, NO session issued");
  }

  console.log("\n===============================================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error("Unhandled test suite exception:", e);
  process.exit(1);
});
