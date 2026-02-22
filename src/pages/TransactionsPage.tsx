import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTransactions, getCurrentPeriod, exportTransactionsCsv, downloadPeriodSummaryPdf, getCategories } from '../api/masdApi';
import { listAccounts } from '../api/masdApi';
import type { TransactionPageResponse, TransactionListItemResponse } from '../types/dto';

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR');
}

type PeriodPreset = '7' | '30' | 'month' | 'custom';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function getPeriodRange(preset: PeriodPreset, customFrom: string, customTo: string): { from: string; to: string } {
  const to = todayISO();
  switch (preset) {
    case '7':
      return { from: addDays(to, -6), to };
    case '30':
      return { from: addDays(to, -29), to };
    case 'month':
      return { from: firstDayOfMonth(), to };
    case 'custom':
      return { from: customFrom || addDays(to, -29), to: customTo || to };
    default:
      return { from: addDays(to, -29), to };
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function TransactionsPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const [accountName, setAccountName] = useState<string>('');
  const [preset, setPreset] = useState<PeriodPreset>('30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<'INCOME' | 'EXPENSE' | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [size] = useState(20);
  const [data, setData] = useState<TransactionPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriodLabel, setCurrentPeriodLabel] = useState<{ startDate: string; endDate: string; label: string } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!actionsOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actionsOpen]);

  const fetchData = useCallback(() => {
    if (!accountId) return;
    const { from, to } = getPeriodRange(preset, customFrom, customTo);
    if (new Date(from) > new Date(to)) {
      setError('Período inválido: data inicial não pode ser maior que a final.');
      return;
    }
    setError(null);
    setLoading(true);
    getTransactions(accountId, {
      from,
      to,
      type: typeFilter || undefined,
      q: q.trim() || undefined,
      categoryId: categoryFilter || undefined,
      page,
      size,
    })
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar extrato.'))
      .finally(() => setLoading(false));
  }, [accountId, preset, customFrom, customTo, typeFilter, categoryFilter, q, page, size]);

  useEffect(() => {
    if (!accountId) return;
    listAccounts()
      .then((r) => r.data.find((a) => a.id === accountId))
      .then((acc) => setAccountName(acc?.name ?? 'Conta'));
  }, [accountId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setCurrentPeriodLabel(null);
    setError(null);
    setLoading(true);
    if (!accountId) return;
    const { from, to } = getPeriodRange(preset, customFrom, customTo);
    if (new Date(from) > new Date(to)) {
      setError('Período inválido: data inicial não pode ser maior que a final.');
      setLoading(false);
      return;
    }
    getTransactions(accountId, {
      from,
      to,
      type: typeFilter || undefined,
      q: q.trim() || undefined,
      categoryId: categoryFilter || undefined,
      page: 0,
      size,
    })
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao carregar extrato.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.map((c) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  }, []);

  function handleExportCsv() {
    if (!accountId) return;
    const { from, to } = getPeriodRange(preset, customFrom, customTo);
    if (new Date(from) > new Date(to)) {
      setError('Período inválido para exportar.');
      return;
    }
    setError(null);
    exportTransactionsCsv(accountId, {
      from,
      to,
      type: typeFilter || undefined,
      q: q.trim() || undefined,
      categoryId: categoryFilter || undefined,
    })
      .then((res) => {
        const blob = res.data;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extrato-${accountId}-${from}-${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => setError('Erro ao exportar CSV.'));
  }

  function handleDownloadPdf() {
    if (!accountId) return;
    setError(null);
    setPdfLoading(true);
    const { from, to } = getPeriodRange(preset, customFrom, customTo);
    downloadPeriodSummaryPdf(accountId, { from, to })
      .then(() => {})
      .catch(() => setError('Falha ao gerar PDF'))
      .finally(() => setPdfLoading(false));
  }

  function handleUseCurrentPeriod() {
    if (!accountId) return;
    setError(null);
    setLoading(true);
    getCurrentPeriod(accountId)
      .then((res) => {
        const { startDate, endDate, label } = res.data;
        setPreset('custom');
        setCustomFrom(startDate);
        setCustomTo(endDate);
        setCurrentPeriodLabel({ startDate, endDate, label });
        setPage(0);
        return getTransactions(accountId, {
          from: startDate,
          to: endDate,
          type: typeFilter || undefined,
          q: q.trim() || undefined,
          page: 0,
          size,
        });
      })
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao obter período atual.'))
      .finally(() => setLoading(false));
  }

  if (!accountId) return null;

  return (
    <div>
      <div className="page-header">
        <Link to="/accounts" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'inline-block' }}>
          ← Voltar para Contas
        </Link>
        <h2 className="page-title">Extrato – {accountName}</h2>
        <p className="page-subtitle">
          Filtre por período, tipo e descrição.
        </p>
      </div>

      <div className="card form-card">
        <form onSubmit={handleFilter} className="form-layout-grid">
          <div className="form-group form-group-full">
            <label className="label">Período</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              {(['7', '30', 'month', 'custom'] as const).map((p) => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="period"
                    checked={preset === p}
                    onChange={() => setPreset(p)}
                  />
                  <span>
                    {p === '7' && 'Últimos 7 dias'}
                    {p === '30' && 'Últimos 30 dias'}
                    {p === 'month' && 'Mês atual'}
                    {p === 'custom' && 'Personalizado'}
                  </span>
                </label>
              ))}
            </div>
            {preset === 'custom' && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  className="input"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  style={{ maxWidth: '160px' }}
                />
                <input
                  type="date"
                  className="input"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  style={{ maxWidth: '160px' }}
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="label">Tipo</label>
            <select
              className="input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'INCOME' | 'EXPENSE' | '')}
            >
              <option value="">Todos</option>
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Categoria</label>
            <select
              className="input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Descrição</label>
            <input
              type="text"
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar na descrição"
            />
          </div>
          <div className="form-actions" style={styles.formActionsWrap}>
            <button type="submit" className="btn btn-primary">
              Filtrar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleUseCurrentPeriod}
              disabled={loading}
            >
              Usar período atual
            </button>
            <div ref={actionsRef} style={styles.dropdownWrap}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActionsOpen((v) => !v)}
                disabled={loading}
                aria-expanded={actionsOpen}
                aria-haspopup="true"
              >
                Exportar / Importar ▾
              </button>
              {actionsOpen && (
                <ul style={styles.dropdownMenu} role="menu">
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="dropdown-menu-item"
                      onClick={() => { setActionsOpen(false); handleExportCsv(); }}
                      disabled={loading}
                    >
                      Exportar CSV
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="dropdown-menu-item"
                      onClick={() => { setActionsOpen(false); handleDownloadPdf(); }}
                      disabled={loading || pdfLoading}
                    >
                      {pdfLoading ? 'Gerando PDF...' : 'Gerar PDF'}
                    </button>
                  </li>
                  <li role="none">
                    <Link
                      to={`/accounts/${accountId}/import`}
                      role="menuitem"
                      className="dropdown-menu-item"
                      onClick={() => setActionsOpen(false)}
                    >
                      Importar CSV
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </form>
      </div>

      {currentPeriodLabel && (
        <p style={styles.periodLabel}>
          Período atual: {formatDate(currentPeriodLabel.startDate)} até {formatDate(currentPeriodLabel.endDate)} ({currentPeriodLabel.label})
        </p>
      )}

      {error && <div className="error-box">{error}</div>}

      {loading && !data && <div className="card">Carregando extrato...</div>}

      {data && !error && (
        <>
          <div style={styles.totalsGrid}>
            <div className="card" style={styles.totalCard}>
              <div style={styles.totalLabel}>Total Receitas</div>
              <div style={{ ...styles.totalValue, color: 'var(--color-success)' }}>
                {formatCurrency(data.totalIncome)}
              </div>
            </div>
            <div className="card" style={styles.totalCard}>
              <div style={styles.totalLabel}>Total Despesas</div>
              <div style={{ ...styles.totalValue, color: '#b91c1c' }}>
                {formatCurrency(data.totalExpense)}
              </div>
            </div>
            <div className="card" style={styles.totalCard}>
              <div style={styles.totalLabel}>Saldo do período</div>
              <div style={{ ...styles.totalValue, color: data.netTotal >= 0 ? 'var(--color-success)' : '#b91c1c' }}>
                {formatCurrency(data.netTotal)}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Operações</h3>
            {loading ? (
              <div style={{ padding: '1rem' }}>Carregando...</div>
            ) : data.items.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Nenhuma transação no período.</p>
            ) : (
              <>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Data</th>
                        <th style={styles.th}>Tipo</th>
                        <th style={styles.th}>Categoria</th>
                        <th style={styles.th}>Descrição</th>
                        <th style={styles.th}>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((tx: TransactionListItemResponse) => (
                        <tr key={tx.id}>
                          <td style={styles.td}>
                            {new Date(tx.transactionDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                ...(tx.type === 'INCOME' ? styles.badgeIncome : styles.badgeExpense),
                              }}
                            >
                              {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {tx.category ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: tx.category.color, flexShrink: 0 }} />
                                {tx.category.name}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={styles.td}>{tx.description || '—'}</td>
                          <td
                            style={{
                              ...styles.td,
                              ...(tx.type === 'INCOME' ? styles.valuePositive : styles.valueNegative),
                            }}
                          >
                            {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.totalPages > 1 && (
                  <div style={styles.pagination}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={page <= 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </button>
                    <span style={styles.pageInfo}>
                      Página {data.page + 1} de {data.totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={page >= data.totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="card">Selecione o período e clique em Filtrar.</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  formActionsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem',
  },
  dropdownWrap: {
    position: 'relative',
    display: 'inline-block',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '0.25rem',
    minWidth: '220px',
    padding: '0.375rem 0',
    listStyle: 'none',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    zIndex: 10,
  },
  periodLabel: {
    margin: '0 0 1rem 0',
    fontSize: '0.9375rem',
    color: 'var(--color-text-muted)',
  },
  totalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  totalCard: { padding: '1rem 1.25rem' },
  totalLabel: { fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' },
  totalValue: { fontSize: '1.25rem', fontWeight: 600 },
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
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  pageInfo: { fontSize: '0.875rem', color: 'var(--color-text-muted)' },
};
