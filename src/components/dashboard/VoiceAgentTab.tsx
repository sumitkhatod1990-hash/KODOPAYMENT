import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mic, 
  MicOff, 
  PhoneCall, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  CreditCard, 
  Terminal,
  Volume2,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VoiceAgentTab: React.FC = () => {
  const [callActive, setCallActive] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ sender: 'agent' | 'user' | 'system'; text: string }>>([
    { sender: 'agent', text: "Hello! This is Sarah from SynthFlow billing support. How can I assist you today?" },
    { sender: 'user', text: "I'd like to renew my Enterprise GPU license and pay over the phone." },
    { sender: 'agent', text: "Certainly! I've authorized your Enterprise GPU cluster invoice for $4,800.00 USD. Sending a 1-tap Apple Pay SMS trigger to your verified phone number now." },
    { sender: 'system', text: "⚡ [KODO Intent Triggered]: payment_intent_created (Amount: $4,800.00, Status: Succeeded via Apple Pay SMS Token)" }
  ]);

  const [simulatedVoiceInput, setSimulatedVoiceInput] = useState("Please upgrade my quota to 500M inference tokens.");
  const [processing, setProcessing] = useState(false);

  const handleSimulateVoiceCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedVoiceInput) return;

    setProcessing(true);
    const userMsg = { sender: 'user' as const, text: simulatedVoiceInput };
    setTranscript(prev => [...prev, userMsg]);

    setTimeout(() => {
      const agentReply = { 
        sender: 'agent' as const, 
        text: `Got it! Upgrading your account to 500M tokens ($240.00/mo). I've charged your default card on file ending in 4242.` 
      };
      const sysMsg = {
        sender: 'system' as const,
        text: `⚡ [KODO MoR Verified]: sub_update_succeeded (Charge: $240.00, 0% Tax Liability under US Nexus)`
      };
      setTranscript(prev => [...prev, agentReply, sysMsg]);
      setProcessing(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Mic className="w-6 h-6 text-[#0055FF]" />
            <span>Autonomous AI Voice & Conversational Checkout Agent</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Equip ElevenLabs, Retell, and Vapi AI phone voice agents to securely create payment intents, process upgrades, and confirm transactions over conversational telephony.
          </p>
        </div>

        <div className="opp-badge self-start sm:self-auto text-emerald-700 font-bold bg-emerald-50 border-emerald-200">
          <PhoneCall className="w-4 h-4 text-emerald-600" />
          <span>VOICE TELEPHONY GATEWAY READY</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Voice Payment Volume</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">$34,800.00 USD</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> PCI-DSS Level 1 Voice Compliant
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Average Call Conversion</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">68.4%</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">1-tap SMS & card-on-file execution</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Voice Latency SLA</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 380ms</div>
          <div className="text-[11px] text-purple-700 font-mono">Real-time WebSocket streaming</div>
        </div>
      </div>

      {/* Interactive Telephony Simulator */}
      <div className="opp-card p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <h3 className="font-bold text-base text-[#0A0D14] font-heading flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#0055FF]" />
            <span>Live Voice Stream & Telephony Transcript</span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            WEBSOCKET CONNECTED
          </span>
        </div>

        {/* Transcript Box */}
        <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-black/5 space-y-3 max-h-72 overflow-y-auto font-sans text-xs">
          {transcript.map((msg, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-xl ${
                msg.sender === 'agent' 
                  ? 'bg-blue-50/70 border border-blue-100 text-[#0A0D14]' 
                  : msg.sender === 'user' 
                  ? 'bg-white border border-black/5 text-[#0A0D14] font-semibold' 
                  : 'bg-emerald-50/70 border border-emerald-100 font-mono text-emerald-800 text-[11px]'
              }`}
            >
              <span className="font-bold uppercase text-[10px] text-[#8C90A0] block mb-1">
                {msg.sender === 'agent' ? 'AI Voice Agent' : msg.sender === 'user' ? 'Customer Phone Call' : 'KODO Engine'}
              </span>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSimulateVoiceCommand} className="flex gap-2">
          <input
            type="text"
            value={simulatedVoiceInput}
            onChange={(e) => setSimulatedVoiceInput(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-black/10 bg-[#F4F5F8] text-xs font-mono text-[#0A0D14]"
            placeholder="Simulate speech to text input..."
          />
          <button
            type="submit"
            disabled={processing}
            className="opp-btn-primary px-6 py-3 text-xs font-semibold flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{processing ? 'Processing Speech...' : 'Speak to Voice Agent'}</span>
          </button>
        </form>
      </div>

    </div>
  );
};
