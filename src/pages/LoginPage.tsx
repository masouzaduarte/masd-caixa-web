import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { apiBaseURL } from '../api/client';
import { setToken, setUser } from '../storage/authStorage';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      setToken(res.data.token);
      setUser({ name: res.data.name, email: res.data.email });
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
        <h1 className="auth-header-title">MASD Caixa</h1>
        <Link to="/register" className="auth-header-link">Criar conta</Link>
      </header>
      <main className="auth-main">
        <div className="auth-card">
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
            </form>
          </div>
          <p className="auth-footer-text">
            Não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
