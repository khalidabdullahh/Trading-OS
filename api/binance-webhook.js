/**
 * Trading-OS Binance Pay Gmail Webhook Endpoint (Vercel Serverless)
 * Receives verified Order IDs forwarded from Google Apps Script (Gmail Automation)
 * Author: Khalid Abdullah (Trading-OS)
 */

// In-memory cache for fast lookup across warm serverless invocations
const verifiedStore = global.binanceVerifiedOrders || new Map();
global.binanceVerifiedOrders = verifiedStore;

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const SECRET_KEY = process.env.BPAY_WEBHOOK_SECRET || 'TRADING_OS_BPAY_SECRET_2026';

    if (req.method === 'POST') {
        const body = req.body || {};
        const { secret, orderId, amount = 9.0, timestamp = Date.now() } = body;

        // Security check
        if (secret !== SECRET_KEY) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Invalid secret key' });
        }

        if (!orderId || !/^\d{18,22}$/.test(String(orderId).trim())) {
            return res.status(400).json({ success: false, error: 'Invalid 19-digit Binance Order ID' });
        }

        const cleanOrderId = String(orderId).trim();
        const parsedAmount = parseFloat(amount) || 9.0;

        // Store verified order
        verifiedStore.set(cleanOrderId, {
            orderId: cleanOrderId,
            amount: parsedAmount,
            timestamp,
            verifiedAt: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: 'Binance Pay Order ID verified and registered successfully',
            orderId: cleanOrderId,
            amount: parsedAmount
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
