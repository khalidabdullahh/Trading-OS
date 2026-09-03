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
