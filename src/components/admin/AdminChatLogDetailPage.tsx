import React, { useEffect, useState } from 'react';
import { navigateAdmin } from '../../utils/adminDomain';
import {
  MessageSquare,
  ArrowLeft,
  Clock,
  Shield,
  ShieldCheck,
  Globe,
  User,
  ExternalLink,
  LifeBuoy,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Bot
} from 'lucide-react';

interface Props {
  sessionId: string;
}

interface TranscriptMessage {
  role: 'user' | 'assistant' | 'merchant' | 'bot' | string;
  content: string;
  timestamp: string | null;
}

interface ClientContext {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  website: string | null;
  createdAt: string;
}

interface RelatedTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
}

interface ChatSessionDetail {
  id: string;
  merchantId: string | null;
  mode: 'authenticated' | 'public' | string;
  messageCount: number;
  createdAt: string;
  lastActivityAt: string;
  transcript: TranscriptMessage[];
  client: ClientContext | null;
  ticket: RelatedTicket | null;
}

export const AdminChatLogDetailPage: React.FC<Props> = ({ sessionId }) => {
  const [session, setSession] = useState<ChatSessionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchSessionDetail = async () => {
    setLoading(true);
    setError(null);
    setIsForbidden(false);
    setIsNotFound(false);

    try {
      const res = await fetch(`/api/v1/admin/support/chat-logs/${encodeURIComponent(sessionId)}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (res.status === 404) {
        setIsNotFound(true);
        throw new Error('Chat session not found.');
      }

      if (res.status === 403) {
        setIsForbidden(true);
        throw new Error("You don't have permission to view chat logs.");
      }

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
      } else {
        throw new Error(json.error || 'Failed to load chat session.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load this conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetail();
  }, [sessionId]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'in_progress':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'resolved':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'closed':
        return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'normal':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'low':
        return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Loading State
  if (loading && !session) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-5 bg-slate-800 rounded animate-pulse" />
            <div className="w-32 h-3 bg-slate-850 rounded animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 p-6 rounded-2xl bg-[#0F172A] border border-slate-800/80">
            <div className="w-3/4 h-16 bg-slate-900 rounded-xl animate-pulse" />
            <div className="w-2/3 h-20 bg-blue-950/30 rounded-xl animate-pulse ml-auto" />
            <div className="w-1/2 h-14 bg-slate-900 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-44 bg-[#0F172A] rounded-2xl border border-slate-800/80 animate-pulse" />
            <div className="h-44 bg-[#0F172A] rounded-2xl border border-slate-800/80 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 404 Not Found State
  if (isNotFound) {
    return (
      <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Chat Session Not Found</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            The conversation session <code className="font-mono text-slate-300">{sessionId}</code> could not be found in the support store.
          </p>
        </div>
        <button
          onClick={() => navigateAdmin('/chat-logs')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Chat Logs
        </button>
      </div>
    );
  }

  // 403 Forbidden State
  if (isForbidden) {
    return (
      <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Access Restricted</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Your administrative profile does not have permission to view support chat logs.
          </p>
        </div>
        <button
          onClick={() => navigateAdmin('/')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          Return to Overview
        </button>
      </div>
    );
  }

  // Generic Error State
  if (error && !session) {
    return (
      <div className="p-8 rounded-2xl bg-[#0F172A] border border-rose-900/50 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-800">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Unable to Load Conversation</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{error}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigateAdmin('/chat-logs')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
          >
            Back to Chat Logs
          </button>
          <button
            onClick={fetchSessionDetail}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const isAuth = session.mode === 'authenticated';
  const transcript = session.transcript || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="space-y-1">
          <button
            onClick={() => navigateAdmin('/chat-logs')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors group mb-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Chat Logs
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400 font-mono">
              Support Conversation
            </span>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-bold text-white">{session.id}</span>
              <button
                onClick={() => copyToClipboard(session.id, 'session_id')}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                title="Copy session ID"
              >
                {copiedField === 'session_id' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Mode badge */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isAuth
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-slate-700/30 text-slate-300 border-slate-600/30'
              }`}
            >
              {isAuth ? <ShieldCheck className="w-3 h-3 text-blue-400" /> : <Globe className="w-3 h-3 text-slate-400" />}
              <span className="capitalize">{session.mode}</span>
            </span>

            {/* Read-Only Indicator */}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
              Read-Only Inspection
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Created: {session.createdAt ? new Date(session.createdAt).toLocaleString() : '—'}</span>
            </div>
            {session.lastActivityAt && (
              <div className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Activity: {new Date(session.lastActivityAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={fetchSessionDetail}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Transcript
        </button>
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Full Conversation Transcript */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-[#0F172A] border border-slate-800/80 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Transcript ({transcript.length} {transcript.length === 1 ? 'Message' : 'Messages'})
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Audit Timeline
              </span>
            </div>

            {/* Transcript Messages List */}
            {transcript.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Bot className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs text-slate-400">No messages recorded in this session.</div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {transcript.map((msg, idx) => {
                  const isUser = msg.role.toLowerCase() === 'user' || msg.role.toLowerCase() === 'merchant';
                  const isAssistant = msg.role.toLowerCase() === 'assistant' || msg.role.toLowerCase() === 'bot';

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col space-y-1.5 ${
                        isAssistant ? 'items-start sm:pr-8' : 'items-start sm:pl-8'
                      }`}
                    >
                      {/* Sender identification bar */}
                      <div className="flex items-center gap-2 px-1 text-[11px]">
                        {isAssistant ? (
                          <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                            <div className="w-4 h-4 rounded-full bg-blue-600/30 flex items-center justify-center border border-blue-500/40">
                              <Sparkles className="w-2.5 h-2.5 text-blue-300" />
                            </div>
                            <span>QivroPay Assistant</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                              <User className="w-2.5 h-2.5 text-slate-400" />
                            </div>
                            <span>{session.client?.name || (isAuth ? 'Merchant' : 'Customer')}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                              {msg.role}
                            </span>
                          </div>
                        )}

                        {msg.timestamp && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div
                        className={`w-full p-4 rounded-2xl text-xs leading-relaxed break-words whitespace-pre-wrap ${
                          isAssistant
                            ? 'bg-blue-950/30 border border-blue-800/40 text-slate-200'
                            : 'bg-slate-900/90 border border-slate-800 text-slate-100 shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Related Context Panels */}
        <div className="space-y-4">
          {/* Session Details Card */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800/80">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Session Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Session ID</span>
                <span className="font-mono text-slate-200">{session.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mode</span>
                <span className="font-semibold text-white capitalize">{session.mode}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Messages</span>
                <span className="font-mono font-semibold text-white">{session.messageCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Created</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Activity</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {session.lastActivityAt ? new Date(session.lastActivityAt).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Client Profile Card (if merchant context exists) */}
          {session.client ? (
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  Client Profile
                </h3>
                <button
                  onClick={() => navigateAdmin(`/clients/${session.client!.id}`)}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  View Client 360
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="font-semibold text-white text-sm">
                    {session.client.name}
                  </div>
                  {session.client.company && (
                    <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {session.client.company}
                    </div>
                  )}
                </div>

                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-500" />
                      Email
                    </span>
                    <span className="text-slate-200 font-mono">{session.client.email}</span>
                  </div>

                  {session.client.phone && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        Phone
                      </span>
                      <span className="text-slate-200 font-mono">{session.client.phone}</span>
                    </div>
                  )}

                  {session.client.website && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-slate-500" />
                        Website
                      </span>
                      <a
                        href={session.client.website.startsWith('http') ? session.client.website : `https://${session.client.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline truncate max-w-[140px]"
                      >
                        {session.client.website}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 font-mono">Merchant ID</span>
                    <span className="font-mono text-slate-300 text-[10px]">{session.client.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigateAdmin(`/clients/${session.client!.id}`)}
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Client 360 Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>
            </div>
          ) : isAuth && session.merchantId ? (
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800/80">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Client Context
              </h3>
              <div className="text-xs text-slate-300">
                <span>Associated Merchant ID: </span>
                <code className="font-mono text-white text-[11px]">{session.merchantId}</code>
              </div>
              <button
                onClick={() => navigateAdmin(`/clients/${session.merchantId}`)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Client 360 Workspace</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800/80">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Public Visitor
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This session was initiated by an unauthenticated visitor browsing public documentation or product pages.
              </p>
            </div>
          )}

          {/* Related Support Ticket Card */}
          {session.ticket ? (
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800/80 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <LifeBuoy className="w-3.5 h-3.5 text-purple-400" />
                  Related Ticket
                </h3>
                <button
                  onClick={() => navigateAdmin(`/tickets/${session.ticket!.id}`)}
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  Open Ticket →
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-semibold text-white">
                  {session.ticket.subject}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="font-mono text-slate-400">{session.ticket.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(session.ticket.status)}`}>
                      {session.ticket.status}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getPriorityBadge(session.ticket.priority)}`}>
                      {session.ticket.priority}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigateAdmin(`/tickets/${session.ticket!.id}`)}
                  className="w-full mt-2 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold rounded-xl border border-purple-500/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Support Ticket Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800/80 text-xs text-slate-500 space-y-1">
              <div className="font-medium text-slate-400 flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-slate-500" />
                No Associated Ticket
              </div>
              <p className="text-[11px] leading-relaxed">
                This chatbot conversation has not been escalated to a formal support ticket.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
