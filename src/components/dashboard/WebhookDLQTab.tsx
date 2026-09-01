import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertOctagon, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Server, 
  Sparkles,
  ShieldCheck,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WebhookDLQTab: React.FC = () => {
  const [dlqItems, setDlqItems] = useState([
    {
      id: 'dlq_qivropay_991',
      eventId: 'evt_qivropay_7718a2',
      eventType: 'payment.succeeded',
      targetUrl: 'https://api.synthflow.ai/webhooks/qivropay',
      lastAttempt: '10 mins ago',
      failureReason: 'HTTP 504 Gateway Timeout',
      retryCount: 3,
      nextScheduledRetry: 'In 50 mins (Exponential Backoff)',
      status: 'quarantined'
    },
    {
      id: 'dlq_qivropay_992',
      eventId: 'evt_qivropay_8819b4',
      eventType: 'subscription.canceled',
      targetUrl: 'https://api.nordicai.io/billing-events',
      lastAttempt: '2 hours ago',
      failureReason: 'HTTP 502 Bad Gateway',
      retryCount: 4,
      nextScheduledRetry: 'In 4 hours',
      status: 'quarantined'
    }
  ]);

  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetry = (id: string) => {
    setRetryingId(id);
    setTimeout(() => {
      setDlqItems(prev => prev.map(item => item.id === id ? { ...item, status: 'delivered', failureReason: 'Resolved (HTTP 200 OK)' } : item));
      setRetryingId(null);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  const handleRetryAll = () => {
    setRetryingId('all');
    setTimeout(() => {
      setDlqItems(prev => prev.map(item => ({ ...item, status: 'delivered', failureReason: 'Resolved (HTTP 200 OK)' })));
      setRetryingId(null);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-[#0055FF]" />
            <span>Webhook Dead-Letter Queue (DLQ) & Auto-Retry Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Zero-event loss guarantee: Failed merchant webhook deliveries are quarantined, tracked, and automatically retried with exponential backoff schedules.
          </p>
        </div>

        <button
          onClick={handleRetryAll}
          disabled={retryingId === 'all' || dlqItems.every(i => i.status === 'delivered')}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCw className={`w-4 h-4 ${retryingId === 'all' ? 'animate-spin' : ''}`} />
          <span>Replay All Quarantined Events</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Quarantined Events</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">{dlqItems.filter(i => i.status === 'quarantined').length}</div>
          <div className="text-[11px] text-amber-700 font-mono">Awaiting successful delivery</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Average Replay Latency</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">18ms</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">HMAC signature preserved</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Delivery Reliability SLA</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">99.999%</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero dropped transactions
          </div>
        </div>
      </div>

      {/* DLQ Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">Event ID / Type</th>
                <th className="p-4 font-semibold">Target Merchant Endpoint</th>
                <th className="p-4 font-semibold">Failure Diagnostics</th>
                <th className="p-4 font-semibold">Retry Count</th>
                <th className="p-4 font-semibold">Next Scheduled Retry</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {dlqItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono">
                    <div className="font-bold text-[#0A0D14]">{item.eventId}</div>
                    <div className="text-[10px] text-[#0055FF]">{item.eventType}</div>
                  </td>
                  <td className="p-4 font-mono text-[#6E717D]">
                    {item.targetUrl}
                  </td>
                  <td className="p-4 font-mono font-semibold text-rose-600 text-[11px]">
                    {item.failureReason}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {item.retryCount} of 10
                  </td>
                  <td className="p-4 text-[#8C90A0] text-[11px] font-mono">
                    {item.nextScheduledRetry}
                  </td>
                  <td className="p-4">
                    {item.status === 'delivered' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        DELIVERED (HTTP 200)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                        QUARANTINED
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {item.status !== 'delivered' ? (
                      <button
                        onClick={() => handleRetry(item.id)}
                        disabled={retryingId === item.id}
                        className="opp-btn-primary px-3 py-1 text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <RotateCw className={`w-3 h-3 ${retryingId === item.id ? 'animate-spin' : ''}`} />
                        <span>{retryingId === item.id ? 'Dispatching...' : 'Replay Now'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Replayed
                      </span>
                    )}
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
