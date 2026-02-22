import { useState, useEffect } from 'react';
import { getUser, setUser } from '../storage/authStorage';

export function ProfilePage() {
  const stored = getUser();
  const [name, setName] = useState(stored?.name ?? '');
  const [email, setEmail] = useState(stored?.email ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setName(u.name);
      setEmail(u.email);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUser({ name: name.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Meu perfil</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
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
    </div>
  );
}
