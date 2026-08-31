import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCheck, 
  FileText, 
  QrCode, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Download, 
  RefreshCw,
  Coins,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WhatsAppCommerceBotTab: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [customerName, setCustomerName] = useState('Ananya Sharma');
  const [amount, setAmount] = useState(4999);
  const [productName, setProductName] = useState('Pro AI SaaS Monthly (UPI AutoPay)');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'bot',
      time: '12:45 PM',
      type: 'invoice_prompt',
      text: 'Namaste Ananya! 🙏 Your monthly invoice for Pro AI SaaS is due.',
      amount: '₹4,999.00',
      upiUrl: 'upi://pay?pa=qivropay@icici&pn=QivroPay&am=4999.00&cu=INR&tn=Qivro_Inv_9910',
      status: 'pending'
    }
  ]);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      const newMsg = {
        id: Date.now(),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'invoice_prompt',
        text: `Namaste ${customerName}! 🙏 Here is your 1-Click UPI Payment link for ${productName}.`,
        amount: `₹${amount.toLocaleString('en-IN')}.00`,
        upiUrl: `upi://pay?pa=qivropay@icici&pn=QivroPay&am=${amount}&cu=INR&tn=Qivro_${Date.now()}`,
        status: 'pending'
      };
      setMessages(prev => [...prev, newMsg]);
      setIsSending(false);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }, 800);
  };

  const handleCompletePayment = (msgId: number) => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return { ...m, status: 'paid' };
        }
        return m;
      }));

      // Add bot confirmation message with PDF invoice
      const confirmMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'invoice_receipt',
        text: `✅ Payment of ₹${amount.toLocaleString('en-IN')}.00 received via UPI AutoPay! Here is your official GST Tax Invoice with IRN & signed QR code.`,
        irn: '5a81c2098b1e4f90184efc71289a0b34d981c2098b1e4f90184efc71289a0b34',
        pdfUrl: '#',
        status: 'completed'
      };
      setMessages(prev => [...prev, confirmMsg]);
      setIsSimulatingPayment(false);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0D14] font-heading flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            <span>WhatsApp Conversational Checkout &amp; Invoicing Bot</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8C90A0]">
            Automated WhatsApp UPI Pay intent, instant GST Tax Invoice PDF delivery, and smart dunning retry engine.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Meta Cloud API Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Dispatcher Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="opp-card p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.06]">
              <Send className="w-4 h-4 text-[#0055FF]" />
              <h3 className="font-bold text-[#0A0D14] text-sm font-sans">
                Dispatch WhatsApp Payment Prompt
              </h3>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Customer Mobile (WhatsApp)</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Product / SaaS Tier</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0A0D14]">Invoice Amount (INR ₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#F4F5F8] text-[#0A0D14] font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full opp-btn-primary py-3 text-xs justify-center font-semibold"
              >
                {isSending ? 'Dispatching via Meta Cloud API...' : 'Send WhatsApp 1-Click Pay Link'}
              </button>
            </form>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2 text-xs text-emerald-900">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>DPDP Act 2023 Compliant Opt-In</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              All messages are scrubbed through TRAI DLT registry with 100% verified sender header <code>QIVROP</code>.
            </p>
          </div>
        </div>

        {/* Right: Live Interactive WhatsApp Simulator (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-[#0B141A] border border-black/20 shadow-2xl overflow-hidden font-sans text-white">
            
            {/* WhatsApp Header */}
            <div className="p-4 bg-[#202C33] border-b border-[#2A3942] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0055FF] to-[#7B2CBF] text-white flex items-center justify-center font-bold text-sm">
                  Q
                </div>
                <div>
                  <div className="font-bold text-sm text-[#E9EDEF] flex items-center gap-1.5">
                    <span>QivroPay Verified Business</span>
                    <span className="text-[10px] text-emerald-400">✓</span>
                  </div>
                  <div className="text-[11px] text-[#8696A0]">Official Billing Assistant</div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-emerald-400 bg-emerald-900/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                ● Live WhatsApp Bot
              </div>
            </div>

            {/* Chat Bubble Area */}
            <div className="p-6 space-y-4 min-h-[380px] max-h-[460px] overflow-y-auto bg-[#0B141A] bg-opacity-95 text-xs">
              <div className="text-center text-[10px] text-[#8696A0] font-mono py-1">
                TODAY • 256-BIT END-TO-END ENCRYPTED
              </div>

              {messages.map(msg => (
                <div key={msg.id} className="space-y-1">
                  {msg.type === 'invoice_prompt' && (
                    <div className="max-w-md p-4 rounded-2xl rounded-tl-xs bg-[#202C33] text-[#E9EDEF] space-y-3 shadow-md border border-[#2A3942]">
                      <p className="leading-relaxed">{msg.text}</p>
                      
                      <div className="p-3 rounded-xl bg-[#111B21] border border-[#2A3942] space-y-2">
                        <div className="flex justify-between items-center font-mono">
                          <span className="text-[#8696A0] text-[11px]">Due Amount:</span>
                          <span className="text-base font-bold text-emerald-400">{msg.amount}</span>
                        </div>
                        <div className="text-[10px] text-[#8696A0] font-mono">
                          Payment Mode: UPI Intent &amp; UPI AutoPay
                        </div>
                      </div>

                      {msg.status === 'pending' ? (
                        <button
                          onClick={() => handleCompletePayment(msg.id)}
                          disabled={isSimulatingPayment}
                          className="w-full py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-[#111B21] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5 fill-[#111B21]" />
                          <span>{isSimulatingPayment ? 'Processing UPI Debit...' : 'Pay via GPay / PhonePe (1-Click)'}</span>
                        </button>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-center font-bold flex items-center justify-center gap-1.5">
                          <CheckCheck className="w-4 h-4 text-emerald-400" />
                          <span>PAID ON WHATSAPP (UTR: 62910482910)</span>
                        </div>
                      )}

                      <div className="text-right text-[10px] text-[#8696A0] flex items-center justify-end gap-1 font-mono">
                        <span>{msg.time}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    </div>
                  )}

                  {msg.type === 'invoice_receipt' && (
                    <div className="max-w-md p-4 rounded-2xl rounded-tl-xs bg-[#202C33] text-[#E9EDEF] space-y-3 shadow-md border border-[#2A3942]">
                      <p className="leading-relaxed text-emerald-300 font-medium">{msg.text}</p>
                      
                      <div className="p-3 rounded-xl bg-[#111B21] border border-[#2A3942] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                            PDF
                          </div>
                          <div>
                            <div className="font-bold text-[11px] text-[#E9EDEF]">Tax_Invoice_QIVRO_9918.pdf</div>
                            <div className="text-[10px] text-[#8696A0] font-mono">142 KB • Signed GST QR</div>
                          </div>
                        </div>

                        <button className="p-2 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-white">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[10px] font-mono text-[#8696A0] truncate">
                        IRN: {msg.irn}
                      </div>

                      <div className="text-right text-[10px] text-[#8696A0] flex items-center justify-end gap-1 font-mono">
                        <span>{msg.time}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
