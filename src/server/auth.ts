/**
 * Trading-OS v2.0 - Server-Side Authentication & Session Security
 * Token creation, signature verification, password hashing, and user context extraction
 */

import * as crypto from "crypto";
import { EnvValidator } from "./env";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface GoogleVerifiedIdentity {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

export class ServerAuth {
  /**
   * Secure HMAC-SHA256 Token Signature Generator
   */
  static signToken(payload: { id: string; email: string; role?: string }, expiresInHours = 72): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
    const claims = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");

    const secret = EnvValidator.getConfig().authSecret;
    const signature = crypto.createHmac("sha256", secret).update(`${header}.${claims}`).digest("base64url");

    return `${header}.${claims}.${signature}`;
  }

  /**
   * Verify token signature and return authenticated user context
   */
  static verifyToken(token: string): AuthenticatedUser | null {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, claims, signature] = parts;
    const secret = EnvValidator.getConfig().authSecret;
    const expectedSig = crypto.createHmac("sha256", secret).update(`${header}.${claims}`).digest("base64url");

    if (signature !== expectedSig) return null;

    try {
      const payload = JSON.parse(Buffer.from(claims, "base64url").toString("utf8"));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return null; // Expired
      }
      return {
        id: payload.id,
        email: payload.email,
        role: payload.role || "USER"
      };
    } catch {
      return null;
    }
  }

  /**
   * Generates a cryptographically secure, signed OAuth State parameter
   */
  static generateOAuthState(returnUrl = "/"): string {
    const secret = EnvValidator.getConfig().authSecret;
    const nonce = crypto.randomBytes(16).toString("hex");
    const payload = JSON.stringify({
      nonce,
      ts: Date.now(),
      returnUrl: returnUrl && returnUrl.startsWith("/") ? returnUrl : "/"
    });
    const data = Buffer.from(payload).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
    return `${data}.${sig}`;
  }

  /**
   * Validates OAuth State parameter against HMAC signature and expiration
   */
  static verifyOAuthState(state: string): { valid: boolean; returnUrl?: string; error?: string } {
    if (!state || typeof state !== "string" || !state.includes(".")) {
      return { valid: false, error: "Missing or malformed state parameter" };
    }

    const [data, sig] = state.split(".");
    if (!data || !sig) {
      return { valid: false, error: "Malformed state structure" };
    }

    const secret = EnvValidator.getConfig().authSecret;
    const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("base64url");

    if (sig !== expectedSig) {
      return { valid: false, error: "Invalid state signature (potential CSRF attack)" };
    }

    try {
      const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      if (!payload.ts || now - payload.ts > tenMinutes || payload.ts > now + 60000) {
        return { valid: false, error: "State parameter expired" };
      }
      return { valid: true, returnUrl: payload.returnUrl || "/" };
    } catch {
      return { valid: false, error: "Failed to parse state payload" };
    }
  }

  /**
   * Exchange Google Authorization Code for Access & ID Tokens
   */
  static async exchangeGoogleCode(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<{ access_token: string; id_token: string } | null> {
    try {
      const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      });

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[ServerAuth] Google code exchange failed:", err);
        return null;
      }

      const data = await res.json();
      return {
        access_token: data.access_token,
        id_token: data.id_token
      };
    } catch (e) {
      console.error("[ServerAuth] Exception in Google code exchange:", e);
      return null;
    }
  }

  /**
   * Verify and fetch Google userinfo profile using access token
   */
  static async fetchGoogleUserInfo(accessToken: string): Promise<GoogleVerifiedIdentity | null> {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        console.error("[ServerAuth] Google userinfo fetch returned status:", res.status);
        return null;
      }

      const data = await res.json();
      if (!data.sub || !data.email) {
        console.error("[ServerAuth] Incomplete Google user profile:", data);
        return null;
      }

      return {
        sub: String(data.sub),
        email: String(data.email).trim().toLowerCase(),
        email_verified: Boolean(data.email_verified),
        name: data.name || data.email.split("@")[0],
        picture: data.picture || undefined
      };
    } catch (e) {
      console.error("[ServerAuth] Exception fetching Google userinfo:", e);
      return null;
    }
  }

  /**
   * Server-side verification of Google ID token (from GIS / One-Tap)
   */
  static async verifyGoogleIdToken(idToken: string, expectedClientId?: string): Promise<GoogleVerifiedIdentity | null> {
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!res.ok) {
        console.error("[ServerAuth] Google tokeninfo returned status:", res.status);
        return null;
      }

      const data = await res.json();
      const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
      if (!validIssuers.includes(data.iss)) {
        console.error("[ServerAuth] Invalid token issuer:", data.iss);
        return null;
      }

      if (expectedClientId && data.aud !== expectedClientId) {
        console.error("[ServerAuth] Token audience mismatch:", data.aud, "expected:", expectedClientId);
        return null;
      }

      if (data.email_verified !== "true" && data.email_verified !== true) {
        console.error("[ServerAuth] Google email is not verified:", data.email);
        return null;
      }

      return {
        sub: String(data.sub),
        email: String(data.email).trim().toLowerCase(),
        email_verified: true,
        name: data.name || data.email.split("@")[0],
        picture: data.picture || undefined
      };
    } catch (e) {
      console.error("[ServerAuth] Exception verifying Google ID token:", e);
      return null;
    }
  }

  /**
   * Secure Salted Password Hashing
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
  }

  /**
   * Verify password against stored hash
   */
  static comparePassword(password: string, storedHash: string): boolean {
    if (!storedHash || !storedHash.includes(":")) return false;
    const [salt, originalHash] = storedHash.split(":");
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return hash === originalHash;
  }

  /**
   * Extract authenticated user from HTTP request headers
   */
  static extractUserFromRequest(headers: Record<string, string | string[] | undefined>): AuthenticatedUser | null {
    const authHeader = (headers["authorization"] || headers["Authorization"]) as string;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.slice(7).trim();
    return this.verifyToken(token);
  }
}
