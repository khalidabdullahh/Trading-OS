/**
 * Trading-OS v2.0 - Centralized Server Environment Validation
 * Validates required secrets and database URLs on server startup
 */

export interface ServerConfig {
  nodeEnv: "development" | "production" | "test";
  port: number;
  databaseUrl: string | null;
  geminiApiKey: string | null;
  authSecret: string;
  googleClientId: string | null;
  googleClientSecret: string | null;
  googleCallbackUrl: string | null;
}

export class EnvValidator {
  private static cachedConfig: ServerConfig | null = null;

  static getConfig(): ServerConfig {
    if (this.cachedConfig) return this.cachedConfig;

    const nodeEnv = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
    const port = parseInt(process.env.PORT || "8088", 10);
    const databaseUrl = process.env.DATABASE_URL || null;
    const geminiApiKey = process.env.GEMINI_API_KEY || null;
    const authSecret = process.env.AUTH_SECRET || "trading_os_default_secure_dev_jwt_secret_key_32bytes_min";
    const googleClientId = process.env.GOOGLE_CLIENT_ID || null;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || null;
    const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || null;

    if (nodeEnv === "production") {
      if (!process.env.AUTH_SECRET) {
        console.warn("[Trading-OS Security Warning] AUTH_SECRET is not set in production. Please set AUTH_SECRET in your environment.");
      }
      if (!databaseUrl) {
        console.warn("[Trading-OS Database Notice] DATABASE_URL is not set. PostgreSQL connection pending infrastructure configuration.");
      }
      if (!geminiApiKey) {
        console.warn("[Trading-OS AI Notice] GEMINI_API_KEY is not set. AI endpoints will return explicit service unavailable messages.");
      }
    }

    this.cachedConfig = {
      nodeEnv,
      port,
      databaseUrl,
      geminiApiKey,
      authSecret,
      googleClientId,
      googleClientSecret,
      googleCallbackUrl
    };

    return this.cachedConfig;
  }

  static isDatabaseConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(config.databaseUrl && config.databaseUrl.trim().length > 10);
  }

  static isAIConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 10);
  }

  static isGoogleAuthConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(
      config.googleClientId &&
      config.googleClientId.trim().length > 5 &&
      config.googleClientSecret &&
      config.googleClientSecret.trim().length > 5
    );
  }
}
