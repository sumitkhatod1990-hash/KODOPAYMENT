import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  History, 
  Plus, 
  Lock, 
  CheckCircle2, 
  FileText, 
  UserCheck,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TeamAuditTab: React.FC = () => {
  const { teamMembers, auditLogs, inviteTeamMember } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Developer' | 'Accountant' | 'Support' | 'Admin'>('Developer');
  const [activeSubTab, setActiveSubTab] = useState<'team' | 'audit'>('team');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    await inviteTeamMember({ name, email, role });
    setName('');
    setEmail('');
    setShowModal(false);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
            Team Permissions & Audit Logs
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Manage multi-user role-based access control (RBAC) and review immutable compliance audit logs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="opp-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Switcher */}
      <div className="flex gap-2 border-b border-black/[0.06] pb-3 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('team')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'team' ? 'bg-[#0A0D14] text-white font-bold' : 'text-[#6E717D] hover:text-[#0A0D14]'
          }`}
        >
          Team Members ({teamMembers.length})
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'audit' ? 'bg-[#0A0D14] text-white font-bold' : 'text-[#6E717D] hover:text-[#0A0D14]'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Team Members */}
      {activeSubTab === 'team' && (
        <div className="opp-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                  <th className="p-4 font-semibold">Member</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Permissions Scope</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#F4F5F8] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#0A0D14]">{member.name}</div>
                      <div className="text-[11px] text-[#8C90A0] font-mono">{member.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        member.role === 'Owner' ? 'bg-black text-white' :
                        member.role === 'Developer' ? 'bg-blue-50 text-[#0055FF] border border-blue-100' :
                        member.role === 'Accountant' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-purple-50 text-purple-700 border border-purple-100'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4 text-[#6E717D]">
                      {member.role === 'Owner' && 'Full Administrative & Bank Payout Control'}
                      {member.role === 'Developer' && 'API Keys, Webhooks & Ingestion Telemetry'}
                      {member.role === 'Accountant' && 'Transactions Ledger, Invoices & Tax Exports'}
                      {member.role === 'Support' && 'Customer CRM & Refund Processing'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        ACTIVE
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[#8C90A0]">
                      {member.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Security Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="opp-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#FAFBFD] text-[#8C90A0] font-mono uppercase text-[10px]">
                  <th className="p-4 font-semibold">Timestamp</th>
                  <th className="p-4 font-semibold">Actor / User</th>
                  <th className="p-4 font-semibold">Action Type</th>
                  <th className="p-4 font-semibold">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F4F5F8] transition-colors">
                    <td className="p-4 font-mono text-[#8C90A0] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-[#0A0D14] font-mono">
                      {log.user}
                    </td>
                    <td className="p-4 font-mono font-semibold text-[#0055FF]">
                      {log.action}
                    </td>
                    <td className="p-4 text-[#6E717D]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#0A0D14] text-base font-sans">Invite Team Member</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8C90A0] hover:text-[#0A0D14]">✕</button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] font-semibold"
                >
                  <option value="Developer">Developer (API Keys, Webhooks, Telemetry)</option>
                  <option value="Accountant">Accountant (Ledger, Invoices, Tax CSV Exports)</option>
                  <option value="Support">Support Agent (Customer CRM & Refunds)</option>
                  <option value="Admin">Admin (Full access except bank payout change)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="opp-btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="opp-btn-primary px-5 py-2 font-semibold">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
