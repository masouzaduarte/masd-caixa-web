import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listAccounts, getBalance } from '../api/masdApi';
import { setAccountId } from '../storage/accountStorage';
import { getAccountId } from '../storage/accountStorage';
import type { AccountResponse } from '../types/dto';

export function AccountsPage() {
  const navigate = useNavigate();
  const currentId = getAccountId();
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              balancesMap[a.id] = r.data.balance;
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

  if (loading) return <div className="card">Carregando contas...</div>;
  if (error) return <div className="error-box">{error}</div>;

  return (
    <div>
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
          <ul style={styles.list}>
            {accounts.map((acc) => (
              <li key={acc.id} style={styles.row}>
                <div style={styles.rowMain}>
                  <span style={styles.accountName}>{acc.name}</span>
                  <span style={styles.balance}>
                    R$ {Number(balances[acc.id] ?? 0).toFixed(2)}
                  </span>
                </div>
                <div style={styles.actions}>
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
                    to={`/accounts/${acc.id}`}
                    className="btn btn-secondary"
                    style={styles.btnSmall}
                  >
                    Ver transações
                  </Link>
                </div>
              </li>
            ))}
          </ul>
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
};
