import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  HeartHandshake, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_01',
      title: 'New B2B Wire Received',
      message: '$12,500.00 USD received via vIBAN from Synthetix Global Corp.',
      type: 'payment',
      read: false,
      createdAt: '5 mins ago'
    },
    {
      id: 'notif_02',
      title: 'AI Churn Interceptor Deflected Cancellation',
      message: 'Saved subscriber alex.chen@synthflow.ai with 50% discount rescue offer.',
      type: 'retention',
      read: false,
      createdAt: '25 mins ago'
    },
    {
      id: 'notif_03',
      title: 'Chargeback Defense Won',
      message: 'Dispute dp_qivropay_01 won with 100% MoR protection against Visa network.',
      type: 'security',
      read: true,
      createdAt: '2 hours ago'
    }
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-black/10 flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#0055FF]" />
              <h3 className="font-bold text-base text-[#0A0D14] font-heading">
                Notification Center
              </h3>
            </div>
            <button onClick={onClose} className="text-[#8C90A0] hover:text-[#0A0D14]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader */}
          <div className="p-4 bg-[#FAFBFD] border-b border-black/5 flex justify-between items-center text-xs">
            <span className="text-[#8C90A0] font-mono">
              {notifications.filter(n => !n.read).length} Unread Alerts
            </span>
            <button onClick={markAllRead} className="text-[#0055FF] font-semibold hover:underline">
              Mark all as read
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-black/5">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 transition-colors ${n.read ? 'bg-white' : 'bg-blue-50/30'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white shadow-xs border border-black/5 shrink-0">
                    {n.type === 'payment' && <CreditCard className="w-4 h-4 text-emerald-600" />}
                    {n.type === 'retention' && <HeartHandshake className="w-4 h-4 text-[#0055FF]" />}
                    {n.type === 'security' && <ShieldCheck className="w-4 h-4 text-purple-600" />}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-[#0A0D14] flex items-center gap-1.5">
                      <span>{n.title}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#0055FF]" />}
                    </div>
                    <p className="text-[#6E717D] leading-relaxed">{n.message}</p>
                    <span className="text-[10px] font-mono text-[#8C90A0] block pt-1">{n.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
