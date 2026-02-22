import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTransactions, getBalance, listAccounts } from '../api/masdApi';
import type { TransactionListItemResponse } from '../types/dto';

export function AccountTransactionsPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const [transactions, setTransactions] = useState<TransactionListItemResponse[]>([]);
  const [accountName, setAccountName] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const from = new Date(now.getFullYear() - 2, 0, 1).toISOString().slice(0, 10);
    Promise.all([
      getTransactions(accountId, { from, to, size: 500 }),
      getBalance(accountId),
      listAccounts().then((r) => r.data.find((a) => a.id === accountId)),
    ])
      .then(([txRes, balanceRes, account]) => {
        setTransactions(txRes.data.items);
        setBalance(balanceRes.data.currentBalance);
        setAccountName(account?.name ?? 'Conta');
      })
      .catch(() => setError('Erro ao carregar transações.'))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (!accountId) return null;
  if (loading) return <div className="card">Carregando...</div>;
  if (error) return <div className="error-box">{error}</div>;

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );

  return (
    <div>
      <div className="page-header">
        <Link to="/accounts" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'inline-block' }}>
          ← Voltar para Contas
        </Link>
        <h2 className="page-title">{accountName}</h2>
        {balance !== null && (
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Saldo atual: <strong style={{ color: 'var(--color-text)' }}>R$ {Number(balance).toFixed(2)}</strong>
          </p>
        )}
      </div>
      <div className="card">
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Operações</h3>
        {sorted.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Nenhuma transação nesta conta.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Descrição</th>
                  <th style={styles.th}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((tx) => (
                  <tr key={tx.id}>
                    <td style={styles.td}>
                      {new Date(tx.transactionDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        ...(tx.type === 'INCOME' ? styles.badgeIncome : styles.badgeExpense),
                      }}>
                        {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td style={styles.td}>{tx.description || '—'}</td>
                    <td style={{
                      ...styles.td,
                      ...(tx.type === 'INCOME' ? styles.valuePositive : styles.valueNegative),
                    }}>
                      {tx.type === 'INCOME' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Link to="/transactions/new" className="btn btn-primary">
        Nova Transação
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: {
    textAlign: 'left',
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
  },
  td: { padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--color-border)' },
  badge: { padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.75rem' },
  badgeIncome: { background: '#dcfce7', color: '#166534' },
  badgeExpense: { background: '#fee2e2', color: '#b91c1c' },
  valuePositive: { color: 'var(--color-success)', fontWeight: 500 },
  valueNegative: { color: '#b91c1c', fontWeight: 500 },
};
