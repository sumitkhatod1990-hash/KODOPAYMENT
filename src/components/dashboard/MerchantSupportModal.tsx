import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MerchantSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export const MerchantSupportModal: React.FC<MerchantSupportModalProps> = ({
  isOpen,
  onClose,
  userEmail = 'merchant@qivropay.in',
  userName = 'Merchant'
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket' | 'channels'>('chat');
  
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try { return localStorage.getItem('qivropay_gemini_key') || ''; } catch { return ''; }
  });
  const [showKeySetting, setShowKeySetting] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string; engine?: string }>>([
    {
      sender: 'assistant',
      text: `Namaste ${userName}! I am your QivroPay 24/7 Merchant Engineering AI Assistant. Ask me anything about UPI AutoPay 2.0, GST compliance, Cashfree PG integration, Penny-Drop verification, or API SDKs!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'QivroPay MoR AI'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Ticket form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Account Verification & KYC');
  const [ticketPriority, setTicketPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState<any>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  if (!isOpen) return null;

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    try {
      if (key) localStorage.setItem('qivropay_gemini_key', key);
      else localStorage.removeItem('qivropay_gemini_key');
    } catch {}
    setShowKeySetting(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isSending) return;

    const userText = inputQuery.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setInputQuery('');
    setIsSending(true);

    try {
      const res = await fetch('/api/v1/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userText,
          customApiKey: customApiKey || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setMessages(prev => [...prev, { 
          sender: 'assistant', 
          text: data.reply, 
          engine: data.engine || 'AI Engine',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'assistant', 
          text: "Thank you for your query. Our priority desk is online 24/7. An engineer has received your message.", 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      }
    } catch {
      setMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: "Our desk is online. You can also reach our direct merchant hotline on WhatsApp or email support@qivropay.in.", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setTicketLoading(true);
    try {
      const res = await fetch('/api/v1/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          subject: ticketSubject,
          category: ticketCategory,
          priority: ticketPriority,
          message: ticketMessage
        })
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicketSubmitted(data.ticket);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.warn('Ticket submission error', err);
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base font-heading">
                  24/7 Merchant Engineering Support
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-slate-500">
                Bharat MoR Dedicated Desk • SLA &lt; 15 mins
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/30 text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-[#0055FF] text-[#0055FF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Live Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('ticket')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ticket'
                ? 'border-[#0055FF] text-[#0055FF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Submit Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'channels'
                ? 'border-[#0055FF] text-[#0055FF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Instant Channels</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* TAB 1: Live Chat */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[380px]">
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0055FF] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1.5 ${
                      m.sender === 'user' 
                        ? 'bg-[#0A0D14] text-white rounded-tr-none' 
                        : 'bg-slate-100/80 text-slate-800 rounded-tl-none border border-slate-200/60'
                    }`}>
                      <p className="whitespace-pre-line">{m.text}</p>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        {m.sender === 'assistant' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-[#0055FF] font-bold">
                            {m.engine || 'QivroPay MoR AI'}
                          </span>
                        )}
                        <span className={`text-[10px] block ${m.sender === 'user' ? 'text-slate-400 ml-auto' : 'text-slate-400 ml-auto'}`}>
                          {m.time}
                        </span>
                      </div>
                    </div>

                    {m.sender === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <span className="w-2 h-2 rounded-full bg-[#0055FF] animate-ping" />
                    <span>Real AI Model thinking & analyzing MoR regulations...</span>
                  </div>
                )}
              </div>

              {/* API Key Drawer Toggle */}
              {showKeySetting && (
                <div className="p-3 mb-2 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-fade-in">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>⚙️ Google Gemini / OpenAI Key (Optional)</span>
                    <button onClick={() => setShowKeySetting(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter GEMINI_API_KEY for unbounded generative AI"
                    defaultValue={customApiKey}
                    onBlur={e => handleSaveApiKey(e.target.value.trim())}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono outline-none focus:border-[#0055FF]"
                  />
                  <p className="text-[10px] text-slate-500">
                    Saved locally in your browser. Leave blank to use QivroPay's high-speed built-in fintech intelligence.
                  </p>
                </div>
              )}

              {/* Chat Input */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between pb-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#0055FF]" />
                  <span>Powered by Real-world MoR Knowledge &amp; LLM</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeySetting(!showKeySetting)}
                  className="text-[10px] text-[#0055FF] hover:underline font-mono"
                >
                  {customApiKey ? '✓ Custom AI Key Active' : '+ Add Gemini Key'}
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask about UPI AutoPay, GST, Penny Drop, Cashfree PG, API keys..."
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0055FF] outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isSending}
                  className="p-2.5 rounded-xl bg-[#0055FF] text-white hover:bg-blue-600 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Submit Support Ticket */}
          {activeTab === 'ticket' && (
            <div>
              {ticketSubmitted ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-base">
                      Ticket #{ticketSubmitted.id} Created!
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Our 24/7 Merchant Engineering Desk is reviewing your issue. A specialist will respond via email within <strong>{ticketSubmitted.responseSLA}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTicketSubmitted(null);
                      setTicketSubject('');
                      setTicketMessage('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
                    <select
                      value={ticketCategory}
                      onChange={e => setTicketCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-[#0055FF]"
                    >
                      <option value="Account Verification & KYC">Account Verification &amp; KYC (PAN / GSTIN / Penny Drop)</option>
                      <option value="UPI AutoPay & Gateway">UPI AutoPay 2.0 &amp; Cashfree Gateway Integration</option>
                      <option value="GST e-Invoicing & TDS">GST e-Invoicing &amp; Section 194-O TDS Compliance</option>
                      <option value="Payouts & IMPS">Instant T+0 Bank Payouts &amp; Settlements</option>
                      <option value="API Keys & Webhooks">API Keys, SDKs &amp; Webhook Events</option>
                      <option value="Billing & Charges">Pricing, Platform Fees &amp; Billing Queries</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                      <select
                        value={ticketPriority}
                        onChange={e => setTicketPriority(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-[#0055FF]"
                      >
                        <option value="normal">Normal (&lt; 1 Hour SLA)</option>
                        <option value="high">High (&lt; 30 Mins SLA)</option>
                        <option value="urgent">Urgent (&lt; 15 Mins SLA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Registered Email</label>
                      <input
                        type="email"
                        value={userEmail}
                        readOnly
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="Brief summary of the issue (e.g. UPI Webhook timeout on staging)"
                      value={ticketSubject}
                      onChange={e => setTicketSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-[#0055FF]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Please include error messages, transaction IDs, or request payloads..."
                      value={ticketMessage}
                      onChange={e => setTicketMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-[#0055FF]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={ticketLoading || !ticketSubject || !ticketMessage}
                    className="w-full py-3 rounded-xl bg-[#0A0D14] text-white font-bold hover:bg-slate-800 disabled:opacity-40 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {ticketLoading ? 'Submitting to Engineering Desk...' : 'Submit Support Ticket'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: Direct Instant Channels */}
          {activeTab === 'channels' && (
            <div className="space-y-3 font-sans text-xs">
              
              {/* WhatsApp Live Desk */}
              <a
                href="https://wa.me/919999999999?text=Hi%20QivroPay%20Merchant%20Desk%2C%20I%20need%20assistance%20with%20my%20account"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    WA
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950">WhatsApp Merchant Hotline</div>
                    <div className="text-emerald-700 text-[11px]">Chat with an engineer in under 2 minutes</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Direct Priority Email */}
              <a
                href="mailto:support@qivropay.in?subject=Priority%20Merchant%20Support%20Request"
                className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 hover:bg-blue-100/70 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0055FF] text-white flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-950">Direct Engineering Email</div>
                    <div className="text-blue-700 text-[11px]">support@qivropay.in • 24x7 Ingestion</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Compliance & MoR Desk */}
              <a
                href="mailto:compliance@qivropay.in?subject=GST%20%26%20Tax%20Compliance%20Inquiry"
                className="p-4 rounded-2xl bg-purple-50 border border-purple-200/80 hover:bg-purple-100/70 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-purple-950">GST &amp; Compliance Advisory</div>
                    <div className="text-purple-700 text-[11px]">compliance@qivropay.in • Section 194-O TDS &amp; GSTIN</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
              </a>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>QivroPay Sovereign MoR • India</span>
          <span className="text-emerald-700 font-semibold">● 99.99% Support SLA Active</span>
        </div>

      </div>
    </div>
  );
};
