"use strict";
/**
 * Trading-OS v2.0 - Centralized Server Environment Validation
 * Validates required secrets and database URLs on server startup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvValidator = void 0;
class EnvValidator {
    static cachedConfig = null;
    static getConfig() {
        if (this.cachedConfig)
            return this.cachedConfig;
        const nodeEnv = (process.env.NODE_ENV || "development");
        const port = parseInt(process.env.PORT || "8088", 10);
        const databaseUrl = process.env.DATABASE_URL || null;
        const geminiApiKey = process.env.GEMINI_API_KEY || null;
        const authSecret = process.env.AUTH_SECRET || "trading_os_default_secure_dev_jwt_secret_key_32bytes_min";
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
            authSecret
        };
        return this.cachedConfig;
    }
    static isDatabaseConfigured() {
        const config = this.getConfig();
        return Boolean(config.databaseUrl && config.databaseUrl.trim().length > 10);
    }
    static isAIConfigured() {
        const config = this.getConfig();
        return Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 10);
    }
}
exports.EnvValidator = EnvValidator;
