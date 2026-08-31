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
  // Height sizing
  const logoHeight = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : 'h-8 sm:h-9';
  const logoSrc = variant === 'white' ? '/kodo-logo-white.png' : '/kodo-logo-black.png';

  return (
    <div 
      className={`flex items-center gap-2 cursor-pointer select-none group ${className}`}
      onClick={onClick}
    >
      <div className="relative flex items-center">
        {/* Crisp Pure Black Official User Logo */}
        <img 
          src={logoSrc} 
          alt="KODO" 
          className={`${logoHeight} w-auto object-contain transition-transform duration-200 group-hover:scale-105`}
        />
        
        {/* Merchant of Record Badge */}
        <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#0071e3] border border-black/5 font-bold tracking-wider hidden sm:inline-block">
          MoR
        </span>
      </div>

      {showSubtitle && (
        <span className="text-[11px] text-[#86868b] tracking-tight font-medium ml-1 hidden lg:inline-block">
          • The Billing Platform for AI
        </span>
      )}
    </div>
  );
};
