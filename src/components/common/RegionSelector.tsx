import React, { useState, useRef, useEffect } from 'react';
import { useRegion } from '../../context/RegionContext';
import { getCurrencySymbol, CURRENCY_METADATA } from '../../lib/currency';
import { ChevronDown, Check, Globe } from 'lucide-react';

interface RegionSelectorProps {
  className?: string;
  compact?: boolean;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ className = '', compact = false }) => {
  const { region, currency, setRegion, setCurrency, supportedRegions, supportedCurrencies } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currencySymbol = getCurrencySymbol(currency).trim();

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Compact Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current region: ${region.name}, currency: ${currency}`}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-[#f5f5f7] text-[#0A0D14] text-xs font-semibold shadow-xs transition-all outline-none focus:ring-2 focus:ring-[#0055FF]/20 cursor-pointer select-none"
      >
        <span className="text-sm leading-none" role="img" aria-hidden="true">
          {region.flag}
        </span>
        <span className={`${compact ? 'hidden sm:inline' : 'inline'} font-medium`}>
          {region.name}
        </span>
        <span className="text-[#8C90A0]">·</span>
        <span className="font-mono font-bold text-[#0055FF]">
          {currency} {currencySymbol}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6E717D] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Country and Currency Selection"
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-black/10 shadow-xl z-50 overflow-hidden motion-safe:animate-fade-in"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-black/5 bg-[#fafafc] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A0D14]">
              <Globe className="w-3.5 h-3.5 text-[#0055FF]" />
              <span>Country / Region &amp; Currency</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C90A0]">
              Display
            </span>
          </div>

          {/* Region List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5" role="listbox">
            {supportedRegions.map(r => {
              const isSelected = r.code === region.code;
              return (
                <button
                  key={r.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setRegion(r.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-blue-50 text-[#0055FF] font-bold'
                      : 'text-[#0A0D14] hover:bg-black/[0.04] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base leading-none shrink-0" role="img" aria-hidden="true">
                      {r.flag}
                    </span>
                    <span className="truncate">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="font-mono text-[11px] text-[#6E717D]">
                      {r.currencyDisplay}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0055FF] shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Independent Currency Override Section */}
          <div className="p-3 border-t border-black/5 bg-[#fafafc]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#6E717D]">
                Change currency independently:
              </span>
              <span className="text-[10px] font-mono text-[#8C90A0]">
                {currency} active
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {supportedCurrencies.map(c => {
                const active = c === currency;
                const sym = getCurrencySymbol(c).trim();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCurrency(c);
                    }}
                    title={`${CURRENCY_METADATA[c]?.name || c} (${sym})`}
                    className={`py-1 px-1 rounded-lg text-[11px] font-mono font-bold transition-all text-center ${
                      active
                        ? 'bg-[#0A0D14] text-white shadow-xs'
                        : 'bg-white border border-black/10 text-[#0A0D14] hover:bg-black/[0.04]'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
