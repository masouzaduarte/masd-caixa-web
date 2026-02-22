import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccountId } from '../storage/accountStorage';
import { createTransaction, getCategories } from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { apiBaseURL } from '../api/client';
import type { CategoryDTO } from '../types/dto';

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
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) navigate('/setup');
  }, [accountId, navigate]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

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
        categoryId: categoryId || undefined,
      });
      navigate('/');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao criar transação.', apiBaseURL));
    } finally {
      setLoading(false);
    }
  }

  if (!accountId) return null;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Nova Transação</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Registrar receita ou despesa na conta em uso.
        </p>
      </div>
      <div className="card form-card">
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="form-layout-grid">
          <div className="form-group">
            <label className="label">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
              className="input"
            >
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Data</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="label">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group form-group-full">
            <label className="label">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Opcional"
            />
          </div>
          <div className="form-group">
            <label className="label">Valor</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
