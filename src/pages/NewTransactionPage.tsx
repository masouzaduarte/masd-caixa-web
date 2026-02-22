import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccountId } from '../storage/accountStorage';
import { createTransaction } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function NewTransactionPage() {
  const navigate = useNavigate();
  const accountId = getAccountId();
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) navigate('/setup');
  }, [accountId, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) return;
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      setError('Valor inválido.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createTransaction({
        accountId,
        type,
        description: description.trim() || undefined,
        amount: amt,
        transactionDate,
      });
      navigate('/');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao criar transação.'));
    } finally {
      setLoading(false);
    }
  }

  if (!accountId) return null;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Nova Transação</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label>Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
            style={styles.input}
          >
            <option value="INCOME">Receita</option>
            <option value="EXPENSE">Despesa</option>
          </select>
        </div>
        <div style={styles.field}>
          <label>Descrição</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label>Valor</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label>Data</label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={styles.submit}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '400px' },
  title: { marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' },
  submit: {
    padding: '0.6rem 1rem',
    backgroundColor: '#2c3e50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    color: '#721c24',
    marginBottom: '1rem',
  },
};
