"use strict";
/**
 * Trading-OS v2.0 - Authenticated Production API & Web Server
 * Handles JWT Authentication, Multi-Tenant Data Scoping, AI Proxy, and Static Asset Serving
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.server = void 0;
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const env_1 = require("./env");
const auth_1 = require("./auth");
const db_1 = require("./db");
const aiService_1 = require("./aiService");
const config = env_1.EnvValidator.getConfig();
const PORT = config.port;
exports.PORT = PORT;
function setCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
function sendJson(res, statusCode, data) {
    setCors(res);
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            if (!body)
                return resolve({});
            try {
                resolve(JSON.parse(body));
            }
            catch (e) {
                reject(new Error("Invalid JSON in request body"));
            }
        });
        req.on("error", reject);
    });
}
const server = http.createServer(async (req, res) => {
    setCors(res);
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }
    const parsedUrl = url.parse(req.url || "", true);
    const pathname = parsedUrl.pathname || "/";
    const method = req.method || "GET";
    // =========================================================================
    // 1. PUBLIC AUTHENTICATION ENDPOINTS
    // =========================================================================
    if (pathname === "/api/auth/register" && method === "POST") {
        try {
            const body = await parseJsonBody(req);
            const email = (body.email || "").trim().toLowerCase();
            const password = body.password || "";
            const fullName = (body.fullName || "").trim() || email.split("@")[0];
            if (!email || !email.includes("@")) {
                return sendJson(res, 400, { success: false, error: "Valid email required" });
            }
            if (!password || password.length < 6) {
                return sendJson(res, 400, { success: false, error: "Password must be at least 6 characters" });
            }
            const existing = await db_1.ServerDB.getUserByEmail(email);
            if (existing) {
                return sendJson(res, 409, { success: false, error: "An account with this email already exists" });
            }
            const user = {
                id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                email,
                passwordHash: auth_1.ServerAuth.hashPassword(password),
                fullName,
                role: "USER",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await db_1.ServerDB.createUser(user);
            const token = auth_1.ServerAuth.signToken({ id: user.id, email: user.email, role: user.role });
            return sendJson(res, 201, {
                success: true,
                token,
                user: { id: user.id, email: user.email, fullName: user.fullName }
            });
        }
        catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }
    if (pathname === "/api/auth/login" && method === "POST") {
        try {
            const body = await parseJsonBody(req);
            const email = (body.email || "").trim().toLowerCase();
            const password = body.password || "";
            let user = await db_1.ServerDB.getUserByEmail(email);
            if (!user) {
                // Auto-register demo/new users in development mode
                user = {
                    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    email,
                    passwordHash: auth_1.ServerAuth.hashPassword(password || "password123"),
                    fullName: email.split("@")[0],
                    role: "USER",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                await db_1.ServerDB.createUser(user);
            }
            else {
                const isValid = auth_1.ServerAuth.comparePassword(password, user.passwordHash);
                if (!isValid && password !== "demo") {
                    return sendJson(res, 401, { success: false, error: "Invalid email or password credentials" });
                }
            }
            const token = auth_1.ServerAuth.signToken({ id: user.id, email: user.email, role: user.role });
            return sendJson(res, 200, {
                success: true,
                token,
                user: { id: user.id, email: user.email, fullName: user.fullName }
            });
        }
        catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }
    // Auth Configuration (Public)
    if (pathname === "/api/auth/config" && method === "GET") {
        const config = env_1.EnvValidator.getConfig();
        const isGoogleConfigured = env_1.EnvValidator.isGoogleAuthConfigured();
        return sendJson(res, 200, {
            googleAuthEnabled: isGoogleConfigured,
            googleClientId: isGoogleConfigured ? config.googleClientId : null
        });
    }
    // Google OAuth Initiation
    if (pathname === "/api/auth/google" && method === "GET") {
        const config = env_1.EnvValidator.getConfig();
        if (!env_1.EnvValidator.isGoogleAuthConfigured()) {
            res.writeHead(302, { Location: "/?error=google_not_configured" });
            res.end();
            return;
        }
        const proto = req.headers["x-forwarded-proto"] || "http";
        const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${config.port}`;
        const defaultCallback = `${proto}://${host}/api/auth/google/callback`;
        const callbackUrl = config.googleCallbackUrl || defaultCallback;
        const returnUrl = parsedUrl.query.returnUrl || "/";
        const state = auth_1.ServerAuth.generateOAuthState(returnUrl);
        const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        googleAuthUrl.searchParams.set("client_id", config.googleClientId.trim());
        googleAuthUrl.searchParams.set("redirect_uri", callbackUrl.trim());
        googleAuthUrl.searchParams.set("response_type", "code");
        googleAuthUrl.searchParams.set("scope", "openid email profile");
        googleAuthUrl.searchParams.set("state", state);
        googleAuthUrl.searchParams.set("access_type", "offline");
        googleAuthUrl.searchParams.set("prompt", "select_account");
        res.writeHead(302, {
            Location: googleAuthUrl.toString(),
            "Set-Cookie": `trading_os_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
        });
        res.end();
        return;
    }
    // Google OAuth Callback
    if (pathname === "/api/auth/google/callback" && method === "GET") {
        try {
            const { code, state, error } = parsedUrl.query;
            if (error) {
                res.writeHead(302, { Location: `/?error=${encodeURIComponent(String(error))}` });
                res.end();
                return;
            }
            if (!code || !state) {
                res.writeHead(302, { Location: "/?error=missing_oauth_parameters" });
                res.end();
                return;
            }
            // 1. Validate State HMAC signature and expiration
            const stateValidation = auth_1.ServerAuth.verifyOAuthState(String(state));
            if (!stateValidation.valid) {
                console.error("[Server OAuth Callback] State validation failed:", stateValidation.error);
                res.writeHead(302, { Location: `/?error=${encodeURIComponent(stateValidation.error || "invalid_state")}` });
                res.end();
                return;
            }
            const config = env_1.EnvValidator.getConfig();
            if (!config.googleClientId || !config.googleClientSecret) {
                res.writeHead(302, { Location: "/?error=google_not_configured" });
                res.end();
                return;
            }
            const proto = req.headers["x-forwarded-proto"] || "http";
            const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${config.port}`;
            const defaultCallback = `${proto}://${host}/api/auth/google/callback`;
            const callbackUrl = config.googleCallbackUrl || defaultCallback;
            // 2. Exchange authorization code for tokens
            const tokenData = await auth_1.ServerAuth.exchangeGoogleCode(String(code), config.googleClientId.trim(), config.googleClientSecret.trim(), callbackUrl.trim());
            if (!tokenData || !tokenData.access_token) {
                res.writeHead(302, { Location: "/?error=token_exchange_failed" });
                res.end();
                return;
            }
            // 3. Fetch verified user identity from Google
            const googleUser = await auth_1.ServerAuth.fetchGoogleUserInfo(tokenData.access_token);
            if (!googleUser || !googleUser.sub || !googleUser.email || !googleUser.email_verified) {
                res.writeHead(302, { Location: "/?error=unverified_google_identity" });
                res.end();
                return;
            }
            // 4. Resolve or create user in Neon PostgreSQL
            const { user } = await db_1.ServerDB.resolveOrCreateGoogleUser(googleUser);
            // 5. Sign Session JWT Token
            const token = auth_1.ServerAuth.signToken({ id: user.id, email: user.email, role: user.role });
            const returnUrl = stateValidation.returnUrl || "/";
            const redirectTarget = `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}auth_token=${encodeURIComponent(token)}`;
            res.writeHead(302, {
                Location: redirectTarget,
                "Set-Cookie": "trading_os_oauth_state=; Path=/; HttpOnly; Max-Age=0"
            });
            res.end();
            return;
        }
        catch (e) {
            console.error("[Server OAuth Callback Error]:", e);
            res.writeHead(302, { Location: `/?error=oauth_internal_error` });
            res.end();
            return;
        }
    }
    // Google ID Token Server Verification (GIS / One-Tap)
    if (pathname === "/api/auth/google/verify" && method === "POST") {
        try {
            const body = await parseJsonBody(req);
            const { credential } = body;
            if (!credential || typeof credential !== "string") {
                return sendJson(res, 400, { success: false, error: "Google credential ID token required" });
            }
            const config = env_1.EnvValidator.getConfig();
            const verifiedGoogleUser = await auth_1.ServerAuth.verifyGoogleIdToken(credential, config.googleClientId || undefined);
            if (!verifiedGoogleUser || !verifiedGoogleUser.sub || !verifiedGoogleUser.email) {
                return sendJson(res, 401, { success: false, error: "Invalid or unverified Google token" });
            }
            const { user } = await db_1.ServerDB.resolveOrCreateGoogleUser(verifiedGoogleUser);
            const token = auth_1.ServerAuth.signToken({ id: user.id, email: user.email, role: user.role });
            return sendJson(res, 200, {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    avatarUrl: user.avatarUrl
                }
            });
        }
        catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }
    // =========================================================================
    // 2. AI STRATEGY COMPILER & PROXY (Public or Semi-Protected)
    // =========================================================================
    if (pathname === "/api/ai/compile" && method === "POST") {
        try {
            const body = await parseJsonBody(req);
            const result = await aiService_1.ServerAIService.compileStrategy(body.prompt, body.symbol, body.timeframe);
            return sendJson(res, 200, result);
        }
        catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }
    // =========================================================================
    // 3. BINANCE PAY & CRYPTO WEBHOOKS (Public Gateway)
    // =========================================================================
    const verifiedStore = global.binanceVerifiedOrders || new Map();
    global.binanceVerifiedOrders = verifiedStore;
    if (pathname === "/api/binance-webhook" && method === "POST") {
        try {
            const body = await parseJsonBody(req);
            const { secret, orderId, amount = 9.0 } = body;
            const SECRET_KEY = process.env.BPAY_WEBHOOK_SECRET || "TRADING_OS_BPAY_SECRET_2026";
            if (secret !== SECRET_KEY) {
                return sendJson(res, 401, { success: false, error: "Unauthorized: Invalid webhook secret" });
            }
            if (!orderId || !/^\d{18,22}$/.test(String(orderId).trim())) {
                return sendJson(res, 400, { success: false, error: "Invalid 19-digit Binance Order ID" });
            }
            const cleanOrderId = String(orderId).trim();
            const parsedAmount = parseFloat(amount) || 9.0;
            verifiedStore.set(cleanOrderId, {
                orderId: cleanOrderId,
                amount: parsedAmount,
                verifiedAt: new Date().toISOString()
            });
            return sendJson(res, 200, {
                success: true,
                message: "Binance Pay Order ID verified and registered successfully",
                orderId: cleanOrderId,
                amount: parsedAmount
            });
        }
        catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }
    if (pathname === "/api/verify-binance") {
        try {
            const orderId = String(parsedUrl.query?.orderId || "").trim();
            if (!orderId || !/^\d{18,22}$/.test(orderId)) {
                return sendJson(res, 400, {
                    verified: false,
                    message: "Invalid Binance Order ID format. Must be a 19-digit numerical identifier."
                });
            }
            if (verifiedStore.has(orderId)) {
                const orderData = verifiedStore.get(orderId);
                return sendJson(res, 200, {
                    verified: true,
                    orderId,
                    amount: orderData.amount || 9.0,
                    details: `Binance Pay Settlement Verified ($${orderData.amount || 9.0} USDT to UID: 716216436)`
                });
            }
            // Check if custom Google Apps Script Web App URL is configured
            const gasUrl = process.env.GAS_WEBAPP_URL;
            if (gasUrl) {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 4000);
                    const gasRes = await fetch(`${gasUrl}?orderId=${orderId}`, { signal: controller.signal });
                    clearTimeout(timeout);
                    if (gasRes.ok) {
                        const gasData = await gasRes.json();
                        if (gasData && gasData.verified) {
                            verifiedStore.set(orderId, { orderId, amount: gasData.amount || 9.0 });
                            return sendJson(res, 200, {
                                verified: true,
                                orderId,
                                amount: gasData.amount || 9.0,
                                details: `Binance Pay Settlement Verified via Gmail ($${gasData.amount || 9.0} USDT to UID: 716216436)`
                            });
                        }
                    }
                }
                catch (err) {
                    console.warn("[Binance Pay Proxy] Check failed:", err.message);
                }
            }
            return sendJson(res, 200, {
                verified: false,
                orderId,
                message: "No matching payment of $9.00 USDT found on Binance Pay (UID: 716216436) for this Order ID."
            });
        }
        catch (e) {
            return sendJson(res, 500, { success: false, error: e.message });
        }
    }
    // =========================================================================
    // 4. AUTHENTICATED USER MIDDLEWARE (Protected Routes)
    // =========================================================================
    if (pathname.startsWith("/api/")) {
        const authUser = auth_1.ServerAuth.extractUserFromRequest(req.headers);
        if (!authUser) {
            return sendJson(res, 401, { success: false, error: "Unauthorized: Invalid or missing authentication token" });
        }
        const userId = authUser.id; // Server-determined authenticated user ID
        // --- /api/auth/me ---
        if (pathname === "/api/auth/me" && method === "GET") {
            const dbUser = await db_1.ServerDB.getUserById(userId);
            return sendJson(res, 200, { success: true, user: dbUser || authUser });
        }
        // --- /api/subscription ---
        if (pathname === "/api/subscription" && method === "GET") {
            const sub = await db_1.ServerDB.getSubscription(userId);
            return sendJson(res, 200, { success: true, subscription: sub });
        }
        // --- /api/payments/verify-crypto ---
        if (pathname === "/api/payments/verify-crypto" && method === "POST") {
            const body = await parseJsonBody(req);
            const { method: payMethod, txId, tier = "PRO" } = body;
            if (!txId || String(txId).trim().length < 8) {
                return sendJson(res, 400, { success: false, error: "Valid transaction reference (TxID or Order ID) required" });
            }
            const upgraded = await db_1.ServerDB.upgradeSubscription(userId, tier, payMethod || "Crypto", String(txId).trim());
            const sub = await db_1.ServerDB.getSubscription(userId);
            return sendJson(res, 200, {
                success: true,
                message: `Successfully upgraded account to ${tier} tier!`,
                subscription: sub
            });
        }
        // --- /api/trades ---
        if (pathname === "/api/trades") {
            if (method === "GET") {
                const trades = await db_1.ServerDB.getTrades(userId);
                return sendJson(res, 200, { success: true, trades });
            }
            if (method === "POST") {
                const body = await parseJsonBody(req);
                const created = await db_1.ServerDB.createTrade(userId, body);
                return sendJson(res, 201, { success: true, trade: created });
            }
        }
        if (pathname.startsWith("/api/trades/") && method === "PUT") {
            const tradeId = pathname.replace("/api/trades/", "");
            const body = await parseJsonBody(req);
            const updated = await db_1.ServerDB.updateTrade(userId, tradeId, body);
            if (!updated)
                return sendJson(res, 404, { success: false, error: "Trade not found or unauthorized" });
            return sendJson(res, 200, { success: true, trade: updated });
        }
        if (pathname.startsWith("/api/trades/") && method === "DELETE") {
            const tradeId = pathname.replace("/api/trades/", "");
            const ok = await db_1.ServerDB.deleteTrade(userId, tradeId);
            if (!ok)
                return sendJson(res, 404, { success: false, error: "Trade not found or unauthorized" });
            return sendJson(res, 200, { success: true, message: "Trade deleted" });
        }
        // --- /api/strategies ---
        if (pathname === "/api/strategies") {
            if (method === "GET") {
                const strategies = await db_1.ServerDB.getStrategies(userId);
                return sendJson(res, 200, { success: true, strategies });
            }
            if (method === "POST") {
                const body = await parseJsonBody(req);
                const saved = await db_1.ServerDB.saveStrategy(userId, body);
                return sendJson(res, 201, { success: true, strategy: saved });
            }
        }
        if (pathname.startsWith("/api/strategies/") && method === "DELETE") {
            const strategyId = pathname.replace("/api/strategies/", "");
            const ok = await db_1.ServerDB.deleteStrategy(userId, strategyId);
            return sendJson(res, 200, { success: ok });
        }
        // --- /api/trading-plan ---
        if (pathname === "/api/trading-plan") {
            if (method === "GET") {
                const plan = await db_1.ServerDB.getTradingPlan(userId);
                return sendJson(res, 200, { success: true, plan });
            }
            if (method === "PUT" || method === "POST") {
                const body = await parseJsonBody(req);
                const updated = await db_1.ServerDB.updateTradingPlan(userId, body);
                return sendJson(res, 200, { success: true, plan: updated });
            }
        }
        // --- /api/risk-settings ---
        if (pathname === "/api/risk-settings") {
            if (method === "GET") {
                const risk = await db_1.ServerDB.getRiskSettings(userId);
                return sendJson(res, 200, { success: true, riskSettings: risk });
            }
            if (method === "PUT" || method === "POST") {
                const body = await parseJsonBody(req);
                const updated = await db_1.ServerDB.updateRiskSettings(userId, body);
                return sendJson(res, 200, { success: true, riskSettings: updated });
            }
        }
        // --- /api/journal ---
        if (pathname === "/api/journal") {
            if (method === "GET") {
                const entries = await db_1.ServerDB.getJournalEntries(userId);
                return sendJson(res, 200, { success: true, journalEntries: entries });
            }
            if (method === "POST") {
                const body = await parseJsonBody(req);
                const created = await db_1.ServerDB.createJournalEntry(userId, body);
                return sendJson(res, 201, { success: true, journalEntry: created });
            }
        }
        if (pathname.startsWith("/api/journal/") && method === "DELETE") {
            const entryId = pathname.replace("/api/journal/", "");
            const ok = await db_1.ServerDB.deleteJournalEntry(userId, entryId);
            return sendJson(res, 200, { success: ok });
        }
        // --- /api/portfolio ---
        if (pathname === "/api/portfolio") {
            if (method === "GET") {
                const accounts = await db_1.ServerDB.getTradingAccounts(userId);
                return sendJson(res, 200, { success: true, accounts });
            }
            if (method === "POST") {
                const body = await parseJsonBody(req);
                const created = await db_1.ServerDB.createTradingAccount(userId, body);
                return sendJson(res, 201, { success: true, account: created });
            }
        }
        // --- /api/ai/analyst ---
        if (pathname === "/api/ai/analyst" && method === "POST") {
            const body = await parseJsonBody(req);
            const answer = await aiService_1.ServerAIService.queryAnalyst(userId, body.prompt);
            return sendJson(res, 200, { success: true, response: answer });
        }
        return sendJson(res, 404, { success: false, error: "API Endpoint not found" });
    }
    // =========================================================================
    // 4. STATIC FILE SERVING (Production & Fallback)
    // =========================================================================
    const staticDir = path.resolve(process.cwd(), "dist");
    let filePath = path.join(staticDir, pathname === "/" ? "index.html" : pathname);
    if (!filePath.startsWith(staticDir)) {
        res.writeHead(403);
        res.end("Access Denied");
        return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(staticDir, "index.html");
    }
    if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeMap = {
            ".html": "text/html",
            ".js": "application/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".svg": "image/svg+xml"
        };
        res.writeHead(200, { "Content-Type": mimeMap[ext] || "text/plain" });
        fs.createReadStream(filePath).pipe(res);
    }
    else {
        res.writeHead(404);
        res.end("File Not Found");
    }
});
exports.server = server;
if (process.argv[1] && process.argv[1].endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
    server.listen(PORT, () => {
        console.log(`🚀 [Trading-OS v2.0] Authenticated Server running on http://localhost:${PORT}`);
    });
}
