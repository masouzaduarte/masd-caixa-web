import { Outlet, Link, useNavigate } from 'react-router-dom';
import { clearAccountId } from '../storage/accountStorage';

export function Layout() {
  const navigate = useNavigate();

  function handleTrocarConta() {
    clearAccountId();
    navigate('/setup');
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>MASD Caixa</h1>
        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>Dashboard</Link>
          <Link to="/transactions/new" style={styles.link}>Nova Transação</Link>
          <Link to="/setup" style={styles.link}>Setup</Link>
          <button type="button" onClick={handleTrocarConta} style={styles.button}>
            Trocar conta
          </button>
        </nav>
      </header>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
  },
  button: {
    padding: '0.4rem 0.8rem',
    backgroundColor: 'transparent',
    border: '1px solid #fff',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  main: {
    padding: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
};
