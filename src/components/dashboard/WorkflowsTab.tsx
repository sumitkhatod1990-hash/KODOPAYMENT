import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  Plus, 
  CheckCircle2, 
  MessageSquare, 
  Mail, 
  ShieldCheck, 
  Key, 
  ArrowRight, 
  Sliders, 
  Power,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WorkflowsTab: React.FC = () => {
  const [workflows, setWorkflows] = useState([
    {
      id: 'wf_01',
      name: 'High-Value Payment Slack Alert',
      trigger: 'payment.succeeded',
      condition: 'amount >= 100 USD',
      action: 'Post Slack Notification',
      target: '#revenue-celebrations',
      executions: 42,
      active: true
    },
    {
      id: 'wf_02',
      name: 'Pro SaaS Discord VIP Role Grant',
      trigger: 'subscription.created',
      condition: 'plan == Pro Intelligence SaaS',
      action: 'Grant Discord Role',
      target: '@VIP Member',
      executions: 18,
      active: true
    },
    {
      id: 'wf_03',
      name: 'Auto-Generate License Key',
      trigger: 'payment.succeeded',
      condition: 'type == license',
      action: 'Issue Cryptographic Key',
      target: 'Customer Email',
      executions: 7,
      active: true
    },
    {
      id: 'wf_04',
      name: 'Smart Dunning Retries Trigger',
      trigger: 'payment.failed',
      condition: 'attempt <= 3',
      action: 'Schedule Smart Card Retry',
      target: 'Customer Billing Portal',
      executions: 12,
      active: true
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('payment.succeeded');
  const [condition, setCondition] = useState('amount >= 50');
  const [action, setAction] = useState('Post Slack Notification');
  const [target, setTarget] = useState('#sales-alerts');

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const newWf = {
      id: `wf_${Date.now()}`,
      name,
      trigger,
      condition,
      action,
      target,
      executions: 0,
      active: true
    };
    setWorkflows([newWf, ...workflows]);
    setName('');
    setShowModal(false);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            Payment Event Workflows & Automations
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Build no-code automations triggered instantly when payments succeed, subscriptions renew, or licenses are issued.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((wf) => (
          <div key={wf.id} className="opp-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${wf.active ? 'bg-emerald-500 animate-pulse' : 'bg-[#8C90A0]'}`} />
                <h3 className="font-bold text-base text-[#0A0D14] font-sans">{wf.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F5F8] text-[#6E717D] border border-black/5 font-semibold">
                  {wf.executions} Executions
                </span>
              </div>

              {/* Node Pipeline Preview */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-[#0055FF] font-bold border border-blue-100">
                  ⚡ When: {wf.trigger}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8C90A0]" />
                <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-100">
                  🔍 If: {wf.condition}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8C90A0]" />
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                  🎯 Do: {wf.action} ({wf.target})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleWorkflow(wf.id)}
                className={`opp-btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 ${
                  wf.active ? 'text-emerald-700' : 'text-[#8C90A0]'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{wf.active ? 'Active' : 'Paused'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Create Payment Automation</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Workflow Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instant Discord Role on Purchase"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Trigger Event</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] font-mono font-bold"
                >
                  <option value="payment.succeeded">payment.succeeded</option>
                  <option value="subscription.created">subscription.created</option>
                  <option value="checkout.abandoned">checkout.abandoned</option>
                  <option value="meter.threshold_reached">meter.threshold_reached</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Condition Expression</label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Action to Execute</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] font-semibold"
                >
                  <option value="Post Slack Notification">Post Slack Notification</option>
                  <option value="Grant Discord Role">Grant Discord VIP Role</option>
                  <option value="Issue Cryptographic Key">Issue Cryptographic License Key</option>
                  <option value="Send Email Receipt">Send Custom Email Receipt</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Target Destination / Channel</label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Enable Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
