import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getToken, clearToken, clearUser, getUser } from '../storage/authStorage';
import { clearAccountId, getAccountId } from '../storage/accountStorage';
import { Logo } from './Logo';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const STORAGE_KEY_COLLAPSED = 'masd_caixa_sidebar_collapsed';
const BREAKPOINT = 1024;

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/accounts') return 'Contas';
  if (pathname.match(/^\/accounts\/[^/]+\/transactions$/)) return 'Extrato';
  if (pathname.match(/^\/accounts\/[^/]+\/import$/)) return 'Importar CSV';
  if (pathname === '/transactions/new') return 'Nova Transação';
  if (pathname === '/setup') return 'Nova conta';
  if (pathname === '/profile') return 'Perfil';
  if (pathname === '/period-config') return 'Configurar Período';
  if (pathname === '/categories') return 'Categorias';
  return 'MASD Caixa';
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < BREAKPOINT : false
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    const handler = () => setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function useSidebarCollapsed(): [boolean, (value: boolean) => void] {
  const [collapsed, setCollapsedState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_COLLAPSED) === 'true';
    } catch {
      return false;
    }
  });
  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, String(value));
    } catch {
      // ignore
    }
  };
  return [collapsed, setCollapsed];
}

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!getToken();
  const user = getUser();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarCollapsed();
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const accountId = getAccountId();

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
          <Logo variant="horizontal" inverse />
        </header>
        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    );
  }

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)');

  return (
    <div style={styles.appLayout}>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={sidebarMobileOpen}
        isMobile={isMobile}
        onClose={() => setSidebarMobileOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        accountId={accountId}
        onSair={handleSair}
      />
      <div style={{ ...styles.mainWrap, marginLeft: sidebarWidth }}>
        <Header
          onMenuClick={() => setSidebarMobileOpen(true)}
          title={getPageTitle(location.pathname)}
          userName={user?.name ?? user?.email ?? 'Usuário'}
          onSair={handleSair}
          showMenuButton={isMobile}
        />
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
  mainWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    transition: 'margin-left 0.2s ease',
  },
  content: {
    flex: 1,
    padding: '1.75rem',
    maxWidth: '1024px',
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
    padding: '1.125rem 1.75rem',
    display: 'flex',
    alignItems: 'center',
  },
  main: {
    padding: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
};
