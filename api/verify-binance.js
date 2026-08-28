/**
 * Trading-OS Binance Pay Order Verification Endpoint (Vercel Serverless)
 * Checks whether an Order ID matches a real settled payment verified via Gmail
 * Author: Khalid Abdullah (Trading-OS)
 */

const verifiedStore = global.binanceVerifiedOrders || new Map();
global.binanceVerifiedOrders = verifiedStore;

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const orderId = String(req.query.orderId || (req.body && req.body.orderId) || '').trim();

    if (!orderId || !/^\d{18,22}$/.test(orderId)) {
        return res.status(400).json({
            verified: false,
            message: 'Invalid Binance Order ID format. Must be a 19-digit numerical identifier.'
        });
    }

    // 1. Check in-memory store
    if (verifiedStore.has(orderId)) {
        const orderData = verifiedStore.get(orderId);
        return res.status(200).json({
            verified: true,
            orderId,
            amount: orderData.amount || 9.0,
            details: `Binance Pay Settlement Verified ($${orderData.amount || 9.0} USDT to UID: 716216436)`
        });
    }

    // 2. Check if a custom Google Apps Script Web App URL is configured
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
                    return res.status(200).json({
                        verified: true,
                        orderId,
                        amount: gasData.amount || 9.0,
                        details: `Binance Pay Settlement Verified via Gmail ($${gasData.amount || 9.0} USDT to UID: 716216436)`
                    });
                }
            }
        } catch (err) {
            console.warn('Google Apps Script proxy check failed:', err.message);
        }
    }

    // 3. Not verified yet
    return res.status(200).json({
        verified: false,
        orderId,
        message: 'No matching payment of $9.00 USDT found on Binance Pay (UID: 716216436) for this Order ID.'
    });
}
