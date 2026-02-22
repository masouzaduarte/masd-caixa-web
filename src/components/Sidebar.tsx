import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  FileText,
  Upload,
  User,
  CalendarRange,
  Tags,
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Logo } from './Logo';
import { SidebarGroup } from './SidebarGroup';

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggleCollapse?: () => void;
  accountId: string | null;
  onSair: () => void;
};

function NavLink({
  to,
  label,
  end = false,
  icon: Icon,
  collapsed,
  currentPath,
  onNavigate,
}: {
  to: string | { pathname: string; state?: object };
  label: string;
  end: boolean;
  icon: LucideIcon;
  collapsed: boolean;
  currentPath: string;
  onNavigate: () => void;
}) {
  const pathname = typeof to === 'string' ? to : to.pathname;
  const isActive = end ? currentPath === pathname : currentPath.startsWith(pathname);
  return (
    <Link
      to={to}
      className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'sidebar-link-icon-only' : ''}`}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
    >
      <span className="sidebar-link-icon" aria-hidden>
        <Icon size={20} />
      </span>
      <span className="sidebar-link-text">{label}</span>
    </Link>
  );
}

export function Sidebar({ collapsed, mobileOpen, isMobile, onClose, onToggleCollapse, accountId, onSair }: SidebarProps) {
  const location = useLocation();
  const path = location.pathname;

  const transactionsTo = accountId ? `/accounts/${accountId}/transactions` : '/accounts';
  const importTo = accountId ? `/accounts/${accountId}/import` : '/accounts';

  const nav = (to: string, label: string, end: boolean, icon: LucideIcon, state?: object) => (
    <NavLink
      to={state ? { pathname: to, state } : to}
      label={label}
      end={end}
      icon={icon}
      collapsed={collapsed}
      currentPath={path}
      onNavigate={onClose}
    />
  );

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          role="presentation"
          aria-hidden
          style={{ ...overlayStyle, display: 'block' }}
          onClick={onClose}
        />
      )}
      <aside
        style={{
          ...sidebarStyle,
          width: isMobile ? 'var(--sidebar-width)' : (collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)'),
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : undefined,
        }}
        className={collapsed && !isMobile ? 'sidebar-collapsed' : ''}
        data-mobile-open={mobileOpen}
      >
        <div style={brandStyle}>
          <Link to="/" style={brandLinkStyle} onClick={onClose} title={collapsed ? 'MASD Caixa' : undefined}>
            <Logo variant={collapsed ? 'icon' : 'horizontal'} inverse />
          </Link>
        </div>

        <div style={quickActionsStyle}>
          <Link
            to="/transactions/new"
            className="sidebar-quick-action"
            onClick={onClose}
            title="Nova Transação"
          >
            <PlusCircle size={18} className="sidebar-link-icon" />
            <span className="sidebar-quick-action-text">+ Nova Transação</span>
          </Link>
          <Link
            to="/setup"
            className="sidebar-quick-action"
            onClick={onClose}
            title="Nova Conta"
          >
            <PlusCircle size={18} className="sidebar-link-icon" />
            <span className="sidebar-quick-action-text">+ Nova Conta</span>
          </Link>
        </div>

        <nav style={navStyle}>
          <SidebarGroup title="Visão geral">
            {nav('/', 'Dashboard', true, LayoutDashboard)}
          </SidebarGroup>
          <SidebarGroup title="Operação">
            {nav(transactionsTo, 'Transações', false, ArrowLeftRight, !accountId ? { message: 'Selecione uma conta' } : undefined)}
            {nav('/accounts', 'Contas', false, Wallet)}
          </SidebarGroup>
          <SidebarGroup title="Relatórios">
            {nav(transactionsTo, 'Resumo do período', false, FileText, !accountId ? { message: 'Selecione uma conta' } : undefined)}
            {nav(importTo, 'Importar CSV', false, Upload, !accountId ? { message: 'Selecione uma conta' } : undefined)}
          </SidebarGroup>
          <SidebarGroup title="Configurações">
            {nav('/categories', 'Categorias', true, Tags)}
            {nav('/period-config', 'Configurar Período', true, CalendarRange)}
            {nav('/profile', 'Perfil', true, User)}
          </SidebarGroup>
        </nav>

        <div style={footerStyle}>
          {!isMobile && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="sidebar-btn"
              style={sairButtonStyle}
              title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              {!collapsed && <span style={{ marginLeft: '0.5rem' }}>Recolher</span>}
            </button>
          )}
          <button
            type="button"
            onClick={onSair}
            className="sidebar-btn"
            style={sairButtonStyle}
            title="Sair"
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {(!collapsed || isMobile) && <span style={{ marginLeft: '0.5rem' }}>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  zIndex: 99,
  display: 'none',
};
const sidebarStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 100,
  background: 'var(--color-sidebar)',
  color: 'var(--color-text-inverse)',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  transition: 'width 0.2s ease, transform 0.2s ease',
};
const brandStyle: React.CSSProperties = {
  padding: '1.375rem 1.25rem',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};
const brandLinkStyle: React.CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
};
const quickActionsStyle: React.CSSProperties = {
  padding: '0.75rem 0 0',
};
const navStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.875rem 0',
  overflowY: 'auto',
};
const footerStyle: React.CSSProperties = {
  padding: '1.125rem 1rem',
  borderTop: '1px solid rgba(255,255,255,0.08)',
};
const sairButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5625rem 1rem',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.25)',
  color: 'var(--color-text-inverse)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s ease, border-color 0.2s ease',
};
