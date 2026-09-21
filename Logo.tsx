import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  dark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-9 h-9", size, dark = true }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="PersonaLock Studio Logo (Mizumoto CS)"
    >
      {dark ? (
        <>
          {/* Black Badge Edition (BLACK3) */}
          <circle cx="50" cy="50" r="46" fill="#09090B" />
          <circle cx="50" cy="50" r="41" stroke="#27272A" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* Monogram Stems */}
          <rect x="28" y="47" width="9.6" height="18" rx="4.8" fill="#FFFFFF" />
          <rect x="58.5" y="49" width="9.6" height="16" rx="4.8" fill="#FFFFFF" />

          {/* Red Accents */}
          <circle cx="32.8" cy="35.2" r="4.8" fill="#C5222E" />
          <g transform="translate(57.5, 42.5) rotate(-45)">
            <rect x="-14.5" y="-5.3" width="29" height="10.6" rx="5.3" fill="#C5222E" />
          </g>
        </>
      ) : (
        <>
          {/* Light / Transparent Edition */}
          <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#E4E4E7" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="36" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />

          {/* Monogram Stems */}
          <rect x="28" y="47" width="9.6" height="18" rx="4.8" fill="#18181B" />
          <rect x="58.5" y="49" width="9.6" height="16" rx="4.8" fill="#18181B" />

          {/* Red Accents */}
          <circle cx="32.8" cy="35.2" r="4.8" fill="#C5222E" />
          <g transform="translate(57.5, 42.5) rotate(-45)">
            <rect x="-14.5" y="-5.3" width="29" height="10.6" rx="5.3" fill="#C5222E" />
          </g>
        </>
      )}
    </svg>
  );
};

export default Logo;
