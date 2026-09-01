import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  Building, 
  CheckCircle2, 
  ArrowUpRight, 
  Plus, 
  Clock, 
  Globe2, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const InstantPayoutsTab: React.FC = () => {
  const [payouts, setPayouts] = useState([
    {
      id: 'pout_inst_901',
      amount: 8500.00,
      currency: 'INR',
      rail: 'SEPA Instant (EU)',
      recipientBank: 'Deutsche Bank AG (DE89 3704 ...)',
      fee: 1.50,
      settlementTime: 'Sub-10 seconds',
      status: 'settled',
      timestamp: 'Today, 04:30 AM'
    },
    {
      id: 'pout_inst_902',
      amount: 4200.00,
      currency: 'INR',
      rail: 'Faster Payments (UK)',
      recipientBank: 'Barclays Bank UK (GB29 BUKB ...)',
      fee: 1.00,
      settlementTime: 'Sub-10 seconds',
      status: 'settled',
      timestamp: 'Yesterday, 02:15 PM'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState(2500);
  const [currency, setCurrency] = useState('INR');
  const [rail, setRail] = useState('SEPA Instant (EU)');
  const [bankAccount, setBankAccount] = useState('DE89 3704 0044 0532 0130 99');
  const [dispatching, setDispatching] = useState(false);

  const handleCreatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatching(true);

    setTimeout(() => {
      const newPout = {
        id: `pout_inst_${Date.now().toString().slice(-3)}`,
        amount: Number(amount),
        currency,
        rail,
        recipientBank: bankAccount,
        fee: 1.50,
        settlementTime: 'Sub-10 seconds',
        status: 'settled',
        timestamp: 'Just now'
      };

      setPayouts([newPout, ...payouts]);
      setDispatching(false);
      setShowModal(false);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 1000);
  };

  const totalSettled = payouts.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#0055FF]" />
            <span>Instant T+0 Multi-Currency Local Rail Payouts</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Withdraw settled merchant balances immediately to local bank accounts via SEPA Instant, UK Faster Payments, IMPS, and PIX in sub-10 seconds.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Instant T+0 Payout</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Instant Payout Volume Settled</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹{totalSettled.toLocaleString(undefined, { minimumFractionDigits: 2 })} INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sub-10 second delivery SLA
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Available Instant Float</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹84,250.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">0% hold time under QIVROPAY MoR</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Local Rails Supported</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">45+ Currencies</div>
          <div className="text-[11px] text-purple-700 font-mono">SEPA, Faster Payments, PIX, IMPS</div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Payout ID</th>
                <th className="p-4 font-semibold">Amount & Currency</th>
                <th className="p-4 font-semibold">Local Direct Rail</th>
                <th className="p-4 font-semibold">Destination Bank Account</th>
                <th className="p-4 font-semibold">Settlement Speed</th>
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {p.id}
                  </td>
                  <td className="p-4 font-mono font-bold text-base text-[#0A0D14]">
                    {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {p.currency}
                  </td>
                  <td className="p-4 font-semibold text-[#0055FF]">
                    {p.rail}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {p.recipientBank}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {p.settlementTime}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px]">
                    {p.timestamp}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      INSTANT SETTLED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Request Instant T+0 Payout</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreatePayout} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Payout Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      if (e.target.value === 'INR') setRail('SEPA Instant (EU)');
                      if (e.target.value === 'INR') setRail('Faster Payments (UK)');
                      if (e.target.value === 'INR') setRail('FedNow / RTP (US)');
                    }}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                  >
                    <option value="INR">INR (€)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="INR">INR (£)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Fast Direct Rail</label>
                <input
                  type="text"
                  readOnly
                  value={rail}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-semibold text-[#0055FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Recipient IBAN / Bank Details</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={dispatching} className="opp-btn-primary px-5 py-2 font-semibold flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 ${dispatching ? 'animate-spin' : ''}`} />
                  <span>{dispatching ? 'Dispatching Wire...' : 'Authorize Instant Payout'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
