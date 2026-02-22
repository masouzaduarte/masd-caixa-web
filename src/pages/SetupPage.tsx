import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createAccount } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { apiBaseURL } from '../api/client';
import { setAccountId } from '../storage/accountStorage';
import { getToken } from '../storage/authStorage';

export function SetupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!getToken()) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }
    const balance = parseFloat(initialBalance);
    if (Number.isNaN(balance)) {
      setError('Saldo inicial inválido.');
      return;
    }
    setLoading(true);
    try {
      const res = await createAccount({ name, initialBalance: balance });
      setAccountId(res.data.id);
      navigate('/');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao criar conta.', apiBaseURL));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Nova conta</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Crie uma nova conta para controlar saldo e transações.
        </p>
      </div>
      <div className="card form-card">
        {error && (
          <div className="error-box">
            {error}
            {(error.includes('login') || error.includes('autorizado')) && (
              <p style={{ marginTop: '0.5rem' }}>
                <Link to="/login">Fazer login</Link>
              </p>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-layout-grid">
          <div className="form-group">
            <label className="label">Nome da conta</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
              placeholder="Ex.: Caixa principal"
            />
          </div>
          <div className="form-group">
            <label className="label">Saldo inicial</label>
            <input
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              required
              className="input"
              placeholder="0,00"
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
