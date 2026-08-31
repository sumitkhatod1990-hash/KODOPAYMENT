import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Network, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Globe2, 
  Zap,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ONDCGatewayTab: React.FC = () => {
  const [orders, setOrders] = useState([
    {
      id: 'ondc_ord_9901',
      buyerApp: 'Paytm Mall (ONDC Network)',
      catalogItem: 'KODO Pro SaaS 1-Year License Key',
      orderAmount: '₹4,999.00 INR',
      settlementType: 'Instant RSP Protocol (T+0)',
      networkTxId: 'beckn_tx_881902847190',
      status: 'ondc_fulfilled_settled'
    }
  ]);

  const [broadcasting, setBroadcasting] = useState(false);

  const handleBroadcastCatalog = () => {
    setBroadcasting(true);
    setTimeout(() => {
      setBroadcasting(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <Network className="w-6 h-6 text-[#0055FF]" />
            <span>ONDC (Open Network for Digital Commerce) Protocol Gateway</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Broadcast your product catalogs and software licenses to India's open commerce network, receiving 1-click orders from buyer apps like Paytm, Magicpin, and Mystore via the Beckn protocol.
          </p>
        </div>

        <button
          onClick={handleBroadcastCatalog}
          disabled={broadcasting}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{broadcasting ? 'Syncing Beckn Schema...' : 'Broadcast Catalog to ONDC'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">ONDC Network Reach</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">45M+ Indian Buyers</div>
          <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Discoverable across all buyer apps
          </div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">RSP Protocol Settlement</div>
          <div className="text-2xl font-bold font-mono text-[#0055FF]">T+0 Instant (IMPS)</div>
          <div className="text-[11px] text-[#8C90A0] font-mono">Automated reconciliation service provider</div>
        </div>

        <div className="opp-card p-6 space-y-2">
          <div className="text-xs font-mono text-[#8C90A0] uppercase">Marketplace Take Rate</div>
          <div className="text-2xl font-bold font-mono text-[#0A0D14]">&lt; 3.0% Commission</div>
          <div className="text-[11px] text-purple-700 font-mono">Huge savings vs 30% App Store cuts</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="opp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                <th className="p-4 font-semibold">ONDC Order ID</th>
                <th className="p-4 font-semibold">Buyer Network App</th>
                <th className="p-4 font-semibold">Purchased Item / Plan</th>
                <th className="p-4 font-semibold">Order Volume</th>
                <th className="p-4 font-semibold">Beckn Protocol Tx</th>
                <th className="p-4 font-semibold">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F4F5F8] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0A0D14]">
                    {o.id}
                  </td>
                  <td className="p-4 font-bold text-[#0055FF]">
                    {o.buyerApp}
                  </td>
                  <td className="p-4 font-semibold text-[#0A0D14]">
                    {o.catalogItem}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700 text-sm">
                    {o.orderAmount}
                  </td>
                  <td className="p-4 font-mono text-[#8C90A0] text-[11px]">
                    {o.networkTxId}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      ONDC SETTLED (T+0)
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
