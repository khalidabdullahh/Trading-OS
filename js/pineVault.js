/**
 * Trading-OS Pine Script Code Vault & Binance Pay Integration
 * Official Binance Pay ID: 716216436 | Flat $9 USDT Pricing
 * Author: Khalid Abdullah (Trading-OS)
 */

const PineVault = {
    unlockedStrategies: new Set(),

    // Official Binance Pay Config
    BINANCE_PAY_CONFIG: {
        payId: '716216436',
        merchantName: 'Khalid Abdullah',
        amountUSDT: 9.00,
        currency: 'USDT'
    },

    // Official Deposit Options
    CRYPTO_WALLETS: {
        'BINANCE-PAY': {
            network: 'Binance Pay (0% Fee)',
            address: '716216436',
            label: 'Binance Pay ID / UID',
            badge: 'Instant • 0% Fee',
            recommended: true
        },
        'USDT-TRC20': {
            network: 'Tron (TRC-20)',
            address: 'TDH1vjLT9zcDoGd9sVEcEBcomp3Da5Rjjm',
            label: 'Tron USDT (TRC-20) Address',
            badge: 'Low Fee'
        },
        'USDT-BEP20': {
            network: 'BNB Smart Chain (BEP-20)',
            address: '0xd6fa32d746d7044b281135f509a7494669a22472',
            label: 'BNB Chain USDT (BEP-20) Address',
            badge: 'BNB Chain'
        },
        'USDT-ERC20': {
            network: 'Ethereum (ERC-20)',
            address: '0xd6fa32d746d7044b281135f509a7494669a22472',
            label: 'Ethereum USDT (ERC-20) Address',
            badge: 'Ethereum'
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
            // Locked View with Obfuscated / Blurred Code & Binance Pay CTA ($9 USDT)
            const dummyBlurredSnippet = pineCode.split('\n').slice(0, 15).join('\n');

            containerElement.innerHTML = `
                <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg bg-[#F0B90B]/10 text-[#F0B90B] border border-[#F0B90B]/30 flex items-center justify-center font-bold text-base">
                                🟡
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-100 text-base flex items-center gap-2">
                                    TradingView Pine Script v5 Code
                                    <span class="px-2 py-0.5 text-xs font-semibold bg-[#F0B90B]/10 text-[#F0B90B] border border-[#F0B90B]/30 rounded-full flex items-center gap-1">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#F0B90B]"></span> Binance Pay
                                    </span>
                                </h3>
                                <p class="text-xs text-slate-400">Export verified strategy rules directly into TradingView Pine Editor</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-slate-400 line-through mr-1">$49</span>
                            <span class="text-xl font-black text-[#F0B90B] font-mono">$9 USDT</span>
                            <span class="text-[10px] text-slate-400 block font-medium">Flat Price • Lifetime License</span>
                        </div>
                    </div>

                    <!-- Blurred Code Preview Wrapper -->
                    <div class="mt-4 relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950/80">
                        <div class="p-4 font-mono text-xs text-slate-500 select-none filter blur-[3.5px] pointer-events-none opacity-40 leading-relaxed max-h-48 overflow-hidden">
                            ${this.escapeHtml(dummyBlurredSnippet)}
                        </div>

                        <!-- Paywall Overlay Card -->
                        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                            <div class="w-12 h-12 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] flex items-center justify-center text-xl mb-2 shadow-lg shadow-amber-950/50">
                                ⚡
                            </div>
                            <h4 class="font-bold text-slate-100 text-sm mb-1">Unlock TradingView Pine Script v5 Code</h4>
                            <p class="text-xs text-slate-300 max-w-md mb-3">
                                Instant lifetime license. Pay with <strong>Binance Pay (UID: 716216436)</strong> for zero fees and instant verification.
                            </p>
                            <button id="openCheckoutModalBtn" class="px-5 py-2.5 bg-gradient-to-r from-[#F0B90B] to-amber-500 hover:from-[#FCD535] hover:to-[#F0B90B] text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-amber-950/40 transition transform active:scale-95 flex items-center gap-2">
                                <span>Pay $9 USDT with Binance Pay</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const openBtn = document.getElementById('openCheckoutModalBtn');
            if (openBtn) {
                openBtn.onclick = () => {
                    this.showBinancePayModal(strategy, currentParams, symbol, timeframe, containerElement);
                };
            }
        }
    },

    /**
     * Display the Official Binance Pay Checkout Modal ($9 USDT)
     */
    showBinancePayModal(strategy, currentParams, symbol, timeframe, containerElement) {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;

        let selectedMethodKey = 'BINANCE-PAY';

        const renderModalContent = () => {
            const currentOption = this.CRYPTO_WALLETS[selectedMethodKey];
            const isBinancePay = selectedMethodKey === 'BINANCE-PAY';

            modal.innerHTML = `
                <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                    <button id="closeModalBtn" class="absolute top-4 right-4 text-slate-400 hover:text-white text-lg">✕</button>
                    
                    <div class="text-center mb-4">
                        <div class="w-12 h-12 rounded-xl bg-[#F0B90B]/10 text-[#F0B90B] border border-[#F0B90B]/30 flex items-center justify-center text-2xl mx-auto mb-2">
                            🟡
                        </div>
                        <h3 class="text-base font-extrabold text-white flex items-center justify-center gap-1.5">
                            <span>Binance Pay Checkout</span>
                        </h3>
                        <p class="text-xs text-cyan-400 font-semibold mt-0.5">${strategy.name}</p>
                        
                        <div class="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0B90B]/10 border border-[#F0B90B]/30 rounded-full">
                            <span class="text-xs text-slate-300 font-medium">Amount Due:</span>
                            <span class="text-sm font-black text-[#F0B90B] font-mono">9.00 USDT</span>
                        </div>
                    </div>

                    <!-- Payment Method Tabs -->
                    <div class="space-y-1.5 mb-4">
                        <label class="block text-[11px] font-semibold text-slate-400">Payment Option:</label>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            ${Object.keys(this.CRYPTO_WALLETS).map(key => {
                                const w = this.CRYPTO_WALLETS[key];
                                const isSelected = key === selectedMethodKey;
                                return `
                                    <button data-key="${key}" class="pay-tab-btn py-2 px-1.5 rounded-xl text-[11px] font-bold border transition text-center ${isSelected ? 'bg-[#F0B90B]/20 border-[#F0B90B] text-[#F0B90B] shadow-md shadow-amber-950/40' : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'}">
                                        <div class="truncate">${key.replace('BINANCE-', '').replace('USDT-', '')}</div>
                                        <div class="text-[9px] font-normal text-slate-400 truncate">${w.badge}</div>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Binance Pay Details Box -->
                    <div class="bg-slate-950/90 border border-slate-800 rounded-xl p-4 mb-4 space-y-3">
                        <div class="flex items-center justify-between text-[11px] text-slate-400">
                            <span class="font-semibold text-slate-300">${currentOption.label}</span>
                            <span class="text-[#F0B90B] font-mono font-bold">9 USDT</span>
                        </div>

                        <!-- Pay ID Copy Box -->
                        <div class="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                            <input type="text" readonly value="${currentOption.address}" class="bg-transparent text-sm text-[#F0B90B] font-mono font-bold w-full outline-none select-all tracking-wide">
                            <button id="copyPayIdBtn" class="px-3 py-1 bg-[#F0B90B] hover:bg-[#FCD535] text-slate-950 rounded text-xs font-bold transition flex items-center gap-1 shrink-0">
                                <span>Copy ID</span>
                            </button>
                        </div>

                        <!-- Instructions for Binance Pay -->
                        ${isBinancePay ? `
                            <div class="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                                <div class="font-bold text-slate-300 mb-0.5">📱 How to Pay via Binance App:</div>
                                <div class="flex items-start gap-1.5"><span>1.</span> <span>Open Binance App ➔ Tap <strong>Pay</strong> (top right icon).</span></div>
                                <div class="flex items-start gap-1.5"><span>2.</span> <span>Tap <strong>Send</strong> ➔ Select <strong>Pay ID / UID</strong>.</span></div>
                                <div class="flex items-start gap-1.5"><span>3.</span> <span>Enter Pay ID: <strong class="text-[#F0B90B] font-mono">716216436</strong> ➔ Send <strong class="text-white">9 USDT</strong>.</span></div>
                            </div>
                        ` : `
                            <div class="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                                Send exactly <strong>9.00 USDT</strong> to the above deposit address on ${currentOption.network}.
                            </div>
                        `}
                    </div>

                    <!-- Order ID / Reference Input Field -->
                    <div class="space-y-1.5 mb-4">
                        <label class="block text-[11px] font-semibold text-slate-400">Binance Pay Order ID / TxID Reference:</label>
                        <input type="text" id="binanceOrderIdInput" placeholder="Enter your 19-digit Order ID or TxID" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#F0B90B]">
                    </div>

                    <!-- Confirm Payment & Unlock Button -->
                    <button id="verifyBinancePayBtn" class="w-full py-3 bg-gradient-to-r from-[#F0B90B] via-amber-500 to-yellow-500 hover:from-[#FCD535] hover:to-[#F0B90B] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/40 transition transform active:scale-95 flex items-center justify-center gap-2">
                        <span>Confirm Payment & Unlock ($9 USDT)</span>
                    </button>

                    <p class="text-[10px] text-slate-500 text-center mt-3">
                        ⚡ Instant verification. Full Pine Script v5 code unlocks immediately after confirmation.
                    </p>

                    <!-- Processing Overlay -->
                    <div id="paymentProcessingOverlay" class="absolute inset-0 bg-slate-950/95 rounded-2xl flex flex-col items-center justify-center p-6 hidden">
                        <div class="w-10 h-10 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin mb-3"></div>
                        <p class="text-sm font-bold text-white">Verifying Binance Pay Transaction...</p>
                        <p class="text-xs text-slate-400 mt-1">Checking UID: 716216436 • Order ID</p>
                    </div>
                </div>
            `;

            // Attach events
            document.getElementById('closeModalBtn').onclick = () => modal.classList.add('hidden');

            document.querySelectorAll('.pay-tab-btn').forEach(btn => {
                btn.onclick = () => {
                    selectedMethodKey = btn.dataset.key;
                    renderModalContent();
                };
            });

            const copyIdBtn = document.getElementById('copyPayIdBtn');
            if (copyIdBtn) {
                copyIdBtn.onclick = () => {
                    navigator.clipboard.writeText(currentOption.address).then(() => {
                        copyIdBtn.querySelector('span').textContent = 'Copied! ✅';
                        setTimeout(() => { copyIdBtn.querySelector('span').textContent = 'Copy ID'; }, 2000);
                    });
                };
            }

            document.getElementById('verifyBinancePayBtn').onclick = () => {
                const txId = (document.getElementById('binanceOrderIdInput')?.value || '').trim();
                if (!txId) {
                    alert('Please enter your Binance Order ID or Transaction Hash (TxID) to verify.');
                    return;
                }
                this.processBinancePayment(strategy, currentParams, symbol, timeframe, containerElement, selectedMethodKey, currentOption, txId);
            };
        };

        renderModalContent();
        modal.classList.remove('hidden');
    },

    async processBinancePayment(strategy, currentParams, symbol, timeframe, containerElement, selectedMethodKey, currentOption, txId) {
        const modal = document.getElementById('checkoutModal');
        const processingOverlay = document.getElementById('paymentProcessingOverlay');

        if (processingOverlay) processingOverlay.classList.remove('hidden');

        try {
            // Run Triple-Layer Blockchain & Payment Verification
            const result = await PaymentVerifier.verifyPayment({
                method: selectedMethodKey,
                txId: txId,
                expectedRecipient: currentOption.address,
                expectedAmount: 9.0,
                strategyName: strategy.name,
                symbol,
                timeframe
            });

            setTimeout(() => {
                if (processingOverlay) processingOverlay.classList.add('hidden');
                if (modal) modal.classList.add('hidden');

                // Unlock strategy
                this.unlock(strategy.id);

                // Re-render
                this.renderVaultSection(strategy, currentParams, symbol, timeframe, containerElement);

                // Show Toast
                this.showToast(`🎉 Payment Verified ($9 USDT)! ${strategy.name} Pine Script v5 is now UNLOCKED!`);
            }, 1200);
        } catch (err) {
            if (processingOverlay) processingOverlay.classList.add('hidden');
            alert(`⚠️ Verification Notice: ${err.message}`);
        }
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 bg-slate-900 border border-[#F0B90B] text-[#F0B90B] px-5 py-3.5 rounded-xl shadow-2xl z-50 text-xs font-bold flex items-center gap-3 animate-bounce';
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
