import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { listAccounts, getBalance, updateAccount } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { apiBaseURL } from '../api/client';
import { setAccountId } from '../storage/accountStorage';
import { getAccountId } from '../storage/accountStorage';
import type { AccountResponse } from '../types/dto';

export function AccountsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentId = getAccountId();
  const selectMessage = (location.state as { message?: string } | null)?.message;
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listAccounts()
      .then((res) => {
        setAccounts(res.data);
        return res.data;
      })
      .then((list) => {
        const balancesMap: Record<string, number> = {};
        Promise.all(
          list.map((a) =>
            getBalance(a.id).then((r) => {
              balancesMap[a.id] = r.data.currentBalance;
            })
          )
        ).then(() => setBalances(balancesMap));
      })
      .catch(() => setError('Erro ao carregar contas.'))
      .finally(() => setLoading(false));
  }, []);

  function handleUsarConta(accountId: string) {
    setAccountId(accountId);
    navigate('/');
  }

  function startEdit(acc: AccountResponse) {
    setEditingId(acc.id);
    setEditingName(acc.name);
    setSaveError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
    setSaveError(null);
  }

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editingName.trim()) return;
    setSaving(true);
    setSaveError(null);
    updateAccount(editingId, { name: editingName.trim() })
      .then((res) => {
        setAccounts((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, name: res.data.name } : a))
        );
        cancelEdit();
      })
      .catch((err) => setSaveError(getApiErrorMessage(err, 'Erro ao salvar nome.', apiBaseURL)))
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="card">Carregando contas...</div>;
  if (error) return <div className="error-box">{error}</div>;

  return (
    <div>
      {selectMessage && (
        <div className="card" style={{ marginBottom: '1rem', background: 'var(--color-warning-bg)', borderColor: 'var(--color-warning-border)' }}>
          {selectMessage}
        </div>
      )}
      <div className="page-header">
        <h2 className="page-title">Minhas contas</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Selecione uma conta para usar no dashboard ou veja as transações.
        </p>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {accounts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Nenhuma conta cadastrada.{' '}
            <Link to="/setup">Criar primeira conta</Link>
          </div>
        ) : (
          <>
          <ul style={styles.list}>
            {accounts.map((acc) => (
              <li key={acc.id} style={styles.row}>
                <div style={styles.rowMain}>
                  {editingId === acc.id ? (
                    <form onSubmit={handleSaveName} style={styles.editForm}>
                      <input
                        type="text"
                        className="input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        required
                        maxLength={100}
                        style={styles.editInput}
                        autoFocus
                      />
                      <button type="submit" className="btn btn-primary" style={styles.btnSmall} disabled={saving}>
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button type="button" className="btn btn-secondary" style={styles.btnSmall} onClick={cancelEdit} disabled={saving}>
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <>
                      <span style={styles.accountName}>{acc.name}</span>
                      <span style={styles.balance}>
                        R$ {Number(balances[acc.id] ?? 0).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
                {editingId !== acc.id && (
                  <div style={styles.actions}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={styles.btnSmall}
                      onClick={() => startEdit(acc)}
                      title="Alterar nome da conta"
                    >
                      Editar
                    </button>
                    {currentId === acc.id ? (
                      <span style={styles.badge}>Em uso</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={styles.btnSmall}
                        onClick={() => handleUsarConta(acc.id)}
                      >
                        Usar esta conta
                      </button>
                    )}
                    <Link
                      to={`/accounts/${acc.id}/transactions`}
                      className="btn btn-secondary"
                      style={styles.btnSmall}
                    >
                      Ver transações
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {saveError && <div className="error-box" style={{ marginTop: '1rem' }}>{saveError}</div>}
          </>
        )}
      </div>
      <Link to="/setup" className="btn btn-primary">
        + Nova conta
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--color-border)',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  rowMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  accountName: { fontWeight: 500, fontSize: '1rem' },
  balance: { color: 'var(--color-text-muted)', fontSize: '0.9rem' },
  actions: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  btnSmall: { padding: '0.35rem 0.75rem', fontSize: '0.8rem' },
  badge: {
    fontSize: '0.75rem',
    color: 'var(--color-success)',
    fontWeight: 500,
  },
  editForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  editInput: {
    maxWidth: '220px',
    minWidth: '120px',
  },
};
