sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Split, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Building2, 
  Landmark, 
  ArrowDown, 
  ArrowRight,
  ArrowDownRight,
  ArrowDownLeft,
  Smartphone,
  CreditCard,
  Receipt,
  Play,
  RotateCcw,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CashfreeEasySplitTab: React.FC = () => {
  const [simAmount, setSimAmount] = useState<number>(10000);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(10000);

  const qivropayTakeRatePercent = 3.0;
  const qivropayFee = (simAmount * qivropayTakeRatePercent) / 100;
  const gstOnFee = (qivropayFee * 18) / 100;
  const tds194O = (simAmount * 1.0) / 100;
  const merchantBase = simAmount - qivropayFee;
  const netMerchantBank = merchantBase - tds194O;

  const [history, setHistory] = useState([
    {
      id: 'cf_split_99201',
      orderId: 'order_qivropay_in_881920',
      customerName: 'Vikramaditya Singhal (Bangalore)',
      paymentMode: 'UPI (GPay / vpa: vikram@okhdfcbank)',
      grossAmount: '₹10,000.00',
      merchantShare: '₹9,700.00',
      qivropayFee: '₹300.00',
      tds194O: '₹100.00',
      netMerchantSettled: '₹9,600.00',
      merchantBankAccount: 'HDFC Bank (A/C **** 4829)',
      bankUtr: 'UTR4829108492019',
      status: 'settled_instantly'
    },
    {
      id: 'cf_split_99202',
      orderId: 'order_qivropay_in_881921',
      customerName: 'Pooja Agarwal (Mumbai)',
      paymentMode: 'RuPay Credit Card on UPI',
      grossAmount: '₹25,000.00',
      merchantShare: '₹24,250.00',
      qivropayFee: '₹750.00',
      tds194O: '₹250.00',
      netMerchantSettled: '₹24,000.00',
      merchantBankAccount: 'ICICI Bank (A/C **** 9102)',
      bankUtr: 'UTR9102837482910',
      status: 'settled_instantly'
    }
  ]);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);

    setTimeout(() => {
      setActiveStep(2);
      setTimeout(() => {
        setActiveStep(3);
        setTimeout(() => {
          setActiveStep(4);
          setTimeout(() => {
            setActiveStep(5);
            setIsSimulating(false);
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handlePreset = (val: number) => {
    setSelectedPreset(val);
    setSimAmount(val);
    setActiveStep(0);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Split className="w-6 h-6 text-[#0055FF]" />
            <span>Cashfree Payment Gateway + Easy Split &amp; Instant Bank Settlement</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous payment orchestration routing Indian Customer checkouts through Cashfree PG, executing real-time Easy Split between Merchant Account &amp; QIVROPAY MoR Take-Rate, and dispatching T+0 instant IMPS payouts.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>CASHFREE EASY SPLIT 2.0 LIVE</span>
        </div>
      </div>

      {/* Simulator Control Bar */}
      <div className="opp-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[#8C90A0]">Live Flow Interactive Simulator</div>
            <div className="text-sm font-bold text-[#0A0D14]">Select or Enter Customer Checkout Value</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[2500, 10000, 25000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                onClick={() => handlePreset(amt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  selectedPreset === amt 
                    ? 'bg-[#0055FF] text-white shadow-sm' 
                    : 'bg-[#F4F5F8] text-[#0A0D14] hover:bg-black/5'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="opp-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-md w-full md:w-auto justify-center"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isSimulating ? 'Processing Live Rail...' : 'Execute Live Architecture Flow'}</span>
          </button>
        </div>
      </div>

      {/* Visual Interactive Architecture Flow Chart matching User ASCII Diagram */}
      <div className="opp-card p-6 sm:p-10 space-y-8 bg-gradient-to-b from-[#FAFBFD] to-white relative overflow-hidden">
        
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0055FF] text-[11px] font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> End-to-End India Settlement Rail
          </div>
          <h3 className="text-lg font-bold text-[#0A0D14] font-heading">Architecture Execution Pipeline</h3>
        </div>

        {/* The Pipeline Container */}
        <div className="flex flex-col items-center max-w-2xl mx-auto space-y-3 relative">
          
          {/* Node 1: Indian Customer */}
          <div className={`w-full max-w-md p-4 rounded-2xl border transition-all duration-500 flex items-center justify-between ${
            activeStep >= 1 
              ? 'bg-blue-50 border-[#0055FF] shadow-md scale-102 ring-2 ring-[#0055FF]/20' 
              : 'bg-white border-black/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0055FF]/10 flex items-center justify-center text-[#0055FF]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-[#8C90A0] uppercase font-bold">Origin</div>
                <div className="text-sm font-bold text-[#0A0D14]">🇮🇳 Indian Customer</div>
                <div className="text-[11px] text-[#6E717D]">Pays via UPI / RuPay / NetBanking</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[#0055FF] text-base">₹{simAmount.toLocaleString('en-IN')}.00</div>
              <div className="text-[10px] text-emerald-600 font-bold">1-Click Authorized</div>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className={`transition-colors duration-300 ${activeStep >= 2 ? 'text-[#0055FF]' : 'text-[#8C90A0]'}`}>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>

          {/* Node 2: QIVROPAY Checkout */}
          <div className={`w-full max-w-md p-4 rounded-2xl border transition-all duration-500 flex items-center justify-between ${
            activeStep >= 2 
              ? 'bg-purple-50 border-purple-500 shadow-md scale-102 ring-2 ring-purple-500/20' 
              : 'bg-white border-black/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-[#8C90A0] uppercase font-bold">Checkout Engine</div>
                <div className="text-sm font-bold text-[#0A0D14]">⚡ QIVROPAY Checkout Modal</div>
                <div className="text-[11px] text-[#6E717D]">Dynamic UPI QR &amp; MoR Invoicing Layer</div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                0.28s Latency
              </span>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className={`transition-colors duration-300 ${activeStep >= 3 ? 'text-purple-600' : 'text-[#8C90A0]'}`}>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>

          {/* Node 3: Cashfree Payment Gateway */}
          <div className={`w-full max-w-md p-4 rounded-2xl border transition-all duration-500 flex items-center justify-between ${
            activeStep >= 3 
              ? 'bg-amber-50 border-amber-500 shadow-md scale-102 ring-2 ring-amber-500/20' 
              : 'bg-white border-black/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-[#8C90A0] uppercase font-bold">Acquiring Gateway</div>
                <div className="text-sm font-bold text-[#0A0D14]">🛡️ Cashfree Payment Gateway</div>
                <div className="text-[11px] text-[#6E717D]">Orders API / 0% MDR on UPI &amp; RuPay</div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                200 OK CAPTURED
              </span>
            </div>
          </div>

          {/* Arrow 3 */}
          <div className={`transition-colors duration-300 ${activeStep >= 4 ? 'text-amber-600' : 'text-[#8C90A0]'}`}>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>

          {/* Node 4: Easy Split Engine */}
          <div className={`w-full max-w-md p-4 rounded-2xl border transition-all duration-500 flex items-center justify-between ${
            activeStep >= 4 
              ? 'bg-emerald-50 border-emerald-500 shadow-md scale-102 ring-2 ring-emerald-500/20' 
              : 'bg-white border-black/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Split className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-[#8C90A0] uppercase font-bold">Automated Multi-Party Ledger</div>
                <div className="text-sm font-bold text-[#0A0D14]">🔀 Cashfree Easy Split</div>
                <div className="text-[11px] text-[#6E717D]">On-the-fly split &amp; statutory TDS withholding</div>
              </div>
            </div>
            <div className="text-right font-mono text-xs font-bold text-emerald-700">
              97.0% : 3.0%
            </div>
          </div>

          {/* Dual Split Branches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2">
            
            {/* Branch A: Merchant Share */}
            <div className="space-y-2">
              <div className="flex justify-center text-emerald-600">
                <ArrowDown className="w-5 h-5" />
              </div>
              <div className={`p-4 rounded-2xl border transition-all duration-500 space-y-2 ${
                activeStep >= 5 
                  ? 'bg-emerald-50/80 border-emerald-400 shadow-md' 
                  : 'bg-white border-black/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#0A0D14] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Merchant Share (97%)</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    ₹{merchantBase.toLocaleString('en-IN')}.00
                  </span>
                </div>
                <div className="text-[11px] text-[#6E717D] space-y-0.5 border-t border-black/5 pt-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Sec 194-O TDS (1%):</span>
                    <span className="text-rose-600">-₹{tds194O.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#0A0D14] pt-0.5">
                    <span>Net Disbursed:</span>
                    <span className="text-emerald-700">₹{netMerchantBank.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                {/* Final Landing: Merchant Bank Account */}
                <div className="pt-2 border-t border-emerald-200/60">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="text-[10px] font-mono text-[#8C90A0] uppercase font-bold">Destination</div>
                        <div className="text-xs font-bold text-[#0A0D14]">Merchant Bank Account</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                      IMPS T+0 PAID
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Branch B: QIVROPAY Platform Fee */}
            <div className="space-y-2">
              <div className="flex justify-center text-[#0055FF]">
                <ArrowDown className="w-5 h-5" />
              </div>
              <div className={`p-4 rounded-2xl border transition-all duration-500 space-y-2 ${
                activeStep >= 5 
                  ? 'bg-blue-50/80 border-blue-400 shadow-md' 
                  : 'bg-white border-black/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#0A0D14] flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-[#0055FF]" />
                    <span>QIVROPAY MoR Fee (3%)</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#0055FF]">
                    ₹{qivropayFee.toLocaleString('en-IN')}.00
                  </span>
                </div>
                <div className="text-[11px] text-[#6E717D] space-y-0.5 border-t border-black/5 pt-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>GST @ 18% on Fee:</span>
                    <span>+₹{gstOnFee.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#0A0D14] pt-0.5">
                    <span>Total Platform Yield:</span>
                    <span className="text-[#0055FF]">₹{(qivropayFee + gstOnFee).toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                {/* Final Landing: QIVROPAY Reserve */}
                <div className="pt-2 border-t border-blue-200/60">
                  <div className="p-2.5 rounded-xl bg-white border border-blue-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#0055FF]" />
                      <div>
                        <div className="text-[10px] font-mono text-[#8C90A0] uppercase font-bold">MoR Revenue</div>
                        <div className="text-xs font-bold text-[#0A0D14]">QIVROPAY Escrow Reserve</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0055FF] font-bold text-[9px]">
                      SETTLED
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Cashfree Split API Payload Preview */}
      <div className="opp-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8C90A0] font-bold">
            <Code2 className="w-4 h-4 text-[#0055FF]" />
            <span>Cashfree Easy Split 2.0 API Payload (/pg/orders/{'{order_id}'}/splits)</span>
          </div>
          <span className="text-[10px] font-mono bg-[#FAFBFD] px-2 py-0.5 rounded border border-black/10 text-emerald-700 font-bold">
            HTTP 200 OK
          </span>
        </div>

        <pre className="p-4 rounded-xl bg-[#0A0D14] text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
{`{
  "order_id": "order_qivropay_in_881920",
  "order_amount": ₹{simAmount}.00,
  "order_currency": "INR",
  "split_type": "PERCENTAGE_AND_TDS_WITHHOLDING",
  "transfers": [
    {
      "vendor_id": "MERCHANT_QIVROPAY_IND_0981",
      "percentage": 97.0,
      "amount": ₹{merchantBase}.00,
      "tds_deduction": {
        "section": "194-O",
        "rate": 1.0,
        "amount": ₹{tds194O}.00
      },
      "payout_mode": "IMPS_INSTANT_T0",
      "beneficiary_account": "HDFC0000060_4829"
    },
    {
      "vendor_id": "QIVROPAY_PLATFORM_MOR_RESERVE",
      "percentage": 3.0,
      "amount": ₹{qivropayFee}.00,
      "tax_invoicing": {
        "sac_code": "998313",
        "gst_rate": 18.0,
        "gst_amount": ₹{gstOnFee}.00
      }
    }
  ]
}`}
        </pre>
      </div>

      {/* Settled Transactions Ledger */}
      <div className="opp-card overflow-hidden">
        <div className="p-4 border-b border-black/[0.06] bg-[#FAFBFD] flex items-center justify-between">
          <div className="text-xs font-bold text-[#0A0D14] font-mono uppercase">
            Live Cashfree Easy Split Settlement Log
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold">
            100% Reconciled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Order Reference</th>
                <th className="p-4 font-semibold">Customer &amp; Payment Rail</th>
                <th className="p-4 font-semibold">Gross Value</th>
                <th className="p-4 font-semibold">QIVROPAY Fee (3%)</th>
                <th className="p-4 font-semibold">Merchant Net Bank (IMPS)</th>
                <th className="p-4 font-semibold">Bank UTR &amp; Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-[#0055FF]">{h.orderId}</div>
                    <div className="font-mono text-[#8C90A0] text-[10px]">{h.id}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14]">{h.customerName}</div>
                    <div className="text-[#6E717D] text-[11px]">{h.paymentMode}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {h.grossAmount}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {h.qivropayFee}
                  </td>
                  <td className="p-4">
                    <div className="font-mono font-bold text-emerald-700 text-sm">{h.netMerchantSettled}</div>
                    <div className="font-mono text-[#8C90A0] text-[10px]">{h.merchantBankAccount}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      IMPS SETTLED
                    </span>
                    <div className="font-mono text-[#8C90A0] text-[10px] mt-0.5">{h.bankUtr}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
