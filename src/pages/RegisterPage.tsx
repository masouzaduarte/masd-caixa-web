import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { apiBaseURL } from '../api/client';
import { setToken, setUser } from '../storage/authStorage';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await register({ name, companyName, email, password });
      setToken(res.data.token);
      setUser({ name: res.data.name, email: res.data.email });
      navigate('/setup');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao criar conta.', apiBaseURL));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.appTitle}>MASD Caixa</h1>
        <Link to="/login" style={styles.headerLink}>Entrar</Link>
      </header>
      <main style={styles.main}>
        <div style={styles.container}>
          <h2 style={styles.title}>Criar conta</h2>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label>Nome da empresa</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label>Senha (mín. 6 caracteres)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} style={styles.submit}>
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>
          <p style={styles.footer}>
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
  },
  header: {
    backgroundColor: 'var(--color-sidebar)',
    color: '#fff',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: { margin: 0, fontSize: '1.5rem' },
  headerLink: { color: '#fff', textDecoration: 'none' },
  main: {
    padding: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  container: { maxWidth: '400px' },
  title: { marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' },
  submit: {
    padding: '0.6rem 1rem',
    backgroundColor: '#2c3e50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    color: '#721c24',
    marginBottom: '1rem',
  },
  footer: { marginTop: '1rem' },
};
