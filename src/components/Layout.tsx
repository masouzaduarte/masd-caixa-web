import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { getToken, clearToken, clearUser, getUser } from '../storage/authStorage';
import { clearAccountId } from '../storage/accountStorage';

const sidebarLinks = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/accounts', label: 'Contas', end: false },
  { to: '/transactions/new', label: 'Nova Transação', end: true },
  { to: '/setup', label: 'Nova conta', end: true },
  { to: '/profile', label: 'Perfil', end: true },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!getToken();
  const user = getUser();

  function handleSair() {
    clearAccountId();
    clearToken();
    clearUser();
    navigate('/login');
  }

  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>MASD Caixa</h1>
        </header>
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div style={styles.appLayout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <Link to="/" style={styles.sidebarBrandLink}>MASD Caixa</Link>
        </div>
        <nav style={styles.sidebarNav}>
          {sidebarLinks.map(({ to, label, end }) => {
            const isActive = end
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                style={{
                  ...styles.sidebarLink,
                  ...(isActive ? styles.sidebarLinkActive : {}),
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div style={styles.sidebarFooter}>
          <button type="button" onClick={handleSair} style={styles.sidebarButton}>
            Sair
          </button>
        </div>
      </aside>
      <div style={styles.mainWrap}>
        <header style={styles.topbar}>
          <span style={styles.topbarTitle}>
            {location.pathname === '/' && 'Dashboard'}
            {location.pathname.startsWith('/accounts') && 'Contas'}
            {location.pathname === '/transactions/new' && 'Nova Transação'}
            {location.pathname === '/setup' && 'Nova conta'}
            {location.pathname === '/profile' && 'Perfil'}
            {location.pathname.match(/^\/accounts\/[^/]+$/) && 'Transações da conta'}
          </span>
          <div style={styles.userBlock}>
            <span style={styles.userName}>{user?.name ?? user?.email ?? 'Usuário'}</span>
            <button type="button" onClick={handleSair} style={styles.topbarSair}>
              Sair
            </button>
          </div>
        </header>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appLayout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--color-bg)',
  },
  sidebar: {
    width: 'var(--sidebar-width)',
    flexShrink: 0,
    background: 'var(--color-sidebar)',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebarBrand: {
    padding: '1.25rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  sidebarBrandLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: 600,
  },
  sidebarNav: {
    flex: 1,
    padding: '0.75rem 0',
    overflowY: 'auto',
  },
  sidebarLink: {
    display: 'block',
    padding: '0.6rem 1rem',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'background 0.15s, color 0.15s',
  },
  sidebarLinkActive: {
    background: 'var(--color-sidebar-hover)',
    color: '#fff',
  },
  sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  sidebarButton: {
    width: '100%',
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#e2e8f0',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  mainWrap: {
    flex: 1,
    marginLeft: 'var(--sidebar-width)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  topbar: {
    background: 'var(--color-surface)',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-sm)',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  topbarTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  userBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
  topbarSair: {
    padding: '0.35rem 0.75rem',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  content: {
    flex: 1,
    padding: '1.5rem',
    maxWidth: '1000px',
    width: '100%',
    margin: '0 auto',
    alignSelf: 'center',
  },
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
  },
  header: {
    backgroundColor: 'var(--color-sidebar)',
    color: '#fff',
    padding: '1rem 1.5rem',
  },
  title: { margin: 0, fontSize: '1.5rem' },
  main: {
    padding: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
};
