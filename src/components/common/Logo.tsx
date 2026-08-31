import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'black' | 'white';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showSubtitle = false, 
  variant = 'black',
  onClick 
}) => {
  const isWhite = variant === 'white';
  const iconSize = size === 'sm' ? 'w-7 h-7 text-sm' : size === 'lg' ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-base';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg sm:text-xl';

  return (
    <div 
      className={`flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
      onClick={onClick}
    >
      <div className="relative flex items-center gap-2.5">
        {/* Modern QivroPay Brand Mark */}
        <div className={`${iconSize} rounded-xl bg-gradient-to-tr from-[#0055FF] via-[#3A86FF] to-[#7B2CBF] text-white font-extrabold flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105`}>
          Q
        </div>
        
        {/* Brand Name Typography */}
        <span className={`font-extrabold ${textSize} tracking-tight font-sans ${isWhite ? 'text-white' : 'text-[#0A0D14]'}`}>
          Qivro<span className="text-[#0055FF]">Pay</span>
        </span>

        {/* Merchant of Record India Badge */}
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0055FF] border border-blue-100 font-bold tracking-wider hidden sm:inline-block">
          🇮🇳 MoR India
        </span>
      </div>

      {showSubtitle && (
        <span className="text-[11px] text-[#8C90A0] tracking-tight font-medium ml-1 hidden lg:inline-block">
          • India's #1 Merchant of Record for SaaS &amp; AI
        </span>
      )}
    </div>
  );
};
