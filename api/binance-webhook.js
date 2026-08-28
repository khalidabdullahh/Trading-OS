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

        // Send Telegram notification to admin
        try {
            const botToken = atob('ODg3MDgwNjI5MTpBQUd5amdxLWlPUnRBbzBxRXE1OUkxamI2aW5UU3FqWGd0SQ==');
            const chatId = '5334373578';
            const tgMsg = `✅ <b>REAL BINANCE PAY RECEIVED (GMAIL VERIFIED)!</b>\n` +
                          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `💰 <b>Amount:</b> $${parsedAmount.toFixed(2)} USDT\n` +
                          `🔢 <b>Order ID:</b> <code>${cleanOrderId}</code>\n` +
                          `🆔 <b>Merchant UID:</b> 716216436\n` +
                          `📧 <b>Source:</b> Gmail Auto-Confirmation Engine\n` +
                          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `<i>Customer is now authorized to unlock Pine Script!</i>`;

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: tgMsg,
                    parse_mode: 'HTML'
                })
            });
        } catch (e) {
            console.error('Telegram notification error:', e);
        }

        return res.status(200).json({
            success: true,
            message: 'Binance Pay Order ID verified and registered successfully',
            orderId: cleanOrderId,
            amount: parsedAmount
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
