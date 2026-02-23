import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { resetPassword } from '../api/masdApi';

const MIN_PASSWORD_LENGTH = 8;

function computePasswordStrength(password: string): { points: number; label: 'Fraca' | 'Média' | 'Forte' } {
  if (!password) return { points: 0, label: 'Fraca' };
  let points = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) points += 1;
  if (/[A-Za-z]/.test(password)) points += 1;
  if (/[0-9]/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;
  const label = points <= 1 ? 'Fraca' : points <= 3 ? 'Média' : 'Forte';
  return { points, label };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const { points, label } = useMemo(() => computePasswordStrength(password), [password]);
  if (!password) return null;
  const level = points <= 1 ? 1 : points <= 3 ? 2 : 3;
  const labelColor = points <= 1 ? 'var(--color-danger, #b91c1c)' : points <= 3 ? 'var(--color-warning, #b45309)' : 'var(--color-success, #15803d)';
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            gap: '2px',
            flex: '1',
            minWidth: '80px',
            maxWidth: '120px',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= level ? labelColor : 'var(--color-border)',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ newPassword?: string; confirm?: string }>({});

  function validate(): boolean {
    const err: { newPassword?: string; confirm?: string } = {};
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      err.newPassword = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (newPassword !== confirmPassword) {
      err.confirm = 'As senhas não coincidem.';
    }
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400 || status === 401) {
        setError('Link expirado ou inválido. Solicite um novo.');
      } else {
        setError('Não foi possível redefinir a senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <header className="auth-header">
          <Logo variant="horizontal" inverse />
          <Link to="/login" className="auth-header-link">Entrar</Link>
        </header>
        <main className="auth-main">
          <div className="auth-card">
            <div className="page-header">
              <h2 className="page-title">Redefinir senha</h2>
              <p className="page-subtitle">Token inválido.</p>
            </div>
            <div className="card">
              <p style={{ margin: 0, color: 'var(--color-text)' }}>
                O link está incompleto ou inválido. Solicite um novo link de redefinição.
              </p>
              <p style={{ marginTop: '1rem', marginBottom: 0 }}>
                <Link to="/forgot-password" className="btn btn-primary" style={{ display: 'inline-block' }}>
                  Solicitar novo link
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <header className="auth-header">
          <Logo variant="horizontal" inverse />
          <Link to="/login" className="auth-header-link">Entrar</Link>
        </header>
        <main className="auth-main">
          <div className="auth-card">
            <div className="page-header">
              <h2 className="page-title">Senha redefinida</h2>
            </div>
            <div className="card">
              <p style={{ margin: 0, color: 'var(--color-text)' }}>
                Senha redefinida com sucesso. Faça login.
              </p>
              <p style={{ marginTop: '1rem', marginBottom: 0 }}>
                <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
                  Ir para login
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo variant="horizontal" inverse />
        <Link to="/login" className="auth-header-link">Entrar</Link>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <div className="page-header">
            <h2 className="page-title">Redefinir senha</h2>
            <p className="page-subtitle">
              Informe sua nova senha (mínimo 8 caracteres).
            </p>
          </div>
          <div className="card">
            {error && <div className="error-box">{error}</div>}
            {error && (
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <Link to="/forgot-password">Solicitar novo link</Link>
              </p>
            )}
            <form onSubmit={handleSubmit} style={{ marginTop: error ? '1rem' : 0 }}>
              <div className="form-group">
                <label className="label" htmlFor="reset-new">Nova senha</label>
                <input
                  id="reset-new"
                  type="password"
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <PasswordStrengthIndicator password={newPassword} />
                {fieldErrors.newPassword && (
                  <span className="error-box" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {fieldErrors.newPassword}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="label" htmlFor="reset-confirm">Confirmar senha</label>
                <input
                  id="reset-confirm"
                  type="password"
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                />
                {fieldErrors.confirm && (
                  <span className="error-box" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {fieldErrors.confirm}
                  </span>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
            </form>
          </div>
          <p className="auth-footer-text">
            <Link to="/login">Voltar para login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
