import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAccountId } from '../storage/accountStorage';
import { getDashboard } from '../api/masdApi';
import { StatCard } from '../components/StatCard';
import { AlertBanner } from '../components/AlertBanner';

export function DashboardPage() {
  const navigate = useNavigate();
  const accountId = getAccountId();
  const [dashboard, setDashboard] = useState<{
    currentBalance: number;
    projectedBalance30Days: number;
    avgDailyIncomeLast30Days: number;
    avgDailyExpenseLast30Days: number;
    alert: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      navigate('/setup');
      return;
    }
    getDashboard(accountId)
      .then((res) => setDashboard(res.data))
      .catch(() => setError('Erro ao carregar dashboard.'))
      .finally(() => setLoading(false));
  }, [accountId, navigate]);

  if (!accountId) return null;
  if (loading) return <div style={styles.loading}>Carregando...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!dashboard) return null;

  const format = (n: number) => Number(n).toFixed(2);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dashboard</h2>
      {dashboard.alert != null && <AlertBanner message={dashboard.alert} />}
      <div style={styles.grid}>
        <StatCard label="Saldo atual" value={format(dashboard.currentBalance)} />
        <StatCard label="Saldo projetado (30 dias)" value={format(dashboard.projectedBalance30Days)} />
        <StatCard label="Média receita/dia (30 dias)" value={format(dashboard.avgDailyIncomeLast30Days)} />
        <StatCard label="Média despesa/dia (30 dias)" value={format(dashboard.avgDailyExpenseLast30Days)} />
      </div>
      <Link to="/transactions/new" style={styles.link}>
        Nova Transação
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {},
  title: { marginBottom: '1rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  link: {
    display: 'inline-block',
    padding: '0.6rem 1rem',
    backgroundColor: '#2c3e50',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
  },
  loading: { padding: '1rem' },
  error: {
    padding: '0.75rem',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    color: '#721c24',
  },
};
