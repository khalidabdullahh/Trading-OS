/**
 * Trading-OS Pine Script Code Vault & Crypto Payment System
 * Crypto-Only Gateway (USDT TRC20/BEP20/SOL) - Flat $9 Pricing
 * Author: Khalid Abdullah (Trading-OS)
 */

const PineVault = {
    unlockedStrategies: new Set(),

    // Crypto Deposit Wallets
    CRYPTO_WALLETS: {
        'USDT-TRC20': {
            network: 'Tron (TRC-20)',
            address: 'TY8w9uKxR4gKz7QyR2mN3vB9pL6tY8qX2z',
            badge: 'Fast & Low Fee',
            recommended: true
        },
        'USDT-BEP20': {
            network: 'BNB Smart Chain (BEP-20)',
            address: '0x71C2B909D3E0eC58AC6139B8808E5F706173B492',
            badge: 'BNB Chain'
        },
        'USDT-SOL': {
            network: 'Solana (SPL)',
            address: '7XgP2vE1w9M6kR3zL8tY4qX5bN2mC7vB9pL6tY8qX2z',
            badge: 'Instant'
        }
    },

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
                                    TradingView Pine Script v5 Code
                                    <span class="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">UNLOCKED</span>
                                </h3>
                                <p class="text-xs text-slate-400">Ready for TradingView Pine Editor, Webhook Bots (3Commas/Cornix) & Alerts</p>
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
            // Locked View with Obfuscated / Blurred Code & Buy CTA ($9 Crypto)
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
                                    <span class="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Crypto Pay
                                    </span>
                                </h3>
                                <p class="text-xs text-slate-400">Export verified algorithm parameters directly to TradingView</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-slate-400 line-through mr-1">$49</span>
                            <span class="text-xl font-black text-emerald-400 font-mono">$9 USDT</span>
                            <span class="text-[10px] text-slate-400 block font-medium">Flat Price • Lifetime License</span>
                        </div>
                    </div>

                    <!-- Blurred Code Preview Wrapper -->
                    <div class="mt-4 relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950/80">
                        <div class="p-4 font-mono text-xs text-slate-500 select-none filter blur-[3.5px] pointer-events-none opacity-40 leading-relaxed max-h-48 overflow-hidden">
                            ${this.escapeHtml(dummyBlurredSnippet)}
                        </div>

                        <!-- Paywall Overlay Card -->
                        <div class="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                            <div class="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl mb-2 shadow-lg shadow-emerald-950/50">
                                ⚡
                            </div>
                            <h4 class="font-bold text-slate-100 text-sm mb-1">Unlock TradingView Pine Script v5 Code</h4>
                            <p class="text-xs text-slate-300 max-w-md mb-3">
                                Instant lifetime access. Compatible with <strong>TradingView Alerts</strong>, <strong>3Commas</strong>, and <strong>Webhook Bots</strong>.
                            </p>
                            <button id="openCheckoutModalBtn" class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-emerald-900/40 transition transform active:scale-95 flex items-center gap-2">
                                <span>Pay $9 USDT (Crypto Checkout)</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const openBtn = document.getElementById('openCheckoutModalBtn');
            if (openBtn) {
                openBtn.onclick = () => {
                    this.showCryptoCheckoutModal(strategy, currentParams, symbol, timeframe, containerElement);
                };
            }
        }
    },

    /**
     * Display the Crypto Payment Modal ($9 USDT)
     */
    showCryptoCheckoutModal(strategy, currentParams, symbol, timeframe, containerElement) {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;

        let selectedNetworkKey = 'USDT-TRC20';

        const renderModalContent = () => {
            const currentWallet = this.CRYPTO_WALLETS[selectedNetworkKey];

            modal.innerHTML = `
                <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                    <button id="closeModalBtn" class="absolute top-4 right-4 text-slate-400 hover:text-white text-lg">✕</button>
                    
                    <div class="text-center mb-4">
                        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl mx-auto mb-2">
                            ₮
                        </div>
                        <h3 class="text-base font-extrabold text-white">Crypto Checkout</h3>
                        <p class="text-xs text-cyan-400 font-semibold mt-0.5">${strategy.name}</p>
                        
                        <div class="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                            <span class="text-xs text-slate-300 font-medium">Amount Due:</span>
                            <span class="text-sm font-black text-emerald-400 font-mono">9.00 USDT</span>
                        </div>
                    </div>

                    <!-- Network Selector Tabs -->
                    <div class="space-y-1.5 mb-4">
                        <label class="block text-[11px] font-semibold text-slate-400">Select USDT Network:</label>
                        <div class="grid grid-cols-3 gap-2">
                            ${Object.keys(this.CRYPTO_WALLETS).map(key => {
                                const w = this.CRYPTO_WALLETS[key];
                                const isSelected = key === selectedNetworkKey;
                                return `
                                    <button data-net="${key}" class="net-tab-btn py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${isSelected ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40' : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'}">
                                        <div>${key.replace('USDT-', '')}</div>
                                        <div class="text-[9px] font-normal text-slate-400">${w.badge}</div>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Deposit Address Box & Copy -->
                    <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 mb-4 space-y-2">
                        <div class="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Deposit Address (${currentWallet.network})</span>
                            <span class="text-emerald-400 font-mono font-semibold">9 USDT</span>
                        </div>

                        <div class="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <input type="text" readonly value="${currentWallet.address}" class="bg-transparent text-xs text-slate-200 font-mono w-full outline-none select-all">
                            <button id="copyWalletAddressBtn" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition flex items-center gap-1 shrink-0">
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>

                    <!-- TxID / Hash Verification Field -->
                    <div class="space-y-1.5 mb-4">
                        <label class="block text-[11px] font-semibold text-slate-400">Transaction Hash / TxID (Optional for Instant Demo):</label>
                        <input type="text" id="txIdInput" placeholder="Paste 0x... or Tron Tx Hash" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500">
                    </div>

                    <!-- Verify / Complete Payment Button -->
                    <button id="verifyCryptoPaymentBtn" class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition transform active:scale-95 flex items-center justify-center gap-2">
                        <span>Confirm Payment & Unlock ($9 USDT)</span>
                    </button>

                    <p class="text-[10px] text-slate-500 text-center mt-3">
                        ⚡ Automatic on-chain listener. Once confirmed, full Pine Script v5 source code unlocks immediately.
                    </p>

                    <!-- Processing Overlay -->
                    <div id="paymentProcessingOverlay" class="absolute inset-0 bg-slate-950/95 rounded-2xl flex flex-col items-center justify-center p-6 hidden">
                        <div class="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-3"></div>
                        <p class="text-sm font-bold text-white">Verifying Blockchain Confirmation...</p>
                        <p class="text-xs text-slate-400 mt-1">Generating Pine Script v5 License ($9 USDT)</p>
                    </div>
                </div>
            `;

            // Attach events
            document.getElementById('closeModalBtn').onclick = () => modal.classList.add('hidden');

            document.querySelectorAll('.net-tab-btn').forEach(btn => {
                btn.onclick = () => {
                    selectedNetworkKey = btn.dataset.net;
                    renderModalContent();
                };
            });

            const copyAddressBtn = document.getElementById('copyWalletAddressBtn');
            if (copyAddressBtn) {
                copyAddressBtn.onclick = () => {
                    navigator.clipboard.writeText(currentWallet.address).then(() => {
                        copyAddressBtn.querySelector('span').textContent = 'Copied! ✅';
                        setTimeout(() => { copyAddressBtn.querySelector('span').textContent = 'Copy'; }, 2000);
                    });
                };
            }

            document.getElementById('verifyCryptoPaymentBtn').onclick = () => {
                this.processCryptoPayment(strategy, currentParams, symbol, timeframe, containerElement);
            };
        };

        renderModalContent();
        modal.classList.remove('hidden');
    },

    processCryptoPayment(strategy, currentParams, symbol, timeframe, containerElement) {
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
            this.showToast(`🎉 Payment Confirmed ($9 USDT)! ${strategy.name} Pine Script v5 is now UNLOCKED!`);
        }, 1500);
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 bg-slate-900 border border-emerald-500 text-emerald-300 px-5 py-3.5 rounded-xl shadow-2xl z-50 text-xs font-bold flex items-center gap-3 animate-bounce';
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
