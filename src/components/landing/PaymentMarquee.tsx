import React from 'react';
import { Landmark } from 'lucide-react';

// ---------------------------------------------------------------------------
// Closes the hero with a trust/payment-method divider. Only methods actually
// reachable through the current Cashfree-backed checkout flow are listed
// (see HostedCheckout.tsx: UPI + card rails, cards settle via the Visa /
// Mastercard / RuPay / Amex networks; Net Banking has no single brand, so it
// renders as a labeled icon rather than a fabricated logo). All logo files
// are the official marks sourced from each brand's own current logo asset
// (see public/assets/payment-logos) — never redrawn or approximated here.
// ---------------------------------------------------------------------------

interface PaymentMethod {
  name: string;
  src?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { name: 'UPI', src: '/assets/payment-logos/upi.svg' },
  { name: 'Visa', src: '/assets/payment-logos/visa.svg' },
  { name: 'Mastercard', src: '/assets/payment-logos/mastercard.svg' },
  { name: 'RuPay', src: '/assets/payment-logos/rupay.svg' },
  { name: 'American Express', src: '/assets/payment-logos/amex.svg' },
  { name: 'PhonePe', src: '/assets/payment-logos/phonepe.svg' },
  { name: 'Google Pay', src: '/assets/payment-logos/gpay.svg' },
  { name: 'Paytm', src: '/assets/payment-logos/paytm.svg' },
  { name: 'Net Banking' },
];

const MarqueeItem: React.FC<{ method: PaymentMethod }> = ({ method }) => (
  <div
    className="flex shrink-0 items-center justify-center h-6 sm:h-7 grayscale opacity-50 transition-all duration-300 hover:opacity-90 hover:grayscale-0"
    title={method.name}
  >
    {method.src ? (
      <img
        src={method.src}
        alt={method.name}
        className="h-full w-auto object-contain"
        draggable={false}
      />
    ) : (
      <span className="flex items-center gap-1.5 text-[#6E717D]">
        <Landmark className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
        <span className="text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap">Net Banking</span>
      </span>
    )}
  </div>
);

export const PaymentMarquee: React.FC = () => {
  const track = [...PAYMENT_METHODS, ...PAYMENT_METHODS];
  const methodNames = PAYMENT_METHODS.map(m => m.name).join(', ');

  return (
    <div className="relative mt-14 sm:mt-20 md:mt-24 border-t border-black/[0.06] pt-10 sm:pt-12">
      <p className="text-center text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#9296A3] mb-7 sm:mb-8">
        Payments your customers already use
      </p>

      <span className="sr-only">Supported payment methods: {methodNames}.</span>

      <div
        className="group relative overflow-hidden"
        aria-hidden="true"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div
          className="flex w-max items-center gap-10 sm:gap-14 md:gap-16 animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]"
          style={{ animationDuration: '38s' }}
        >
          {track.map((method, i) => (
            <MarqueeItem key={`${method.name}-${i}`} method={method} />
          ))}
        </div>
      </div>
    </div>
  );
};
