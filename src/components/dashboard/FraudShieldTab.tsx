import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Sliders, 
  Globe2, 
  Zap, 
  Ban, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FraudShieldTab: React.FC = () => {
  const [rules, setRules] = useState([
    {
      id: 'fs_01',
      name: 'Card Velocity Velocity Limiter',
      condition: 'Max 3 failed checkout attempts per IP in 60 mins',
      action: 'Block IP & Require Captcha',
      blockedCount: 142,
      status: 'active'
    },
    {
      id: 'fs_02',
      name: 'TOR & Anonymous Proxy Filter',
      condition: 'Incoming IP matched to known TOR exit relay or open VPN',
      action: 'Trigger Mandatory 3DS 2.0 Step-Up',
      blockedCount: 389,
      status: 'active'
    },
    {
      id: 'fs_03',
      name: 'High-Risk BIN Range Geofence',
      condition: 'Prepaid disposable card BINs with 0 balance history',
      action: 'Block & Request Alternative Rail',
      blockedCount: 68,
      status: 'active'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [condition, setCondition] = useState('Max 5 transactions per customer per 10 mins');
  const [action, setAction] = useState('Trigger Step-Up 3DS 2.0');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    const newRule = {
      id: `fs_${Date.now().toString().slice(-3)}`,
      name: ruleName,
      condition,
      action,
      blockedCount: 0,
      status: 'active'
    };

    setRules([newRule, ...rules]);
    setRuleName('');
    setShowModal(false);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const totalBlocked = rules.reduce((acc, r) => acc + r.blockedCount, 0);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#0055FF]" />
            <span>AI Dynamic Fraud Velocity & Geofencing Shield</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Granular transaction rate limiters, proxy blocking, disposable card filtering, and automated 3DS 2.0 biometric challenge rules.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Shield Rule</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Fraud Attacks Intercepted</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{totalBlocked} Blocked</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> 0.00% Merchant Chargeback Rate
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Active Velocity Filters</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">{rules.length} Rules Active</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Sub-5ms evaluation latency</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Risk Decision Engine</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">99.98% Precision</div>
          <div className="text-[11px] text-purple-700 font-mono">&lt; 0.02% false positive rate</div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Security Rule Name</th>
                <th className="p-4 font-semibold">Trigger Condition</th>
                <th className="p-4 font-semibold">Automated Enforcement Action</th>
                <th className="p-4 font-semibold">Attacks Blocked</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-bold text-[#0A0D14] font-sans">
                    {rule.name}
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {rule.condition}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {rule.action}
                  </td>
                  <td className="p-4 font-mono font-bold text-rose-600">
                    {rule.blockedCount} Blocked
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ENFORCING
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
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Create Custom Fraud Rule</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block High-Velocity Email Domains"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Trigger Condition</label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Enforcement Action</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-semibold text-[#0A0D14]"
                >
                  <option value="Trigger Mandatory 3DS 2.0 Step-Up">Trigger Mandatory 3DS 2.0 Step-Up</option>
                  <option value="Block Transaction Immediately">Block Transaction Immediately</option>
                  <option value="Flag for Manual Review">Flag for Manual Review</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Deploy Shield Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
