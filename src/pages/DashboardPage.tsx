import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, type TooltipItem } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { getAccountId } from '../storage/accountStorage';
import { getDashboard, getCategoryAnalytics } from '../api/masdApi';
import { StatCard } from '../components/StatCard';
import { AlertBanner } from '../components/AlertBanner';
import type { CategoryAnalyticsDTO } from '../types/dto';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function last30Days(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function DashboardPage() {
  const accountId = getAccountId();
  const [dashboard, setDashboard] = useState<{
    currentBalance: number;
    projectedBalance30Days: number;
    avgDailyIncomeLast30Days: number;
    avgDailyExpenseLast30Days: number;
    alert: string | null;
  } | null>(null);
  const [expenseByCategory, setExpenseByCategory] = useState<CategoryAnalyticsDTO[]>([]);
  const [incomeByCategory, setIncomeByCategory] = useState<CategoryAnalyticsDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { from, to } = last30Days();

  useEffect(() => {
    if (!accountId) return;
    Promise.all([
      getDashboard(accountId),
      getCategoryAnalytics(accountId, { from, to, type: 'EXPENSE' }),
      getCategoryAnalytics(accountId, { from, to, type: 'INCOME' }),
    ])
      .then(([dashRes, expRes, incRes]) => {
        setDashboard(dashRes.data);
        setExpenseByCategory(expRes.data);
        setIncomeByCategory(incRes.data);
      })
      .catch(() => setError('Erro ao carregar dashboard.'))
      .finally(() => setLoading(false));
  }, [accountId, from, to]);

  if (!accountId) return null;
  if (loading) return <div className="card">Carregando...</div>;
  if (error) return <div className="error-box">{error}</div>;
  if (!dashboard) return null;

  const format = (n: number) => Number(n).toFixed(2);

  const pieData = {
    labels: expenseByCategory.map((c) => c.name),
    datasets: [
      {
        data: expenseByCategory.map((c) => c.totalAmount),
        backgroundColor: expenseByCategory.map((c) => c.color),
        borderWidth: 1,
      },
    ],
  };

  const allCategoryNames = Array.from(
    new Set([...incomeByCategory.map((c) => c.name), ...expenseByCategory.map((c) => c.name)])
  );
  const incomeMap = new Map(incomeByCategory.map((c) => [c.name, c.totalAmount]));
  const expenseMap = new Map(expenseByCategory.map((c) => [c.name, c.totalAmount]));

  const barData = {
    labels: allCategoryNames.length > 0 ? allCategoryNames : ['Sem dados'],
    datasets: [
      {
        label: 'Receita',
        data: allCategoryNames.map((name) => incomeMap.get(name) ?? 0),
        backgroundColor: 'rgba(5, 150, 105, 0.8)',
      },
      {
        label: 'Despesa',
        data: allCategoryNames.map((name) => expenseMap.get(name) ?? 0),
        backgroundColor: 'rgba(185, 28, 28, 0.8)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => formatCurrency(Number(ctx.raw)),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => formatCurrency(Number(value)),
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' as const },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'pie'>) => {
            const raw = Number(ctx.raw);
            const data = (ctx.chart?.data?.datasets?.[0]?.data ?? []) as number[];
            const total = data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((raw / total) * 100).toFixed(1) : '0';
            return `${ctx.label}: ${formatCurrency(raw)} (${pct}%)`;
          },
        },
      },
    },
  };

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
      <Link to="/transactions/new" className="btn btn-primary" style={{ marginBottom: '1.5rem' }}>
        Nova Transação
      </Link>

      <div style={styles.chartsGrid}>
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Despesas por categoria (30 dias)</h3>
          {expenseByCategory.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Sem dados no período.</p>
          ) : (
            <div style={styles.chartWrap}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          )}
        </div>
        <div className="card" style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Receita x Despesa por categoria (30 dias)</h3>
          {allCategoryNames.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Sem dados no período.</p>
          ) : (
            <div style={styles.chartWrap}>
              <Bar data={barData} options={barOptions} />
            </div>
          )}
        </div>
      </div>
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
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  chartCard: {
    padding: '1.25rem',
  },
  chartTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: 600,
  },
  chartWrap: {
    position: 'relative',
    maxHeight: 320,
  },
};
