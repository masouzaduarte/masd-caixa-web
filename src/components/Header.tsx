import { Menu } from 'lucide-react';

type HeaderProps = {
  onMenuClick: () => void;
  title: string;
  userName: string;
  onSair: () => void;
  showMenuButton: boolean;
};

export function Header({ onMenuClick, title, userName, onSair, showMenuButton }: HeaderProps) {
  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        {showMenuButton && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Abrir menu"
            style={menuButtonStyle}
          >
            <Menu size={22} />
          </button>
        )}
        <span style={titleStyle}>{title}</span>
      </div>
      <div style={userBlockStyle}>
        <span style={userNameStyle}>{userName}</span>
        <button type="button" onClick={onSair} style={sairStyle}>
          Sair
        </button>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  padding: '1rem 1.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: 'var(--shadow-sm)',
  borderBottom: '1px solid var(--color-border-light)',
  flexWrap: 'wrap',
  gap: '0.5rem',
};
const leftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};
const menuButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.5rem',
  background: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text)',
  cursor: 'pointer',
  transition: 'background 0.2s ease, border-color 0.2s ease',
};
const titleStyle: React.CSSProperties = {
  fontSize: '1.1875rem',
  fontWeight: 600,
  color: 'var(--color-text)',
  letterSpacing: '-0.02em',
};
const userBlockStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};
const userNameStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
};
const sairStyle: React.CSSProperties = {
  padding: '0.4rem 0.875rem',
  background: 'transparent',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-muted)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  fontSize: '0.8125rem',
  transition: 'background 0.2s ease, border-color 0.2s ease',
};
