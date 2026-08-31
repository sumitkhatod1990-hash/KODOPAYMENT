import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductType } from '../../types';
import { Plus, Trash2, ExternalLink, Copy, CheckCircle2, Coins, CreditCard, Key, Zap } from 'lucide-react';

export const ProductsTab: React.FC = () => {
  const { products, createProduct, deleteProduct, createCheckoutSession, setCurrentView } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(29);
  const [currency, setCurrency] = useState('USD');
  const [type, setType] = useState<ProductType>('credits');
  const [credits, setCredits] = useState<number>(5000000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;
    setIsSubmitting(true);

    await createProduct({
      name,
      description,
      price,
      currency,
      type,
      credits: type === 'credits' ? credits : 0,
      billingType: type === 'subscription' ? 'recurring_monthly' : 'one_time',
      interval: type === 'subscription' ? 'month' : 'one_time'
    });

    setIsSubmitting(false);
    setShowCreateModal(false);
    setName('');
    setDescription('');
    setPrice(29);
  };

  const handleCopyCheckoutUrl = async (product: Product) => {
    const sessionId = await createCheckoutSession({
      productId: product.id,
      amount: product.price,
      title: product.name,
      currency: product.currency
    });
    if (sessionId) {
      const url = `${window.location.origin}/checkout/${sessionId}`;
      navigator.clipboard.writeText(url);
      setCopiedId(product.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleLaunchCheckout = async (product: Product) => {
    const sessionId = await createCheckoutSession({
      productId: product.id,
      amount: product.price,
      title: product.name,
      currency: product.currency
    });
    if (sessionId) {
      setCurrentView('checkout', { sessionId });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
            Products & AI Billing Catalog
          </h2>
          <p className="text-xs sm:text-sm text-[#86868b]">
            Manage your AI token packages, SaaS subscriptions, perpetual licenses, and meters.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="apple-btn-black px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Product
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div 
            key={product.id}
            className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-black/20 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-[#f5f5f7] text-[#0071e3]">
                    {product.type === 'credits' && <Coins className="w-5 h-5" />}
                    {product.type === 'subscription' && <CreditCard className="w-5 h-5" />}
                    {product.type === 'license_key' && <Key className="w-5 h-5" />}
                    {product.type === 'one_time' && <Zap className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#f5f5f7] font-bold text-[#6e6e73]">
                      {product.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteProduct(product.id)}
                  className="text-[#86868b] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-[#1d1d1f] text-lg font-sans">
                  {product.name}
                </h3>
                <p className="text-xs text-[#6e6e73] line-clamp-2 mt-1 leading-relaxed">
                  {product.description || 'No description provided'}
                </p>
              </div>

              <div className="pt-2">
                <div className="text-2xl font-black text-[#1d1d1f] font-mono">
                  ${product.price.toFixed(2)} <span className="text-xs font-normal text-[#86868b]">{product.currency}</span>
                </div>
                {product.type === 'credits' && (
                  <div className="text-xs font-semibold text-[#0071e3] mt-0.5">
                    🪙 {product.credits?.toLocaleString()} AI Credits Included
                  </div>
                )}
                {product.type === 'subscription' && (
                  <div className="text-xs text-purple-700 font-semibold mt-0.5">
                    🔄 Renews monthly via KODO MoR
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-black/5 flex items-center gap-2">
              <button
                onClick={() => handleLaunchCheckout(product)}
                className="apple-btn-black flex-1 py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Test Checkout
              </button>

              <button
                onClick={() => handleCopyCheckoutUrl(product)}
                className="apple-btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                title="Copy shareable checkout link"
              >
                {copiedId === product.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === product.id ? 'Copied' : 'Link'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex justify-between items-center pb-3 border-b border-black/5">
              <h3 className="font-bold text-[#1d1d1f] text-lg font-heading">
                Create New Product
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#86868b] hover:text-[#1d1d1f] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Product Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'credits', label: 'AI Credits', icon: Coins },
                    { id: 'subscription', label: 'Subscription', icon: CreditCard },
                    { id: 'one_time', label: 'One-Time', icon: Zap }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as ProductType)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                        type === t.id
                          ? 'border-[#0071e3] bg-blue-50/60 text-[#0071e3] font-bold'
                          : 'border-black/5 bg-[#f5f5f7] text-[#6e6e73]'
                      }`}
                    >
                      <t.icon className="w-4 h-4 text-[#0071e3]" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Agent Token Pack"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1d1d1f]">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 5M LLM tokens for OpenAI / Anthropic models"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1d1d1f]">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none font-mono"
                  />
                </div>

                {type === 'credits' && (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#1d1d1f]">Credit Units / Tokens</label>
                    <input
                      type="number"
                      step="1000"
                      value={credits}
                      onChange={(e) => setCredits(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-black/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="apple-btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="apple-btn-black px-5 py-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
