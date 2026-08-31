import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRightLeft, 
  UploadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Key, 
  Sparkles,
  RefreshCw,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MigrationTab: React.FC = () => {
  const [source, setSource] = useState<'stripe' | 'lemonsqueezy' | 'paddle'>('stripe');
  const [apiKey, setApiKey] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  const handleStartMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMigrating(true);

    try {
      const res = await fetch('/api/v1/migration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, count: 24 })
      });
      const data = await res.json();
      setMigrationResult(data);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Migration failed', err);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0A0D14] font-heading">
          1-Click Migration Importer
        </h2>
        <p className="text-xs sm:text-sm text-[#8C90A0]">
          Seamlessly import your products, customer cohorts, and active recurring subscriptions with zero downtime.
        </p>
      </div>

      {/* Platform Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { id: 'stripe', name: 'Stripe Billing / Invoicing', desc: 'Import Customers, Products & Subscription Schedules', color: 'border-purple-200 hover:border-purple-500' },
          { id: 'lemonsqueezy', name: 'Lemon Squeezy', desc: 'Import License Keys, Product Bundles & Tax Nexus', color: 'border-amber-200 hover:border-amber-500' },
          { id: 'paddle', name: 'Paddle Classic / Billing', desc: 'Import MoR Subscriptions & Multi-Currency Catalogs', color: 'border-blue-200 hover:border-blue-500' }
        ].map((p) => (
          <div
            key={p.id}
            onClick={() => setSource(p.id as any)}
            className={`opp-card p-6 cursor-pointer space-y-2 transition-all ${
              source === p.id ? 'border-[#0055FF] shadow-md ring-2 ring-[#0055FF]/10' : 'hover:border-black/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#0A0D14] text-sm">{p.name}</span>
              {source === p.id && <CheckCircle2 className="w-4 h-4 text-[#0055FF]" />}
            </div>
            <p className="text-xs text-[#6E717D] leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Migration Action Box */}
      <div className="opp-card p-8 sm:p-10 space-y-6">
        
        {migrationResult ? (
          <div className="text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#0A0D14] font-heading">
                Migration Complete!
              </h3>
              <p className="text-xs text-[#8C90A0] font-mono mt-1">
                {migrationResult.message}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F5F8] max-w-md mx-auto grid grid-cols-3 gap-3 text-xs font-mono text-left">
              <div className="p-3 bg-white rounded-xl border border-black/5">
                <div className="text-[#8C90A0]">Products:</div>
                <div className="font-bold text-lg text-[#0A0D14]">{migrationResult.imported.products}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-black/5">
                <div className="text-[#8C90A0]">Customers:</div>
                <div className="font-bold text-lg text-[#0A0D14]">{migrationResult.imported.customers}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-black/5">
                <div className="text-[#8C90A0]">Subscriptions:</div>
                <div className="font-bold text-lg text-emerald-700">{migrationResult.imported.subscriptions}</div>
              </div>
            </div>

            <button
              onClick={() => setMigrationResult(null)}
              className="opp-btn-secondary px-6 py-2.5 text-xs font-semibold"
            >
              Perform Another Import
            </button>
          </div>
        ) : (
          <form onSubmit={handleStartMigration} className="space-y-6">
            
            <div className="space-y-2">
              <label className="font-semibold text-xs text-[#0A0D14] uppercase tracking-wide font-mono">
                Connect your {source.toUpperCase()} Restricted Read-Only API Key or Upload CSV
              </label>
              <input
                type="password"
                placeholder={`rk_live_... (Your ${source.toUpperCase()} secret key)`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-black/10 bg-[#F4F5F8] font-mono text-xs text-[#0A0D14] outline-none focus:border-[#0055FF]"
              />
              <span className="text-[11px] text-[#8C90A0]">
                We only require read access to import products, customer records, and active recurring cohorts.
              </span>
            </div>

            {/* File Drag Box */}
            <div className="p-8 rounded-2xl border-2 border-dashed border-black/10 text-center space-y-2 hover:border-black/30 transition-colors cursor-pointer bg-[#FAFBFD]">
              <UploadCloud className="w-8 h-8 text-[#0055FF] mx-auto" />
              <div className="text-xs font-bold text-[#0A0D14]">Or drag and drop your {source.toUpperCase()} export .CSV file here</div>
              <p className="text-[11px] text-[#8C90A0]">Supports customers_export.csv, subscriptions_export.csv, products.json</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isMigrating}
                className="opp-btn-primary px-8 py-3 text-xs font-semibold flex items-center gap-2 shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                <span>{isMigrating ? 'Importing Live Cohorts...' : `Start Instant Migration from ${source.toUpperCase()}`}</span>
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
};
