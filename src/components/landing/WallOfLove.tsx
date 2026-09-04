import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';

export const WallOfLove: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote: "Goodbye LemonSqueezy — too many failed payments and endless support delays. Moved over to QIVROPAY for our AI agents today. Onboarding took less than a day, and international checkout conversion skyrocketed.",
      name: "Ayush Saxena",
      handle: "@ayushtweetshere",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      company: "SynthFlow AI"
    },
    {
      quote: "QIVROPAY is the definitive Stripe alternative for AI-first products and solopreneurs. Zero VAT headaches, built-in credit metering, and same-day verification.",
      name: "Sarah Miller",
      handle: "@sarahm_dev",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      company: "AgentCraft.io"
    },
    {
      quote: "After trying PayPal, manual wires, and complex Stripe tax registrations, we moved everything to QivroPay. The developer experience is on par with Apple products.",
      name: "Praveen Naik",
      handle: "@p_naix",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      company: "VectorFlow Labs"
    }
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 md:py-36 bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#0071e3]">
              Customer Testimonials
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1d1d1f] tracking-tight">
              Trusted by leading AI companies.
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="p-3.5 rounded-full border border-black/10 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="p-3.5 rounded-full border border-black/10 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] transition-all active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="p-10 sm:p-14 rounded-3xl bg-[#f5f5f7] border border-black/5 relative flex flex-col justify-between min-h-[240px]">
          <p className="text-2xl sm:text-3xl font-light text-[#1d1d1f] leading-relaxed tracking-tight">
            “{current.quote}”
          </p>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-black/10">
            <div className="flex items-center gap-4">
              <img
                src={current.avatar}
                alt={current.name}
                className="w-12 h-12 rounded-full object-cover border border-black/10"
              />
              <div>
                <div className="font-bold text-[#1d1d1f] text-base">
                  {current.name}
                </div>
                <div className="text-xs text-[#86868b] font-mono">
                  {current.handle} • <span className="text-[#0071e3] font-bold">{current.company}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
