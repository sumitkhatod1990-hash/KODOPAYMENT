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
  onClick,
  iconOnly = false
}) => {
  const isWhite = variant === 'white';
  const textColor = isWhite ? '#FFFFFF' : '#18181B';
  const greenColor = '#22C55E'; // Vibrant Trust Green from user logo

  const height = size === 'sm' ? 24 : size === 'lg' ? 42 : 32;

  return (
    <div 
      className={`flex items-center gap-2 cursor-pointer select-none group ${className}`}
      onClick={onClick}
    >
      <div className="relative flex items-center gap-2">
        {iconOnly ? (
          /* Icon Only: Stylized 'q' with Green Checkmark */
          <svg 
            width={height} 
            height={height} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-200 group-hover:scale-105"
          >
            {/* Top-Left Green Checkmark Tick */}
            <path
              d="M 12 36 L 28 52 L 48 24 L 40 18 L 28 38 L 18 28 Z"
              fill={greenColor}
            />
            {/* Main 'q' */}
            <path
              d="M 50 18 C 32 18 18 32 18 50 C 18 68 32 82 50 82 C 60 82 69 77 74 69 L 74 92 C 74 95.3 76.7 98 80 98 C 83.3 98 86 95.3 86 92 L 86 24 C 86 20.7 83.3 18 80 18 C 76.7 18 74 20.7 74 24 L 74 31 C 69 23 60 18 50 18 Z M 50 30 C 61 30 70 39 70 50 C 70 61 61 70 50 70 C 39 70 30 61 30 50 C 30 39 39 30 50 30 Z"
              fill={textColor}
            />
          </svg>
        ) : (
          /* Full Official QivroPay Wordmark SVG */
          <div className="flex items-center">
            <svg 
              height={height} 
              viewBox="0 0 380 90" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-auto transition-transform duration-200 group-hover:scale-[1.02]"
            >
              {/* Green Verified Checkmark on 'q' */}
              <path
                d="M 12 36 L 28 52 L 52 20 L 44 14 L 28 36 L 19 27 Z"
                fill={greenColor}
              />

              {/* 'q' */}
              <path
                d="M 46 16 C 30 16 16 30 16 46 C 16 62 30 76 46 76 C 56 76 64.5 71 69.5 63.5 L 69.5 86 C 69.5 89.3 72.2 92 75.5 92 C 78.8 92 81.5 89.3 81.5 86 L 81.5 22 C 81.5 18.7 78.8 16 75.5 16 C 72.2 16 69.5 18.7 69.5 22 L 69.5 28.5 C 64.5 21 56 16 46 16 Z M 48 28 C 58 28 66 36 66 46 C 66 56 58 64 48 64 C 38 64 30 56 30 46 C 30 36 38 28 48 28 Z"
                fill={textColor}
              />

              {/* 'i' */}
              <circle cx="106" cy="20" r="7" fill={textColor} />
              <rect x="100" y="34" width="12" height="42" rx="6" fill={textColor} />

              {/* 'v' */}
              <path
                d="M 124 34 C 127.3 34 130 36.7 130 40 L 140 64 L 150 40 C 150 36.7 152.7 34 156 34 C 159.3 34 162 36.7 162 40 L 148 72 C 146.5 75.5 143.5 76 140 76 C 136.5 76 133.5 75.5 132 72 L 118 40 C 118 36.7 120.7 34 124 34 Z"
                fill={textColor}
              />

              {/* 'r' */}
              <path
                d="M 174 34 C 177.3 34 180 36.7 180 40 L 180 70 C 180 73.3 177.3 76 174 76 C 170.7 76 168 73.3 168 70 L 168 40 C 168 36.7 170.7 34 174 34 Z M 178 44 C 182 37 190 34 198 35 C 201.3 35.5 203.5 38.5 203 41.8 C 202.5 45.1 199.5 47.3 196.2 46.8 C 190 46 183 48 180 54 L 180 44 Z"
                fill={textColor}
              />

              {/* 'o' */}
              <path
                d="M 235 34 C 221 34 210 44 210 55 C 210 66 221 76 235 76 C 249 76 260 66 260 55 C 260 44 249 34 235 34 Z M 235 44 C 243 44 249 49 249 55 C 249 61 243 66 235 66 C 227 66 221 61 221 55 C 221 49 227 44 235 44 Z"
                fill={textColor}
              />

              {/* 'p' */}
              <path
                d="M 284 34 C 274 34 266 39 261 46.5 L 261 22 C 261 18.7 258.3 16 255 16 C 251.7 16 249 18.7 249 22 L 249 86 C 249 89.3 251.7 92 255 92 C 258.3 92 261 89.3 261 86 L 261 63.5 C 266 71 274 76 284 76 C 298 76 312 62 312 46 C 312 30 298 16 284 16 Z M 282 64 C 272 64 264 56 264 46 C 264 36 272 28 282 28 C 292 28 300 36 300 46 C 300 56 292 64 282 64 Z"
                fill={textColor}
              />

              {/* 'a' */}
              <path
                d="M 334 34 C 322 34 314 40 311 48 C 310 51 312 54 315 55 C 318 56 321 54 322 51 C 324 46 328 44 334 44 C 340 44 344 47 344 52 L 344 55 C 340 55 320 56 314 62 C 308 67 310 76 320 76 C 327 76 333 73 344 66 L 344 70 C 344 73.3 346.7 76 350 76 C 353.3 76 356 73.3 356 70 L 356 50 C 356 39 347 34 334 34 Z M 330 68 C 324 68 322 64 324 61 C 327 58 335 58 344 58 L 344 62 C 339 66 334 68 330 68 Z"
                fill={textColor}
              />

              {/* 'y' */}
              <path
                d="M 370 34 C 366.7 34 364 36.7 364 40 L 374 64 L 364 86 C 362.5 89.3 364 93 367.3 94.5 C 370.6 96 374.3 94.5 375.8 91.2 L 392 55 L 392 40 C 392 36.7 389.3 34 386 34 C 382.7 34 380 36.7 380 40 L 376 50 L 372 40 C 372 36.7 369.3 34 366 34 Z"
                fill={textColor}
              />
            </svg>

            {/* Merchant of Record India Badge */}
            <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold tracking-wider hidden sm:inline-block">
              🇮🇳 MoR India
            </span>
          </div>
        )}
      </div>

      {showSubtitle && (
        <span className="text-[11px] text-[#8C90A0] tracking-tight font-medium ml-1 hidden lg:inline-block">
          • India's #1 Merchant of Record for SaaS &amp; AI
        </span>
      )}
    </div>
  );
};
