import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccountId } from '../storage/accountStorage';
import { getDashboard } from '../api/masdApi';
import { StatCard } from '../components/StatCard';
import { AlertBanner } from '../components/AlertBanner';

export function DashboardPage() {
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
    if (!accountId) return;
    getDashboard(accountId)
      .then((res) => setDashboard(res.data))
      .catch(() => setError('Erro ao carregar dashboard.'))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (!accountId) return null;
  if (loading) return <div className="card">Carregando...</div>;
  if (error) return <div className="error-box">{error}</div>;
  if (!dashboard) return null;

  const format = (n: number) => Number(n).toFixed(2);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Visão geral da conta em uso. Troque em <Link to="/accounts" style={{ color: 'var(--color-primary)' }}>Contas</Link>.
        </p>
      </div>
      {dashboard.alert != null && <AlertBanner message={dashboard.alert} />}
      <div style={styles.grid}>
        <StatCard label="Saldo atual" value={format(dashboard.currentBalance)} />
        <StatCard label="Saldo projetado (30 dias)" value={format(dashboard.projectedBalance30Days)} />
        <StatCard label="Média receita/dia (30 dias)" value={format(dashboard.avgDailyIncomeLast30Days)} />
        <StatCard label="Média despesa/dia (30 dias)" value={format(dashboard.avgDailyExpenseLast30Days)} />
      </div>
      <Link to="/transactions/new" className="btn btn-primary">
        Nova Transação
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
};
