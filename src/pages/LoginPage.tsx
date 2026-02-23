import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { login, googleStart } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { apiBaseURL, getGoogleClientId, loadRuntimeConfig } from '../api/client';
import { setToken, setUser } from '../storage/authStorage';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement | null, config: { type?: string; theme?: string; size?: string; text?: string }) => void;
        };
      };
    };
  }
}

function saveAuthAndNavigate(data: { token: string; name: string; email: string; authProvider?: string; linkedGoogleEmail?: string | null }) {
  setToken(data.token);
  setUser({
    name: data.name,
    email: data.email,
    authProvider: data.authProvider,
    linkedGoogleEmail: data.linkedGoogleEmail ?? undefined,
  });
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkRequiredModal, setLinkRequiredModal] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleClientId, setGoogleClientId] = useState(getGoogleClientId);

  const handleGoogleCredential = useCallback((credential: string) => {
    setError(null);
    setLoading(true);
    googleStart(credential)
      .then((res) => {
        const d = res.data;
        if (d.status === 'EXISTING_USER' && d.auth) {
          saveAuthAndNavigate({
            token: d.auth.token,
            name: d.auth.name,
            email: d.auth.email,
            authProvider: d.auth.authProvider,
            linkedGoogleEmail: d.auth.linkedGoogleEmail,
          });
          const accountId = localStorage.getItem('masd_caixa_account_id');
          navigate(accountId ? '/' : '/accounts');
          return;
        }
        if (d.status === 'LINK_REQUIRED') {
          setLinkRequiredModal(true);
          return;
        }
        if (d.status === 'NEEDS_COMPANY' && d.tempToken) {
          navigate('/complete-signup', {
            state: { tempToken: d.tempToken, email: d.email ?? '', name: d.name ?? '' },
          });
          return;
        }
        setError('Resposta inesperada. Tente novamente.');
      })
      .catch((err: unknown) => {
        setError(getApiErrorMessage(err, 'Não foi possível entrar com Google.', apiBaseURL));
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Produção: carregar config.js dinamicamente (Docker injeta em runtime)
  useEffect(() => {
    loadRuntimeConfig().then(() => setGoogleClientId(getGoogleClientId()));
    const t1 = setTimeout(() => setGoogleClientId(getGoogleClientId()), 500);
    const t2 = setTimeout(() => setGoogleClientId(getGoogleClientId()), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (!googleClientId || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (r) => handleGoogleCredential(r.credential),
    });
    if (googleButtonRef.current) {
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
      });
    }
  }, [googleClientId, handleGoogleCredential]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      const d = res.data;
      saveAuthAndNavigate({
        token: d.token,
        name: d.name,
        email: d.email,
        authProvider: d.authProvider,
        linkedGoogleEmail: d.linkedGoogleEmail,
      });
      const accountId = localStorage.getItem('masd_caixa_account_id');
      navigate(accountId ? '/' : '/accounts');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'E-mail ou senha inválidos.', apiBaseURL));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo variant="horizontal" inverse />
        <Link to="/register" className="auth-header-link">Criar conta</Link>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <div className="login-logo-wrap">
            <Logo variant="square" size="large" />
          </div>
          <div className="page-header">
            <h2 className="page-title">Entrar</h2>
            <p className="page-subtitle">
              Use seu e-mail e senha para acessar.
            </p>
          </div>
          <div className="card">
            {error && <div className="error-box">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label" htmlFor="login-email">E-mail</label>
                <input
                  id="login-email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="login-password">Senha</label>
                <input
                  id="login-password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
              <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.875rem' }}>
                <Link to="/forgot-password">Esqueci minha senha</Link>
              </p>
            </form>
            {googleClientId && (
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  ou
                </span>
                <div ref={googleButtonRef} />
              </div>
            )}
          </div>
          <p className="auth-footer-text">
            Não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </div>
      </main>

      {linkRequiredModal && (
        <div
          className="card"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            maxWidth: '360px',
            padding: '1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <p style={{ margin: 0, color: 'var(--color-text)' }}>
            Este e-mail já possui conta. Faça login com senha para vincular.
          </p>
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setLinkRequiredModal(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setLinkRequiredModal(false)}
            >
              Ir para login
            </button>
          </div>
        </div>
      )}
      {linkRequiredModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 999,
          }}
          onClick={() => setLinkRequiredModal(false)}
          aria-hidden
        />
      )}
    </div>
  );
}
