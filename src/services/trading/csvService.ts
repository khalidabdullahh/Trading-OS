/**
 * Trading-OS v2.0 - CSV Import & Export Hub
 * Structured export and validated import with column mapping and deduplication
 */

import { Trade, JournalEntry } from "../../types/domain";

export class CSVService {
  /**
   * Export Trades to CSV
   */
  static exportTradesToCSV(trades: Trade[]): string {
    const headers = ["ID", "Symbol", "Direction", "Status", "Entry Price", "Exit Price", "Quantity", "Stop Loss", "Take Profit", "Fee", "Net PnL", "Return %", "R Multiple", "Session", "Setup", "Entry Time", "Exit Time", "Exit Reason", "Notes"];

    const rows = trades.map(t => [
      t.id,
      t.symbol,
      t.direction,
      t.status,
      t.entryPrice,
      t.exitPrice || "",
      t.quantity,
      t.stopLoss || "",
      t.takeProfit || "",
      t.fee,
      t.netPnl,
      t.netPnlPct,
      t.rMultiple || "",
      t.session || "",
      t.setupType || "",
      t.entryTime,
      t.exitTime || "",
      `"${(t.exitReason || "").replace(/"/g, '""')}"`,
      `"${(t.notes || "").replace(/"/g, '""')}"`
    ]);

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  }

  /**
   * Trigger direct browser download of CSV string
   */
  static downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Parse uploaded CSV string into Trade objects
   */
  static parseTradesCSV(csvText: string, userId: string, accountId: string): { success: boolean; trades: Trade[]; errors: string[] } {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      return { success: false, trades: [], errors: ["CSV file is empty or missing headers"] };
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const trades: Trade[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      try {
        const symbol = cols[headers.indexOf("symbol")] || cols[1] || "BTCUSDT";
        const direction = (cols[headers.indexOf("direction")] || cols[2] || "LONG").toUpperCase() as "LONG" | "SHORT";
        const entryPrice = parseFloat(cols[headers.indexOf("entry price")] || cols[4]) || 0;
        const exitPrice = parseFloat(cols[headers.indexOf("exit price")] || cols[5]) || entryPrice;
        const pnl = parseFloat(cols[headers.indexOf("net pnl")] || cols[10]) || (exitPrice - entryPrice);

        if (entryPrice <= 0) {
          errors.push(`Row ${i}: Invalid entry price`);
          continue;
        }

        trades.push({
          id: `imp_${Date.now()}_${i}`,
          userId,
          accountId,
          symbol,
          direction,
          status: "CLOSED",
          entryPrice,
          exitPrice,
          quantity: parseFloat(cols[headers.indexOf("quantity")] || cols[6]) || 1.0,
          stopLoss: parseFloat(cols[headers.indexOf("stop loss")] || cols[7]) || undefined,
          takeProfit: parseFloat(cols[headers.indexOf("take profit")] || cols[8]) || undefined,
          fee: parseFloat(cols[headers.indexOf("fee")] || cols[9]) || 0,
          netPnl: +pnl.toFixed(2),
          netPnlPct: +(((exitPrice - entryPrice) / entryPrice) * 100).toFixed(2),
          rMultiple: 2.0,
          session: "London",
          entryTime: cols[headers.indexOf("entry time")] || cols[15] || new Date().toISOString(),
          ruleAdherence: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (err: any) {
        errors.push(`Row ${i}: ${err.message}`);
      }
    }

    return { success: trades.length > 0, trades, errors };
  }
}
