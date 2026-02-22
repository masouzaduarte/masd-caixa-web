import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getAccountId } from '../storage/accountStorage';
import { getAccountPeriodRule, upsertAccountPeriodRule } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { apiBaseURL } from '../api/client';
import type { AccountPeriodRuleResponse } from '../types/dto';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PeriodConfigPage() {
  const accountId = getAccountId();
  const [periodMode, setPeriodMode] = useState<'CLOSING_DAY' | 'CYCLE_DAYS'>('CLOSING_DAY');
  const [closingDay, setClosingDay] = useState<number>(20);
  const [cycleDays, setCycleDays] = useState<number>(30);
  const [anchorDate, setAnchorDate] = useState(todayISO());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    getAccountPeriodRule(accountId)
      .then((r) => {
        if (r.status === 204 || !r.data) return;
        const d = r.data as AccountPeriodRuleResponse;
        setPeriodMode((d.mode === 'CYCLE_DAYS' ? 'CYCLE_DAYS' : 'CLOSING_DAY') as 'CLOSING_DAY' | 'CYCLE_DAYS');
        setClosingDay(d.closingDay ?? 20);
        setCycleDays(d.cycleDays ?? 30);
        setAnchorDate(d.anchorDate ? d.anchorDate.slice(0, 10) : todayISO());
      })
      .catch(() => setError('Erro ao carregar regra de período.'))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (!accountId) {
    return <Navigate to="/accounts" replace state={{ message: 'Selecione uma conta para configurar o período.' }} />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload: { mode: 'CLOSING_DAY' | 'CYCLE_DAYS'; closingDay?: number; cycleDays?: number; anchorDate?: string } = {
      mode: periodMode,
    };
    if (periodMode === 'CLOSING_DAY') {
      payload.closingDay = closingDay;
    } else {
      payload.cycleDays = cycleDays;
      payload.anchorDate = anchorDate || undefined;
    }
    upsertAccountPeriodRule(accountId!, payload)
      .then(() => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Erro ao salvar regra.', apiBaseURL)))
      .finally(() => setSaving(false));
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Configurar Período</h2>
        <p className="page-subtitle">
          Define como o período atual é calculado no extrato (fechamento por dia fixo ou ciclo em dias).
        </p>
      </div>
      <div className="card">
        {loading ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Carregando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="form-layout-grid">
            <div className="form-group form-group-full">
              <label className="label">Modo</label>
              <select
                className="input"
                value={periodMode}
                onChange={(e) => setPeriodMode(e.target.value as 'CLOSING_DAY' | 'CYCLE_DAYS')}
              >
                <option value="CLOSING_DAY">Fechamento por dia</option>
                <option value="CYCLE_DAYS">Ciclo em dias</option>
              </select>
            </div>
            {periodMode === 'CLOSING_DAY' && (
              <div className="form-group">
                <label className="label">Dia de fechamento (1–28)</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  className="input"
                  value={closingDay}
                  onChange={(e) => setClosingDay(Number(e.target.value) || 1)}
                />
              </div>
            )}
            {periodMode === 'CYCLE_DAYS' && (
              <>
                <div className="form-group">
                  <label className="label">Ciclo (dias)</label>
                  <select
                    className="input"
                    value={cycleDays}
                    onChange={(e) => setCycleDays(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={45}>45</option>
                    <option value={60}>60</option>
                    <option value={90}>90</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Data âncora (início do ciclo, opcional)</label>
                  <input
                    type="date"
                    className="input"
                    value={anchorDate}
                    onChange={(e) => setAnchorDate(e.target.value)}
                  />
                </div>
              </>
            )}
            {error && <div className="error-box form-group-full">{error}</div>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              {success && (
                <span style={{ color: 'var(--color-success)', fontSize: '0.875rem' }}>
                  Regra salva com sucesso.
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
