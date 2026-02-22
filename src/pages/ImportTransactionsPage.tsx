import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { importTransactionsCsv } from '../api/masdApi';
import type { ImportTransactionsResponse, ImportFailureItem } from '../types/dto';

export function ImportTransactionsPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'LENIENT' | 'STRICT'>('LENIENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportTransactionsResponse | null>(null);
  const [expandedRaw, setExpandedRaw] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId || !file) {
      setError('Selecione um arquivo CSV.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    importTransactionsCsv(accountId, file, mode)
      .then((res) => setResult(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao importar CSV.'))
      .finally(() => setLoading(false));
  }

  if (!accountId) return null;

  return (
    <div>
      <div className="page-header">
        <Link
          to={`/accounts/${accountId}/transactions`}
          style={{ fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'inline-block' }}
        >
          ← Voltar ao Extrato
        </Link>
        <h2 className="page-title">Importar transações (CSV)</h2>
        <p className="page-subtitle">
          Envie um arquivo CSV com colunas: date, type, description, amount.
        </p>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit} className="form-layout-grid">
          <div className="form-group form-group-full">
            <label className="label">Arquivo (.csv)</label>
            <input
              type="file"
              accept=".csv"
              className="input"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResult(null);
                setError(null);
              }}
            />
          </div>
          <div className="form-group">
            <label className="label">Modo</label>
            <select
              className="input"
              value={mode}
              onChange={(e) => setMode(e.target.value as 'LENIENT' | 'STRICT')}
            >
              <option value="LENIENT">LENIENT (aceita DD/MM/YYYY, RECEITA/DESPESA, 1.234,56)</option>
              <option value="STRICT">STRICT (apenas YYYY-MM-DD, INCOME/EXPENSE, 1234.56)</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading || !file}>
              {loading ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Resultado</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Linhas processadas: <strong>{result.totalLines}</strong>
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Importadas: <strong style={{ color: 'var(--color-success)' }}>{result.importedCount}</strong>
          </p>
          <p style={{ margin: '0 0 1rem 0' }}>
            Falhas: <strong style={{ color: result.failedCount > 0 ? '#b91c1c' : 'inherit' }}>{result.failedCount}</strong>
          </p>
          {result.failures && result.failures.length > 0 && (
            <>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Detalhes (máx. 50):
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Linha</th>
                      <th style={thStyle}>Motivo</th>
                      <th style={thStyle}>Conteúdo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failures.map((f: ImportFailureItem) => (
                      <tr key={f.lineNumber}>
                        <td style={tdStyle}>{f.lineNumber}</td>
                        <td style={tdStyle}>{f.reason}</td>
                        <td style={tdStyle}>
                          {expandedRaw === f.lineNumber ? (
                            <>
                              <pre style={rawPreStyle}>{f.raw}</pre>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ marginTop: '0.25rem' }}
                                onClick={() => setExpandedRaw(null)}
                              >
                                Ocultar
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setExpandedRaw(f.lineNumber)}
                            >
                              Ver linha
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.875rem',
};
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-text-muted)',
  fontWeight: 500,
};
const tdStyle: React.CSSProperties = {
  padding: '0.6rem 0.75rem',
  borderBottom: '1px solid var(--color-border)',
};
const rawPreStyle: React.CSSProperties = {
  margin: 0,
  padding: '0.5rem',
  background: 'var(--color-bg-muted, #f3f4f6)',
  borderRadius: 4,
  fontSize: '0.8125rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  maxWidth: '400px',
};
