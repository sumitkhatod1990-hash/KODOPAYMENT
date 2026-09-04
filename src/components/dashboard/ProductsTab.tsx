import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductType } from '../../types';
import { Modal } from '../common/Modal';
import { Plus, Trash2, ExternalLink, Copy, CheckCircle2, Coins, CreditCard, Key, Zap, Package } from 'lucide-react';

const emptyErrors: { name?: string; price?: string } = {};

export const ProductsTab: React.FC = () => {
  const { products, refreshData, deleteProduct, createCheckoutSession, setCurrentView } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State — fields start empty; nothing here is a pre-filled demo value.
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const currency = 'INR';
  const [type, setType] = useState<ProductType>('one_time');
  const [credits, setCredits] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>(emptyErrors);
  const [submitError, setSubmitError] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setType('one_time');
    setCredits('');
    setErrors(emptyErrors);
    setSubmitError('');
  };

  const closeCreateModal = () => {
    if (isSubmitting) return;
    setShowCreateModal(false);
    resetForm();
  };

  const validate = () => {
    const next: { name?: string; price?: string } = {};
    if (!name.trim()) next.name = 'Product name is required';
    const numericPrice = Number(price);
    if (price.trim() === '' || Number.isNaN(numericPrice)) {
      next.price = 'Enter a valid price';
    } else if (numericPrice <= 0) {
      next.price = 'Price must be greater than 0';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          type,
          ...(type === 'credits' ? { credits: Number(credits) || 0 } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data?.error || 'Could not create product. Please try again.');
        return;
      }
      await refreshData();
      setShowCreateModal(false);
      resetForm();
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      setCurrentView('checkout', { sessionId, returnTo: 'dashboard' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] font-heading">
            Products
          </h2>
          <p className="text-xs sm:text-sm text-[#86868b]">
            Create one-time products with shareable INR checkout links.
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

      {/* Empty State */}
      {products.length === 0 && (
        <div className="p-10 sm:p-14 rounded-3xl bg-white border border-black/10 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] text-[#86868b] flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#1d1d1f] text-base font-sans">No products yet</h3>
            <p className="text-xs text-[#86868b] mt-1 max-w-sm mx-auto">
              Create your first product to start accepting payments.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="apple-btn-black px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create product
          </button>
        </div>
      )}

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div 
            key={product.id}
            className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-black/20 dark:hover:border-white/20 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-[#f5f5f7] text-[#0071e3]">
                    {product.type === 'credits' && <Coins className="w-5 h-5" />}
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
                  className="text-[#86868b] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
                  ₹{product.price.toFixed(2)} <span className="text-xs font-normal text-[#86868b]">INR</span>
                </div>
                {product.type === 'credits' && (
                  <div className="text-xs font-semibold text-[#0071e3] mt-0.5">
                    {product.credits?.toLocaleString()} credits included
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
      <Modal open={showCreateModal} onClose={closeCreateModal} title="Create New Product">
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">

          <div className="space-y-1.5">
            <label className="font-semibold text-[#1d1d1f]" id="product-type-label">Product Type</label>
            <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="product-type-label">
              {[
                { id: 'one_time', label: 'One-Time', icon: Zap },
                { id: 'credits', label: 'Credit Pack', icon: Coins },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={type === t.id}
                  onClick={() => setType(t.id as ProductType)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    type === t.id
                      ? 'border-[#0071e3] bg-blue-50/60 dark:bg-blue-950/40 text-[#0071e3] font-bold'
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
            <label htmlFor="product-name" className="font-semibold text-[#1d1d1f]">Product name</label>
            <input
              id="product-name"
              type="text"
              placeholder="e.g. Pro Plan License"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'product-name-error' : undefined}
              className={`w-full p-2.5 rounded-xl border bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none ${errors.name ? 'border-red-400' : 'border-black/10'}`}
            />
            {errors.name && <p id="product-name-error" className="text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-description" className="font-semibold text-[#1d1d1f]">Description <span className="font-normal text-[#86868b]">(optional)</span></label>
            <textarea
              id="product-description"
              rows={2}
              placeholder="What does a customer get with this product?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none"
            />
          </div>

          <div className={`grid gap-4 ${type === 'credits' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="space-y-1.5">
              <label htmlFor="product-price" className="font-semibold text-[#1d1d1f]">Price (INR)</label>
              <input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={Boolean(errors.price)}
                aria-describedby={errors.price ? 'product-price-error' : undefined}
                className={`w-full p-2.5 rounded-xl border bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none font-mono ${errors.price ? 'border-red-400' : 'border-black/10'}`}
              />
              {errors.price && <p id="product-price-error" className="text-red-600 dark:text-red-400">{errors.price}</p>}
            </div>

            {type === 'credits' && (
              <div className="space-y-1.5">
                <label htmlFor="product-credits" className="font-semibold text-[#1d1d1f]">Credits included</label>
                <input
                  id="product-credits"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 1000"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] focus:border-[#0071e3] outline-none font-mono"
                />
              </div>
            )}
          </div>

          {submitError && (
            <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-3 py-2">
              {submitError}
            </p>
          )}

          <div className="pt-4 border-t border-black/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={isSubmitting}
              className="apple-btn-secondary px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="apple-btn-black px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving…' : 'Save Product'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
