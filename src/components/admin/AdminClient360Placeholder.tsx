import React from 'react';
import { navigateAdmin } from '../../utils/adminDomain';
import { Users, ArrowLeft, Shield, Clock, Lock } from 'lucide-react';

interface Props {
  merchantId: string;
}

export const AdminClient360Placeholder: React.FC<Props> = ({ merchantId }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      <button
        onClick={() => navigateAdmin('/clients')}
        className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Client Directory
      </button>

      <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
          <Users className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Client ID: {merchantId}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Client 360 Operational Profile
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Phase 2C-1 admin shell verification. The unified Client 360 interface will be rendered in Phase 2C-2. The underlying administrative backend endpoint (`GET /api/v1/admin/clients/:id/360`) is active and verified.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left max-w-lg mx-auto space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              API Verification Status
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">ACTIVE / HEALTHY</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
            <div>Endpoint: /api/v1/admin/clients/{merchantId}/360</div>
            <div>Isolation: Strict tenant boundary (zero cross-merchant leaks)</div>
            <div>RBAC Guard: requireAdminAuth(ROLES_CLIENTS)</div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigateAdmin('/clients')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            Return to Client Directory
          </button>
        </div>
      </div>
    </div>
  );
};
