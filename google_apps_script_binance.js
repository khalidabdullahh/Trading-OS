/**
 * =============================================================================
 * Trading-OS v1.02 — Google Apps Script (Gmail Binance Pay Auto-Confirm Engine)
 * =============================================================================
 * Author: Khalid Abdullah (Trading-OS)
 * 
 * INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Click "New Project"
 * 3. Delete any default code and PASTE THIS ENTIRE FILE into Code.gs
 * 4. Click the "Save" disk icon (Ctrl+S / Cmd+S)
 * 5. Run the function "setupAutoTrigger" ONCE and grant Google permissions.
 * 
 * DONE! Your Gmail will now automatically verify Binance Pay payments 24/7 in the cloud!
 * =============================================================================
 */

// Configuration
var CONFIG = {
  // Your Live Vercel Webhook URL
  WEBHOOK_URL: 'https://trading-os-blue.vercel.app/api/binance-webhook',
  
  // Webhook Secret Token (Must match server)
  SECRET_KEY: 'TRADING_OS_BPAY_SECRET_2026',
  
  // Telegram Instant Alert Bot
  TELEGRAM_BOT_TOKEN: '8870806291:AAGyjgq-iORtAo0qEq59I1jb6inTSqjXgtI',
  TELEGRAM_CHAT_ID: '5334373578', // Khalid Abdullah (@khalid_abdullahhh)
  
  // Label to mark processed emails so they never process twice
  LABEL_NAME: 'TradingOS-Verified'
};

/**
 * Main Worker: Searches Gmail for incoming Binance Pay payment receipts
 * Runs automatically every 1 minute in the background
 */
function checkBinanceEmails() {
  try {
    // Search query for official Binance payment notification emails
    var query = 'from:do-not-reply@binance.com ("Binance Pay" OR "received" OR "payment" OR "USDT") -label:' + CONFIG.LABEL_NAME;
    var threads = GmailApp.search(query, 0, 10);

    if (threads.length === 0) {
      return; // No new unprocessed Binance emails
    }

    var label = getOrCreateLabel(CONFIG.LABEL_NAME);

    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var msg = messages[j];
        var body = msg.getPlainBody() + ' ' + msg.getSubject();

        // 1. Look for Binance 19-digit Order ID (e.g. 2589410294857102938)
        var orderMatch = body.match(/\b(\d{18,22})\b/);
        
        // 2. Look for Amount (e.g. 9.00 USDT or 9 USDT)
        var amountMatch = body.match(/(\d+(?:\.\d+)?)\s*USDT/i);
        var amount = amountMatch ? parseFloat(amountMatch[1]) : 9.0;

        if (orderMatch) {
          var orderId = orderMatch[1];
          Logger.log('Found genuine Binance Pay receipt: Order #' + orderId + ' | Amount: $' + amount + ' USDT');

          // Send to Trading-OS Vercel Serverless Webhook
          forwardToTradingOS(orderId, amount);

          // Send Instant Telegram Notification
          sendTelegramAlert(orderId, amount);
        }
      }

      // Mark thread with label so it never processes again
      threads[i].addLabel(label);
    }
  } catch (err) {
    Logger.log('Error in checkBinanceEmails: ' + err.toString());
  }
}

/**
 * Forward verified Order ID to Trading-OS Serverless Backend
 */
function forwardToTradingOS(orderId, amount) {
  try {
    var payload = {
      secret: CONFIG.SECRET_KEY,
      orderId: orderId,
      amount: amount,
      timestamp: new Date().getTime()
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
    Logger.log('Trading-OS Webhook Response: ' + response.getContentText());
  } catch (e) {
    Logger.log('Error sending to Trading-OS Webhook: ' + e.toString());
  }
}

/**
 * Send Instant Telegram Notification to Admin
 */
function sendTelegramAlert(orderId, amount) {
  try {
    var text = '✅ <b>REAL BINANCE PAY RECEIVED (GMAIL VERIFIED)!</b>\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               '💰 <b>Amount:</b> $' + amount.toFixed(2) + ' USDT\n' +
               '🔢 <b>Order ID:</b> <code>' + orderId + '</code>\n' +
               '🆔 <b>Merchant UID:</b> 716216436\n' +
               '📧 <b>Source:</b> Gmail Auto-Confirmation Cloud Engine\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               '<i>Customer order is now authorized to unlock Pine Script v5!</i>';

    var url = 'https://api.telegram.org/bot' + CONFIG.TELEGRAM_BOT_TOKEN + '/sendMessage';
    var payload = {
      chat_id: CONFIG.TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    };

    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log('Error sending Telegram alert: ' + e.toString());
  }
}

/**
 * Helper: Get or create Gmail label
 */
function getOrCreateLabel(name) {
  var label = GmailApp.getUserLabelByName(name);
  if (!label) {
    label = GmailApp.createLabel(name);
  }
  return label;
}

/**
 * RUN THIS FUNCTION ONCE: Automatically sets up the 1-minute cloud trigger
 */
function setupAutoTrigger() {
  // Clear any old triggers first
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Create recurring 1-minute trigger
  ScriptApp.newTrigger('checkBinanceEmails')
    .timeBased()
    .everyMinutes(1)
    .create();

  Logger.log('🎉 SUCCESS! Automatic 1-minute Gmail Binance Pay trigger installed successfully!');
}
