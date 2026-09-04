import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'black' | 'white';
  onClick?: () => void;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showSubtitle = false, 
  variant = 'black',
  onClick 
}) => {
  const isWhite = variant === 'white';
  const logoHeight = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : 'h-8 sm:h-9';

  return (
    <div 
      className={`flex items-center gap-2 cursor-pointer select-none group ${className}`}
      onClick={onClick}
    >
      <div className="relative flex items-center">
        {/* Official User Uploaded QivroPay Logo */}
        <img 
          src="/qivropay-logo.png" 
          alt="qivropay" 
          className={`${logoHeight} w-auto object-contain transition-transform duration-200 group-hover:scale-105 ${
            isWhite ? 'brightness-0 invert' : 'mix-blend-multiply'
          }`}
        />

        {/* Payment Infrastructure India Badge */}
        <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-bold tracking-wider hidden sm:inline-block">
          🇮🇳 India Payments
        </span>
      </div>

      {showSubtitle && (
        <span className="text-[11px] text-[#8C90A0] tracking-tight font-medium ml-1 hidden lg:inline-block">
          • India-first payment infrastructure
        </span>
      )}
    </div>
  );
};
