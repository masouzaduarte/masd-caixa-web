interface LogoProps {
  variant?: 'horizontal' | 'square' | 'icon';
  /** Use em fundos escuros (sidebar, header de login) para texto branco */
  inverse?: boolean;
  /** Tamanho maior para destaque (ex.: acima do título Entrar) */
  size?: 'default' | 'large';
  className?: string;
}

const iconSizes = { default: 40, large: 80 } as const;
const squareGaps = { default: '0.75rem', large: '1.25rem' } as const;

export function Logo({
  variant = 'horizontal',
  inverse = false,
  size = 'default',
  className = '',
}: LogoProps) {
  const isLarge = size === 'large';
  const textStyle: React.CSSProperties = inverse
    ? { color: '#fff' }
    : { color: 'var(--color-text)' };
  const accentStyle: React.CSSProperties = inverse
    ? { color: 'rgba(255,255,255,0.9)' }
    : { color: 'var(--color-primary)' };

  if (variant === 'icon') {
    return (
      <div className={className} style={{ display: 'inline-flex' }} aria-hidden>
        <DashboardIcon size={iconSizes[size]} />
      </div>
    );
  }

  if (variant === 'square') {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: squareGaps[size],
        }}
      >
        <DashboardIcon size={iconSizes[size]} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            style={{
              ...textStyle,
              fontSize: isLarge ? '2.5rem' : '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            MASD
          </span>
          <span
            style={{
              ...accentStyle,
              fontSize: isLarge ? '2rem' : '1.25rem',
              fontWeight: 600,
            }}
          >
            Caixa
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isLarge ? '1rem' : '0.75rem',
      }}
    >
      <DashboardIcon size={iconSizes[size]} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            ...textStyle,
            fontSize: isLarge ? '2rem' : '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          MASD
        </span>
        <span
          style={{
            ...accentStyle,
            fontSize: isLarge ? '1.5rem' : '1.125rem',
            fontWeight: 600,
          }}
        >
          Caixa
        </span>
      </div>
    </div>
  );
}

function DashboardIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <rect width="48" height="48" rx="8" fill="#0d9488" />
      <line x1="12" y1="16" x2="36" y2="16" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="12" y1="24" x2="36" y2="24" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="12" y1="32" x2="36" y2="32" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="20" y1="12" x2="20" y2="36" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="28" y1="12" x2="28" y2="36" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <rect x="14" y="26" width="3" height="8" rx="1.5" fill="white" />
      <rect x="18.5" y="22" width="3" height="12" rx="1.5" fill="white" />
      <rect x="23" y="20" width="3" height="14" rx="1.5" fill="white" />
      <rect x="27.5" y="24" width="3" height="10" rx="1.5" fill="white" />
      <rect x="32" y="28" width="3" height="6" rx="1.5" fill="white" />
      <circle cx="15.5" cy="18" r="2" fill="#22c55e" />
      <circle cx="24" cy="14" r="2" fill="#22c55e" />
      <circle cx="33.5" cy="16" r="2" fill="#22c55e" />
      <path
        d="M 15.5 18 Q 20 16 24 14 Q 28 15 33.5 16"
        stroke="#22c55e"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
