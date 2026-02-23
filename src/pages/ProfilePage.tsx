import { useState, useEffect, useRef, useCallback } from 'react';
import { getUser, setUser, setToken } from '../storage/authStorage';
import { googleLink } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { apiBaseURL, getGoogleClientId, fetchGoogleClientIdFromApi } from '../api/client';

export function ProfilePage() {
  const stored = getUser();
  const [name, setName] = useState(stored?.name ?? '');
  const [email, setEmail] = useState(stored?.email ?? '');
  const [saved, setSaved] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const googleLinkButtonRef = useRef<HTMLDivElement>(null);
  const [googleClientId, setGoogleClientId] = useState(() => getGoogleClientId());

  useEffect(() => {
    if (googleClientId) return;
    fetchGoogleClientIdFromApi().then((id) => id && setGoogleClientId(getGoogleClientId()));
  }, [googleClientId]);

  const authProvider = stored?.authProvider ?? 'LOCAL';
  const linkedGoogleEmail = stored?.linkedGoogleEmail;
  const isGoogleLinked = authProvider === 'LOCAL_GOOGLE' || authProvider === 'GOOGLE';

  useEffect(() => {
    const u = getUser();
    if (u) {
      setName(u.name);
      setEmail(u.email);
    }
  }, []);

  const handleGoogleCredential = useCallback((credential: string) => {
    setLinkError(null);
    setLinkSuccess(false);
    setLinkLoading(true);
    googleLink(credential)
      .then((res) => {
        const d = res.data;
        setToken(d.token);
        setUser({
          name: stored?.name ?? d.name,
          email: stored?.email ?? d.email,
          authProvider: d.authProvider,
          linkedGoogleEmail: d.linkedGoogleEmail ?? undefined,
        });
        setLinkSuccess(true);
        setTimeout(() => setLinkSuccess(false), 4000);
      })
      .catch((err: unknown) => {
        setLinkError(getApiErrorMessage(err, 'Não foi possível vincular.', apiBaseURL));
      })
      .finally(() => setLinkLoading(false));
  }, [stored?.name, stored?.email]);

  useEffect(() => {
    if (!googleClientId || !window.google?.accounts?.id || isGoogleLinked) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (r) => handleGoogleCredential(r.credential),
    });
    if (googleLinkButtonRef.current) {
      window.google.accounts.id.renderButton(googleLinkButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
      });
    }
  }, [googleClientId, isGoogleLinked, handleGoogleCredential]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUser({ name: name.trim(), email: email.trim(), authProvider: stored?.authProvider, linkedGoogleEmail: stored?.linkedGoogleEmail });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Meu perfil</h2>
        <p className="page-subtitle">
          Estes dados são exibidos no sistema. A alteração de e-mail/senha no servidor estará disponível em breve.
        </p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Nome</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div className="form-group">
            <label className="label">E-mail</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary">
              Salvar alterações
            </button>
            {saved && (
              <span style={{ color: 'var(--color-success)', fontSize: '0.875rem' }}>
                Salvo com sucesso.
              </span>
            )}
          </div>
        </form>
        <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          As alterações são salvas apenas neste navegador. Quando a API de perfil estiver disponível, o e-mail e a senha poderão ser atualizados no servidor.
        </p>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>Conta Google</h3>
        {isGoogleLinked ? (
          <p style={{ margin: 0, color: 'var(--color-text)' }}>
            Conectado com Google: <strong>{linkedGoogleEmail || email}</strong>
          </p>
        ) : googleClientId ? (
          <>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Vincule sua conta Google para poder entrar com ela depois.
            </p>
            {linkError && <div className="error-box" style={{ marginBottom: '0.75rem' }}>{linkError}</div>}
            {linkSuccess && (
              <p style={{ margin: '0 0 0.75rem 0', color: 'var(--color-success)', fontSize: '0.875rem' }}>
                Conta Google vinculada com sucesso.
              </p>
            )}
            <div ref={googleLinkButtonRef} />
            {linkLoading && (
              <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Conectando...
              </p>
            )}
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Configure GOOGLE_CLIENT_ID para habilitar login com Google.
          </p>
        )}
      </div>
    </div>
  );
}
