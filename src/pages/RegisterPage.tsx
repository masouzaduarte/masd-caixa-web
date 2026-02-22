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
    <div className="auth-page">
      <header className="auth-header">
        <h1 className="auth-header-title">MASD Caixa</h1>
        <Link to="/login" className="auth-header-link">Entrar</Link>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <div className="page-header">
            <h2 className="page-title">Criar conta</h2>
            <p className="page-subtitle">
              Preencha os dados para começar.
            </p>
          </div>
          <div className="card">
            {error && <div className="error-box">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label" htmlFor="register-name">Nome</label>
                <input
                  id="register-name"
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="register-company">Nome da empresa</label>
                <input
                  id="register-company"
                  type="text"
                  className="input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="register-email">E-mail</label>
                <input
                  id="register-email"
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
                <label className="label" htmlFor="register-password">Senha (mín. 6 caracteres)</label>
                <input
                  id="register-password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Criando...' : 'Criar conta'}
              </button>
            </form>
          </div>
          <p className="auth-footer-text">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
