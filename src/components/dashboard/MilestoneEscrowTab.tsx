sed: --: No such file or directory
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  DollarSign, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MilestoneEscrowTab: React.FC = () => {
  const [escrows, setEscrows] = useState([
    {
      id: 'esc_deal_401',
      clientName: 'Palantir Solutions Group',
      totalContract: '₹120,000.00 INR',
      heldInEscrow: '₹60,000.00 INR',
      nextMilestone: 'Phase 2 API Integration Signoff',
      milestoneAmount: '₹30,000.00 INR',
      status: 'milestone_ready_to_release'
    }
  ]);

  const [releasing, setReleasing] = useState(false);

  const handleReleaseMilestone = () => {
    setReleasing(true);
    setTimeout(() => {
      setReleasing(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#0055FF]" />
            <span>B2B Milestone Escrow & Split-Release Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Segregated FDIC-insured escrow contract accounts holding enterprise buyer deposits and releasing payment tranches upon automated deliverable sign-offs.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>FDIC-INSURED TRUST ESCROW</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Total Active Escrow Balances</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">₹60,000.00 INR</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fully segregated client funds
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Milestones Ready to Release</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">₹30,000.00 INR</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">1 deliverable signed by client</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Enterprise Payment Security</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">100% Risk Free</div>
          <div className="text-[11px] text-purple-700 font-mono">Guaranteed payout upon completion</div>
        </div>
      </div>

      {/* Escrows Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Escrow ID</th>
                <th className="p-4 font-semibold">Enterprise Client</th>
                <th className="p-4 font-semibold">Total Contract Value</th>
                <th className="p-4 font-semibold">Held in Escrow</th>
                <th className="p-4 font-semibold">Next Milestone Tranche</th>
                <th className="p-4 font-semibold">Milestone Release</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {escrows.map((e) => (
                <tr key={e.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {e.id}
                  </td>
                  <td className="p-4 font-bold text-[#0A0D14]">
                    {e.clientName}
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#0055FF]">
                    {e.totalContract}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {e.heldInEscrow}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {e.nextMilestone} ({e.milestoneAmount})
                  </td>
                  <td className="p-4">
                    <button
                      onClick={handleReleaseMilestone}
                      disabled={releasing}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{releasing ? 'Releasing Funds...' : 'Release ₹30k Tranche'}</span>
                    </button>
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
