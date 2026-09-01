sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Cpu, 
  Coins, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Plus, 
  Terminal, 
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AgentWalletsTab: React.FC = () => {
  const { agentWallets, createAgentWallet, topupAgentWallet } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [initialBalance, setInitialBalance] = useState(50);
  const [autoRefillThreshold, setAutoRefillThreshold] = useState(10);
  const [autoRefillAmount, setAutoRefillAmount] = useState(50);
  const [toppingUpId, setToppingUpId] = useState<string | null>(null);

  const totalBalance = agentWallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const totalConsumed = agentWallets.reduce((acc, w) => acc + (w.totalConsumed || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName) return;
    await createAgentWallet({ agentName, initialBalance, autoRefillThreshold, autoRefillAmount });
    setAgentName('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handleTopup = async (walletId: string) => {
    setToppingUpId(walletId);
    await topupAgentWallet(walletId, 50);
    setToppingUpId(null);
    confetti({ particleCount: 40, spread: 40, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            Autonomous AI Agent Wallets
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Programmatic credit balances, automated credit card auto-topups, and micro-inference deduction telemetry.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Agent Wallet</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Agent Float Balance</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹{totalBalance.toFixed(2)} INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-refill rails active
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Agent Compute Incurred</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">₹{totalConsumed.toFixed(2)} INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Micro-metered per 1k tokens</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active AI Workers</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{agentWallets.length}</div>
          <div className="text-[11px] text-purple-700 font-mono">LangChain / CrewAI / AutoGen</div>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Agent Name / ID</th>
                <th className="p-4 font-semibold">Current Balance</th>
                <th className="p-4 font-semibold">Auto-Refill Threshold</th>
                <th className="p-4 font-semibold">Refill Amount</th>
                <th className="p-4 font-semibold">Total Incurred</th>
                <th className="p-4 font-semibold">Last Refill</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {agentWallets.map((wallet) => (
                <tr key={wallet.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#0A0D14] flex items-center gap-1.5 font-mono">
                      <Cpu className="w-3.5 h-3.5 text-[#0055FF]" />
                      <span>{wallet.agentName}</span>
                    </div>
                    <div className="text-[10px] text-[#8C90A0] font-mono">{wallet.id}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-lg text-[#0055FF]">
                    ${wallet.balance.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    When &lt; ${wallet.autoRefillThreshold.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    +₹{wallet.autoRefillAmount.toFixed(2)}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    ${(wallet.totalConsumed || 0).toFixed(2)}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-[#8C90A0]">
                    {wallet.lastRefill}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      ACTIVE
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleTopup(wallet.id)}
                      disabled={toppingUpId === wallet.id}
                      className="opp-btn-secondary px-3 py-1 text-[11px] font-bold flex items-center gap-1"
                    >
                      <Coins className="w-3 h-3 text-[#0055FF]" />
                      <span>{toppingUpId === wallet.id ? 'Topping Up...' : '+₹50 Top-up'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Ingestion Example */}
      <div className="opp-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#0055FF]" />
          <h3 className="font-bold text-[#0A0D14] text-sm">How AI Agents Programmatically Incur Balance in Python</h3>
        </div>
        <pre className="p-4 rounded-2xl bg-[#0A0D14] text-emerald-300 font-mono text-xs overflow-x-auto">
{`from qivropay import QivroPayAgentWallet

wallet = QivroPayAgentWallet(api_key="qivropay_live_...", wallet_id="wallet_agent_01")

# Deduct fractional micro-cents after completing LLM inference task
wallet.deduct_compute(
    prompt_tokens=4200,
    completion_tokens=850,
    model="claude-3-5-sonnet",
    cost_usd=0.015
)
print("Updated wallet balance:", wallet.get_balance())`}
        </pre>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Provision New Agent Wallet</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Agent Identifier / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DataScraper-Autonomous-Bot"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Initial (₹)</label>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Refill When &lt; (₹)</label>
                  <input
                    type="number"
                    value={autoRefillThreshold}
                    onChange={(e) => setAutoRefillThreshold(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0A0D14]">Refill + (₹)</label>
                  <input
                    type="number"
                    value={autoRefillAmount}
                    onChange={(e) => setAutoRefillAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Provision Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
