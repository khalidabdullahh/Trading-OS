/**
 * Trading-OS Pine Script Code Vault & Paywall System
 * Handles secure strategy code protection, checkout workflows, and export
 * Author: Khalid Abdullah (Trading-OS)
 */

const PineVault = {
    unlockedStrategies: new Set(),

    init() {
        try {
            const saved = localStorage.getItem('trading_os_unlocked_vault');
            if (saved) {
                const arr = JSON.parse(saved);
                arr.forEach(id => this.unlockedStrategies.add(id));
            }
        } catch (e) {
            console.warn('LocalStorage not available');
        }
    },

    isUnlocked(strategyId) {
        return this.unlockedStrategies.has(strategyId);
    },

    unlock(strategyId) {
        this.unlockedStrategies.add(strategyId);
        try {
            localStorage.setItem('trading_os_unlocked_vault', JSON.stringify(Array.from(this.unlockedStrategies)));
        } catch (e) {}
    },

    /**
     * Render the Vault UI Card (Locked or Unlocked)
     */
    renderVaultSection(strategy, currentParams, symbol, timeframe, containerElement) {
        if (!containerElement) return;

        const isUnlocked = this.isUnlocked(strategy.id);
        const pineCode = strategy.generatePineScript(currentParams, symbol, timeframe);

        if (isUnlocked) {
            containerElement.innerHTML = `
                <div class="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/40 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                                🔓
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-100 text-base flex items-center gap-2">
                                    Pine Script v5 Source Code
                                    <span class="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">UNLOCKED</span>
                                </h3>
                                <p class="text-xs text-slate-400">Ready for TradingView Pine Editor, Webhook Bots & Alerts</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button id="copyPineBtn" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                <span>Copy Code</span>
                            </button>
                            <button id="downloadPineBtn" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-emerald-900/40 transition flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                <span>Download .pine</span>
                            </button>
                        </div>
                    </div>

                    <div class="mt-4 relative">
                        <pre class="bg-slate-950/90 text-emerald-300 font-mono text-xs p-4 rounded-lg overflow-x-auto max-h-72 border border-slate-800 select-all leading-relaxed">${this.escapeHtml(pineCode)}</pre>
                    </div>
                </div>
            `;

            // Attach Copy & Download events
            const copyBtn = document.getElementById('copyPineBtn');
            if (copyBtn) {
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(pineCode).then(() => {
                        const span = copyBtn.querySelector('span');
                        span.textContent = 'Copied! ✅';
                        setTimeout(() => { span.textContent = 'Copy Code'; }, 2000);
                    });
                };
            }

            const downloadBtn = document.getElementById('downloadPineBtn');
            if (downloadBtn) {
                downloadBtn.onclick = () => {
                    const blob = new Blob([pineCode], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `TradingOS_${strategy.id}_${symbol}_${timeframe}.pine`;
                    a.click();
                    URL.revokeObjectURL(url);
                };
            }
        } else {
            // Locked View with Obfuscated / Blurred Code & Buy CTA
            const dummyBlurredSnippet = pineCode.split('\n').slice(0, 15).join('\n');

            containerElement.innerHTML = `
                <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-base">
                                🔒
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-100 text-base flex items-center gap-2">
                                    TradingView Pine Script v5 Code
                                    <span class="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">PRO ALGORITHM</span>
                                </h3>
                                <p class="text-xs text-slate-400">Lock in your verified edge: Export exact strategy parameters directly to TradingView</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-slate-400 line-through mr-1">$49</span>
                            <span class="text-lg font-black text-cyan-400">$${strategy.priceUSD}</span>
                            <span class="text-xs text-slate-400 block font-medium">৳${strategy.priceBDT}</span>
                        </div>
                    </div>

                    <!-- Blurred Code Preview Wrapper -->
                    <div class="mt-4 relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950/80">
                        <div class="p-4 font-mono text-xs text-slate-500 select-none filter blur-[3.5px] pointer-events-none opacity-40 leading-relaxed max-h-48 overflow-hidden">
                            ${this.escapeHtml(dummyBlurredSnippet)}
                        </div>

                        <!-- Paywall Overlay Card -->
                        <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                            <div class="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xl mb-2 shadow-lg shadow-cyan-950/50">
                                ⚡
                            </div>
                            <h4 class="font-bold text-slate-100 text-sm mb-1">Unlock TradingView Pine Script v5 Code</h4>
                            <p class="text-xs text-slate-300 max-w-md mb-3">
                                Get instant lifetime access to the full source code. Compatible with <strong>TradingView Alerts</strong>, <strong>3Commas</strong>, and <strong>Automated Webhook Bots</strong>.
                            </p>
                            <button id="openCheckoutModalBtn" class="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 hover:text-black font-bold text-xs rounded-lg shadow-xl shadow-cyan-900/40 transition transform active:scale-95 flex items-center gap-2">
                                <span>Unlock Source Code ($${strategy.priceUSD} / ৳${strategy.priceBDT})</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const openBtn = document.getElementById('openCheckoutModalBtn');
            if (openBtn) {
                openBtn.onclick = () => {
                    this.showCheckoutModal(strategy, currentParams, symbol, timeframe, containerElement);
                };
            }
        }
    },

    /**
     * Display the payment modal
     */
    showCheckoutModal(strategy, currentParams, symbol, timeframe, containerElement) {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;

        const titleEl = document.getElementById('modalStrategyTitle');
        const priceUsdEl = document.getElementById('modalPriceUSD');
        const priceBdtEl = document.getElementById('modalPriceBDT');

        if (titleEl) titleEl.textContent = strategy.name;
        if (priceUsdEl) priceUsdEl.textContent = `$${strategy.priceUSD}`;
        if (priceBdtEl) priceBdtEl.textContent = `৳${strategy.priceBDT}`;

        modal.classList.remove('hidden');

        // Setup instant payment verification simulator
        const payButtons = document.querySelectorAll('.payment-method-btn');
        payButtons.forEach(btn => {
            btn.onclick = () => {
                const method = btn.dataset.method;
                this.processPayment(method, strategy, currentParams, symbol, timeframe, containerElement);
            };
        });
    },

    processPayment(method, strategy, currentParams, symbol, timeframe, containerElement) {
        const modal = document.getElementById('checkoutModal');
        const processingOverlay = document.getElementById('paymentProcessingOverlay');

        if (processingOverlay) processingOverlay.classList.remove('hidden');

        setTimeout(() => {
            if (processingOverlay) processingOverlay.classList.add('hidden');
            if (modal) modal.classList.add('hidden');

            // Unlock strategy
            this.unlock(strategy.id);

            // Re-render
            this.renderVaultSection(strategy, currentParams, symbol, timeframe, containerElement);

            // Show Toast
            this.showToast(`🎉 Success! ${strategy.name} Pine Script v5 Code has been unlocked!`);
        }, 1200);
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-5 py-3 rounded-xl shadow-2xl z-50 text-sm font-semibold flex items-center gap-3 animate-bounce';
        toast.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 4000);
    },

    escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

PineVault.init();

if (typeof window !== 'undefined') {
    window.PineVault = PineVault;
}
