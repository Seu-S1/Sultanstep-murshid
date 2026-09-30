import React from 'react';

interface StepAvatarProps {
  className?: string;
  size?: number | string;
  showBorder?: boolean;
  interactiveModal?: boolean;
}

export const StepAvatarSvg: React.FC<{ size?: number | string; className?: string }> = ({
  size = '100%',
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="شعار مرشدك STEP - SultanPMAU"
    >
      <defs>
        {/* Background gradient */}
        <radialGradient id="bgGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#0d1b36" />
          <stop offset="70%" stopColor="#060c1b" />
          <stop offset="100%" stopColor="#040814" />
        </radialGradient>

        {/* Ring glow filter */}
        <filter id="ringGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Linear ring gradient */}
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#93c5fd" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Main Circular Background */}
      <circle cx="250" cy="250" r="240" fill="url(#bgGlow)" />

      {/* Outer Glow Ring */}
      <circle
        cx="250"
        cy="250"
        r="230"
        stroke="url(#ringGrad)"
        strokeWidth="2.5"
        strokeOpacity="0.85"
        filter="url(#ringGlow)"
      />

      {/* Inner Delicate Ring */}
      <circle
        cx="250"
        cy="250"
        r="220"
        stroke="#cbd5e1"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* Top Corner Lens Flare Accent (as in the original photo) */}
      <circle cx="95" cy="115" r="3" fill="#ffffff" filter="url(#ringGlow)" />
      <path
        d="M 95 105 L 95 125 M 85 115 L 105 115"
        stroke="#ffffff"
        strokeWidth="1"
        strokeOpacity="0.8"
      />

      {/* Graduation Cap (Mortarboard) */}
      <g id="graduation-cap" transform="translate(0, 0)">
        {/* Diamond Flat Top */}
        <path
          d="M 250 105 L 365 145 L 250 190 L 135 145 Z"
          fill="#ffffff"
        />
        {/* Lower Skull Cap */}
        <path
          d="M 180 166 L 180 200 C 180 215, 320 215, 320 200 L 320 166 C 298 178, 268 184, 250 184 C 232 184, 202 178, 180 166 Z"
          fill="#ffffff"
        />
        {/* Cap Button */}
        <circle cx="250" cy="147" r="4.5" fill="#e2e8f0" />
        {/* Hanging Tassel */}
        <path
          d="M 250 147 Q 330 155, 335 180 L 335 220"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Tassel Fringe / Knot */}
        <path
          d="M 331 220 C 331 216, 339 216, 339 220 L 341 245 C 341 247, 329 247, 329 245 Z"
          fill="#ffffff"
        />
      </g>

      {/* Large Bold "STEP" Wordmark */}
      <text
        x="250"
        y="300"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="88"
        letterSpacing="2"
      >
        STEP
      </text>

      {/* Divider with central diamond */}
      <g id="divider" transform="translate(0, 318)">
        {/* Left line */}
        <line x1="105" y1="0" x2="232" y2="0" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
        {/* Center 4-pointed diamond */}
        <path
          d="M 250 -7 L 255 0 L 250 7 L 245 0 Z"
          fill="#ffffff"
        />
        {/* Right line */}
        <line x1="268" y1="0" x2="395" y2="0" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
      </g>

      {/* University Text */}
      <text
        x="250"
        y="350"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="21"
        letterSpacing="0.4"
      >
        Prince Musaed bin Abdulrahman
      </text>
      <text
        x="250"
        y="378"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="21"
        letterSpacing="0.5"
      >
        University
      </text>

      {/* Social Accounts Bar */}
      <g id="social-handles" transform="translate(0, 422)">
        {/* Snapchat Ghost Icon (simplified clean vector) */}
        <g transform="translate(138, -13) scale(0.72)">
          <path
            d="M 12 2 C 7.5 2 4 5.5 4 10 C 4 13.5 6 15 6.5 16 C 6 16.5 4.5 17 3 17 C 2.5 17 2 17.5 2 18 C 2 18.5 2.5 19 4 19 C 5.5 19 6 19.5 7 20 C 8 20.5 8 21.5 8 22 C 8.5 22 9.5 21.5 11 21.5 C 11.5 21.5 12 22 12 22 C 12 22 12.5 21.5 13 21.5 C 14.5 21.5 15.5 22 16 22 C 16 21.5 16 20.5 17 20 C 18 19.5 18.5 19 20 19 C 21.5 19 22 18.5 22 18 C 22 17.5 21.5 17 21 17 C 19.5 17 18 16.5 17.5 16 C 18 15 20 13.5 20 10 C 20 5.5 16.5 2 12 2 Z"
            fill="#ffffff"
          />
        </g>
        <text
          x="160"
          y="0"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="600"
          fontSize="15"
          letterSpacing="0.2"
        >
          @sultanseu
        </text>

        {/* Separator */}
        <line x1="250" y1="-12" x2="250" y2="3" stroke="#64748b" strokeWidth="1.8" />

        {/* X (Twitter) Icon */}
        <g transform="translate(264, -13) scale(0.68)">
          <path
            d="M 18.244 2.25 h 3.308 l -7.227 8.26 8.502 11.24 H 16.17 l -5.214 -6.817 L 4.99 21.75 H 1.68 l 7.73 -8.835 L 1.254 2.25 H 8.08 l 4.713 6.231 z m -1.161 17.52 h 1.833 L 7.084 4.126 H 5.117 z"
            fill="#ffffff"
          />
        </g>
        <text
          x="286"
          y="0"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="600"
          fontSize="15"
          letterSpacing="0.2"
        >
          @SultanPMAU
        </text>
      </g>
    </svg>
  );
};

export const StepAvatar: React.FC<StepAvatarProps> = ({
  className = 'w-10 h-10',
  showBorder = true,
  interactiveModal = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const innerContent = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full transition-transform duration-200 group-hover:scale-105 shadow-sm overflow-hidden ${
        showBorder ? 'ring-2 ring-blue-900/30 ring-offset-1 ring-offset-white' : ''
      } ${className}`}
      aria-label="شعار مرشدك STEP - SultanPMAU"
    >
      <StepAvatarSvg className="w-full h-full rounded-full" />
    </div>
  );

  if (!interactiveModal) {
    return innerContent;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="شعار مرشدك STEP - SultanPMAU (انقر للتكبير والتفاصيل)"
        className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 rounded-full"
        aria-label="عرض شعار المنصة وتفاصيل المالك"
      >
        {innerContent}
      </button>

      {/* High-Resolution Preview Modal on Click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#081226] text-white rounded-2xl p-6 shadow-2xl border border-blue-900/60 text-center space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 left-3 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
              aria-label="إغلاق"
            >
              ✕
            </button>

            {/* Avatar in Full Glory */}
            <div className="w-56 h-56 mx-auto drop-shadow-[0_10px_25px_rgba(30,58,138,0.5)]">
              <StepAvatarSvg className="w-full h-full" />
            </div>

            <div className="space-y-1 pt-1">
              <h4 className="text-base font-bold text-white">
                مرشدك لاختبار STEP
              </h4>
              <p className="text-xs text-blue-300 font-medium">
                Prince Musaed bin Abdulrahman University
              </p>
            </div>

            {/* Social Links Cards */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-2">
                <span className="font-bold text-white">Snap:</span>
                <span className="text-yellow-400 font-mono text-[11px]">@sultanseu</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-2">
                <span className="font-bold text-white">X:</span>
                <span className="text-sky-400 font-mono text-[11px]">@SultanPMAU</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              مرشدك لاختبار STEP • © 2026 SultanPMAU. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
