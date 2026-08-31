import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  ArrowRight,
  Download,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DisputeRebuttalTab: React.FC = () => {
  const [rebuttals, setRebuttals] = useState([
    {
      id: 'reb_kodo_781',
      disputeId: 'disp_001_fraudulent',
      amount: '$499.00 USD',
      reason: 'Fraudulent Transaction (Claimed Unauthorized)',
      evidenceCompiled: [
        'IP Geolocation Match (98.4% Confidence)',
        'Verified 3DSv2 Biometric Fingerprint (ECI 05)',
        'Server Access API Logs (42 API calls post-purchase)',
        'Digital Contract E-Sign Hash Verified'
      ],
      winRatePrediction: '94.2%',
      status: 'submitted_to_bank',
      generatedAt: 'Aug 30, 2026'
    }
  ]);

  const [generating, setGenerating] = useState(false);

  const handleGenerateNewPack = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0055FF]" />
            <span>AI Dispute Auto-Rebuttal Evidence Pack Generator</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Autonomous LLM synthesis compiling IP logs, 3DS biometric telemetry, customer SLA signatures, and API usage records into 10-page bank-ready rebuttal packages in 3 seconds.
          </p>
        </div>

        <button
          onClick={handleGenerateNewPack}
          disabled={generating}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? 'Compiling AI Evidence...' : 'Generate New Evidence Pack'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Rebuttal Win Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">88.6% Won</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Industry benchmark is ~40%
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Funds Recovered from Chargebacks</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">$31,450.00 USD</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">100% automated bank submissions</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Evidence Compilation Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 3.2s</div>
          <div className="text-[11px] text-purple-700 font-mono">Instant PDF document assembly</div>
        </div>
      </div>

      {/* Rebuttals Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Evidence Pack ID</th>
                <th className="p-4 font-semibold">Disputed Amount</th>
                <th className="p-4 font-semibold">Cardholder Reason</th>
                <th className="p-4 font-semibold">AI Synthesized Evidence</th>
                <th className="p-4 font-semibold">Win Prediction</th>
                <th className="p-4 font-semibold">Bank Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rebuttals.map((reb) => (
                <tr key={reb.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {reb.id}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {reb.amount}
                  </td>
                  <td className="p-4 text-[#6E717D]">
                    {reb.reason}
                  </td>
                  <td className="p-4 font-mono text-[11px] space-y-1">
                    {reb.evidenceCompiled.map((ev, i) => (
                      <div key={i} className="flex items-center gap-1 text-[#0A0D14]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0055FF]">
                    {reb.winRatePrediction}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      SUBMITTED TO BANK
                    </span>
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
