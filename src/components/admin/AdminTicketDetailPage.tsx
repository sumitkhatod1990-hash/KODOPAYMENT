import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { navigateAdmin } from '../../utils/adminDomain';
import {
  LifeBuoy,
  ArrowLeft,
  Clock,
  Tag,
  User,
  Shield,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Calendar,
  Building2,
  Flame,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface Props {
  ticketId: string;
}

interface TicketReply {
  id: string;
  author: string;
  authorType: 'admin' | 'user' | 'merchant' | string;
  adminId?: string;
  message: string;
  createdAt: string;
}

interface TicketClientContext {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string | null;
  website?: string | null;
  createdAt?: string;
}

interface TicketDetail {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | string;
  priority: 'urgent' | 'high' | 'normal' | 'low' | string;
  replies: TicketReply[];
  created_at: string;
  updated_at: string;
  client?: TicketClientContext | null;
  chat_session_id?: string | null;
  relatedChatSessionId?: string | null;
}

export const AdminTicketDetailPage: React.FC<Props> = ({ ticketId }) => {
  const { adminUser } = useAdminAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // Reply Composer State
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  // Status & Priority Mutation States
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const canMutate = adminUser?.role === 'super_admin' || adminUser?.role === 'support_agent';

  const fetchTicket = async () => {
    setLoading(true);
    setError(null);
    setIsNotFound(false);
    try {
      const res = await fetch(`/api/v1/admin/support/tickets/${encodeURIComponent(ticketId)}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (res.status === 404) {
        setIsNotFound(true);
        setTicket(null);
        return;
      }

      if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden: Your administrative role cannot access this ticket.');
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setTicket(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse ticket data.');
      }
    } catch (err: any) {
      console.error('Failed to load ticket detail:', err);
      setError(err.message || 'Unable to connect to support ticket store.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMutate || submittingReply) return;

    const trimmed = replyMessage.trim();
    if (!trimmed) {
      setReplyError('Reply message cannot be empty.');
      return;
    }

    setSubmittingReply(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      const res = await fetch(`/api/v1/admin/support/tickets/${encodeURIComponent(ticketId)}/reply`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: trimmed })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to send reply.');
      }

      setReplyMessage('');
      setReplySuccess('Support reply sent successfully.');
      // Refresh ticket thread
      await fetchTicket();
    } catch (err: any) {
      setReplyError(err.message || 'Failed to deliver support reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!canMutate || updatingStatus || !ticket || ticket.status === newStatus) return;

    setUpdatingStatus(true);
    setMutationError(null);

    try {
      const res = await fetch(`/api/v1/admin/support/tickets/${encodeURIComponent(ticketId)}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update ticket status.');
      }

      setTicket(prev => prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : null);
    } catch (err: any) {
      setMutationError(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!canMutate || updatingPriority || !ticket || ticket.priority === newPriority) return;

    setUpdatingPriority(true);
    setMutationError(null);

    try {
      const res = await fetch(`/api/v1/admin/support/tickets/${encodeURIComponent(ticketId)}/priority`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ priority: newPriority })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update ticket priority.');
      }

      setTicket(prev => prev ? { ...prev, priority: newPriority, updated_at: new Date().toISOString() } : null);
    } catch (err: any) {
      setMutationError(err.message || 'Failed to update priority.');
    } finally {
      setUpdatingPriority(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    const s = (p || '').toLowerCase();
    if (s === 'urgent') return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
    if (s === 'high') return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium';
    if (s === 'normal') return 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-medium';
    return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
  };

  const getStatusBadge = (st: string) => {
    const s = (st || '').toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium';
    if (s === 'in_progress') return 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium';
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-medium';
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 animate-pulse space-y-3">
          <div className="h-7 w-96 bg-slate-700 rounded" />
          <div className="h-4 w-48 bg-slate-800 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-[#0F172A] border border-slate-800 animate-pulse" />
          <div className="h-96 rounded-2xl bg-[#0F172A] border border-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  // 404 Not Found
  if (isNotFound) {
    return (
      <div className="p-12 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Ticket Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">
            No support ticket exists with ID: <span className="font-mono text-slate-300">{ticketId}</span>
          </p>
        </div>
        <button
          onClick={() => navigateAdmin('/tickets')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets Queue
        </button>
      </div>
    );
  }

  // Error State
  if (error || !ticket) {
    return (
      <div className="p-8 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto border border-rose-800/40">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Unable to Load Ticket</h3>
          <p className="text-xs text-slate-400 mt-1">{error || 'An unexpected error occurred.'}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigateAdmin('/tickets')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Back to Tickets
          </button>
          <button
            onClick={fetchTicket}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const relatedChatId = ticket.chat_session_id || ticket.relatedChatSessionId || null;
  const replies = Array.isArray(ticket.replies) ? ticket.replies : [];

  // Derive truthful ticket activity list
  const activityEvents = [
    {
      timestamp: ticket.created_at,
      action: 'Ticket Created',
      actor: ticket.name || ticket.email || 'Customer',
      detail: `Initial request submitted in category: ${ticket.category || 'General'}`
    },
    ...replies.map(r => ({
      timestamp: r.createdAt,
      action: r.authorType === 'admin' ? 'Support Reply' : 'Merchant Response',
      actor: r.author || (r.authorType === 'admin' ? 'QivroPay Support' : 'Customer'),
      detail: r.message.length > 80 ? `${r.message.slice(0, 80)}...` : r.message
    }))
  ];
  if (ticket.updated_at && ticket.updated_at !== ticket.created_at && replies.length === 0) {
    activityEvents.push({
      timestamp: ticket.updated_at,
      action: 'Ticket Updated',
      actor: 'Support Agent',
      detail: `Status set to ${ticket.status} (${ticket.priority} priority)`
    });
  }
  activityEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      {/* 1. Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateAdmin('/tickets')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets Queue</span>
        </button>

        <button
          onClick={fetchTicket}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Thread</span>
        </button>
      </div>

      {/* Ticket Header Card */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-mono text-slate-400 font-semibold">{ticket.id}</span>
              <span className="text-slate-600">&bull;</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getStatusBadge(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getPriorityBadge(ticket.priority)}`}>
                {ticket.priority}
              </span>
              {ticket.category && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {ticket.category}
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white pt-1">
              {ticket.subject}
            </h1>

            <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
              <span>Client: <strong className="text-slate-200">{ticket.client?.company || ticket.name || 'Merchant'}</strong></span>
              {ticket.user_id && (
                <span className="font-mono text-[11px] text-slate-500">({ticket.user_id})</span>
              )}
              <span className="text-slate-600">&bull;</span>
              <span className="font-mono text-[11px]">{ticket.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Created: {new Date(ticket.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
          </div>
        </div>

        {/* Global Mutation Error Banner */}
        {mutationError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-center justify-between">
            <span>{mutationError}</span>
            <button onClick={() => setMutationError(null)} className="text-slate-400 hover:text-white">&times;</button>
          </div>
        )}
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Conversation Thread & Reply Composer (2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conversation Thread */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Conversation Thread
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {1 + replies.length} {1 + replies.length === 1 ? 'message' : 'messages'}
              </span>
            </div>

            <div className="space-y-4">
              {/* Initial Message from Customer/Merchant */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[11px]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-white">{ticket.name || 'Merchant'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Merchant
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(ticket.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>

                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed pl-8">
                  {ticket.message || 'No opening message text provided.'}
                </div>
              </div>

              {/* Replies Thread */}
              {replies.map((reply) => {
                const isAdmin = reply.authorType === 'admin';
                return (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-2xl border space-y-2 ${
                      isAdmin
                        ? 'bg-blue-950/20 border-blue-900/40 ml-4 sm:ml-8'
                        : 'bg-slate-900/90 border-slate-800 mr-4 sm:mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            isAdmin
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-semibold text-white">
                          {reply.author || (isAdmin ? 'QivroPay Support' : 'Customer')}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                            isAdmin
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isAdmin ? 'QivroPay Support' : 'Merchant'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(reply.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>

                    <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed pl-8">
                      {reply.message}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reply Composer */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Reply to Client
            </h3>

            {replySuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center justify-between">
                <span>{replySuccess}</span>
                <button onClick={() => setReplySuccess(null)} className="text-slate-400 hover:text-white">&times;</button>
              </div>
            )}

            {replyError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-center justify-between">
                <span>{replyError}</span>
                <button onClick={() => setReplyError(null)} className="text-slate-400 hover:text-white">&times;</button>
              </div>
            )}

            {canMutate ? (
              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your official administrative support response here..."
                  disabled={submittingReply}
                  className="w-full p-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y min-h-[100px]"
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Pressing Send Reply will notify the merchant and update ticket status to In Progress.
                  </span>

                  <button
                    type="submit"
                    disabled={submittingReply || !replyMessage.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {submittingReply ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center">
                Your administrative role ({adminUser?.role}) is read-only for ticket replies.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Client Context, Management Controls & Activity */}
        <div className="space-y-6">
          {/* Client Context Card */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-400" />
                Client Profile
              </h3>
              {ticket.user_id && (
                <button
                  onClick={() => navigateAdmin(`/clients/${ticket.user_id}`)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  View Client 360 <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="text-slate-400 text-[11px]">Business Name</div>
                <div className="font-semibold text-white text-sm">
                  {ticket.client?.company || ticket.name || 'Merchant'}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px]">Merchant ID</div>
                <div className="font-mono text-slate-300 text-[11px] truncate">
                  {ticket.user_id || 'Not linked to merchant ID'}
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-mono truncate">{ticket.email}</span>
              </div>

              {ticket.client?.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{ticket.client.phone}</span>
                </div>
              )}

              {ticket.client?.website && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <a
                    href={ticket.client.website.startsWith('http') ? ticket.client.website : `https://${ticket.client.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 truncate"
                  >
                    {ticket.client.website}
                  </a>
                </div>
              )}

              {ticket.client?.createdAt && (
                <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Client Since: {new Date(ticket.client.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Controls & Metadata */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-4">
            <div className="pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-amber-400" />
                Ticket Management
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Status Control */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Lifecycle Status
                </label>
                {canMutate ? (
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    aria-label="Change ticket status"
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                ) : (
                  <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border ${getStatusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                )}
              </div>

              {/* Priority Control */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Urgency Priority
                </label>
                {canMutate ? (
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    disabled={updatingPriority}
                    aria-label="Change ticket priority"
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                ) : (
                  <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-md border ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                )}
              </div>

              {/* Category */}
              <div>
                <div className="text-[11px] font-medium text-slate-400">Category</div>
                <div className="text-slate-200 mt-0.5">{ticket.category || 'General Assistance'}</div>
              </div>

              {/* Related Chat Session (if present) */}
              {relatedChatId && (
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="text-[11px] font-medium text-slate-400">Related Chat Session</div>
                  <button
                    onClick={() => navigateAdmin('/chat')}
                    className="mt-1 text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {relatedChatId}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Activity Timeline */}
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Ticket Activity
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {activityEvents.length} events
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activityEvents.map((evt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="p-1 rounded-md bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="font-semibold text-white leading-snug">{evt.action}</div>
                    <div className="text-[11px] text-slate-400 truncate">By {evt.actor}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(evt.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
