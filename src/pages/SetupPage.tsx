import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCompany, createAccount } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { setAccountId } from '../storage/accountStorage';

export function SetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'company' | 'account'>('company');
  const [companyId, setCompanyId] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await createCompany({ name, email });
      setCompanyId(res.data.id);
      setStep('account');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao criar empresa.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const balance = parseFloat(initialBalance);
    if (Number.isNaN(balance)) {
      setError('Saldo inicial inválido.');
      return;
    }
    setLoading(true);
    try {
      const res = await createAccount({
        companyId,
        name: accountName,
        initialBalance: balance,
      });
      setAccountId(res.data.id);
      navigate('/');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao criar conta.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Setup</h2>
      {error && <div style={styles.error}>{error}</div>}

      {step === 'company' && (
        <form onSubmit={handleCreateCompany} style={styles.form}>
          <h3 style={styles.subtitle}>1. Criar empresa</h3>
          <div style={styles.field}>
            <label>Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? 'Criando...' : 'Criar empresa'}
          </button>
        </form>
      )}

      {step === 'account' && (
        <form onSubmit={handleCreateAccount} style={styles.form}>
          <h3 style={styles.subtitle}>2. Criar conta</h3>
          <div style={styles.field}>
            <label>Nome da conta</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label>Saldo inicial</label>
            <input
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '400px' },
  title: { marginBottom: '1rem' },
  subtitle: { marginBottom: '0.75rem', fontSize: '1rem' },
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
