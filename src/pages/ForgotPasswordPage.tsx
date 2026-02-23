import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { forgotPassword } from '../api/masdApi';

const COOLDOWN_KEY = 'masd_caixa_forgot_cooldown_until';
const COOLDOWN_SECONDS = 60;

function getCooldownRemaining(): number {
  try {
    const until = localStorage.getItem(COOLDOWN_KEY);
    if (!until) return 0;
    const remaining = Number(until) - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  } catch {
    return 0;
  }
}

function setCooldownUntil(ms: number): void {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(ms));
  } catch {
    // ignore
  }
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(() => getCooldownRemaining());

  useEffect(() => {
    setCooldownRemaining(getCooldownRemaining());
  }, []);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const t = setInterval(() => {
      const next = getCooldownRemaining();
      setCooldownRemaining(next);
      if (next <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownRemaining]);

  function startCooldown() {
    const until = Date.now() + COOLDOWN_SECONDS * 1000;
    setCooldownUntil(until);
    setCooldownRemaining(COOLDOWN_SECONDS);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (honeypot.trim() !== '') {
      setSuccess(true);
      startCooldown();
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSuccess(true);
      startCooldown();
    } catch {
      setError('Não foi possível enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldownRemaining > 0 || !email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      startCooldown();
    } catch {
      setError('Não foi possível reenviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const inCooldown = cooldownRemaining > 0;
  const showSuccessBlock = success || inCooldown;

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo variant="horizontal" inverse />
        <Link to="/login" className="auth-header-link">Entrar</Link>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <div className="page-header">
            <h2 className="page-title">Recuperar senha</h2>
            <p className="page-subtitle">
              Informe seu e-mail. Se ele existir, enviaremos um link para redefinir sua senha.
            </p>
          </div>
          <div className="card">
            {showSuccessBlock ? (
              <>
                <p style={{ margin: 0, color: 'var(--color-text)' }}>
                  Se o e-mail existir, você receberá um link em instantes.
                </p>
                <p style={{ marginTop: '1rem', marginBottom: 0 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={inCooldown || loading || !email.trim()}
                    onClick={handleResend}
                  >
                    {loading
                      ? 'Enviando...'
                      : inCooldown
                        ? `Reenviar em ${cooldownRemaining}s`
                        : 'Reenviar link'}
                  </button>
                </p>
              </>
            ) : (
              <>
                {error && <div className="error-box">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div
                    className="form-group"
                    style={{ display: 'none' }}
                    aria-hidden="true"
                  >
                    <label className="label" htmlFor="forgot-website">Website</label>
                    <input
                      id="forgot-website"
                      type="text"
                      name="website"
                      className="input"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="forgot-email">E-mail</label>
                    <input
                      id="forgot-email"
                      type="email"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Enviando...' : 'Enviar link'}
                  </button>
                </form>
              </>
            )}
          </div>
          <p className="auth-footer-text">
            <Link to="/login">Voltar para login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
