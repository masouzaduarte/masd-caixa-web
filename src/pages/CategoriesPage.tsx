import { useEffect, useState } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/masdApi';
import { getApiErrorMessage } from '../api/errorMessage';
import { apiBaseURL } from '../api/client';
import type { CategoryDTO } from '../types/dto';

export function CategoriesPage() {
  const [list, setList] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#00A859');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#00A859');

  function load() {
    setLoading(true);
    setError(null);
    getCategories()
      .then((res) => setList(res.data))
      .catch(() => setError('Erro ao carregar categorias.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaveError(null);
    setSaving(true);
    createCategory({ name: name.trim(), color })
      .then((res) => {
        setList((prev) => [...prev, res.data]);
        setName('');
        setColor('#00A859');
      })
      .catch((err) => setSaveError(getApiErrorMessage(err, 'Erro ao criar categoria.', apiBaseURL)))
      .finally(() => setSaving(false));
  }

  function startEdit(c: CategoryDTO) {
    setEditingId(c.id);
    setEditingName(c.name);
    setEditingColor(c.color);
    setSaveError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
    setEditingColor('#00A859');
    setSaveError(null);
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editingName.trim()) return;
    setSaving(true);
    setSaveError(null);
    updateCategory(editingId, { name: editingName.trim(), color: editingColor })
      .then((res) => {
        setList((prev) => prev.map((c) => (c.id === editingId ? res.data : c)));
        cancelEdit();
      })
      .catch((err) => setSaveError(getApiErrorMessage(err, 'Erro ao atualizar categoria.', apiBaseURL)))
      .finally(() => setSaving(false));
  }

  function handleDelete(id: string) {
    if (!window.confirm('Excluir esta categoria? Transações vinculadas ficarão sem categoria.')) return;
    setError(null);
    deleteCategory(id)
      .then(() => setList((prev) => prev.filter((c) => c.id !== id)))
      .catch((err) => setError(getApiErrorMessage(err, 'Erro ao excluir.', apiBaseURL)));
  }

  if (loading) return <div className="card">Carregando categorias...</div>;
  if (error) return <div className="error-box">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Categorias</h2>
        <p className="page-subtitle">
          Crie categorias para organizar receitas e despesas. Use no extrato e nos gráficos.
        </p>
      </div>

      <div className="card form-card">
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Nova categoria</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
            <label className="label">Nome</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Alimentação"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Cor</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: 40, height: 38, padding: 2, cursor: 'pointer', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{color}</span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
        {saveError && <div className="error-box" style={{ marginTop: '0.75rem' }}>{saveError}</div>}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Listagem</h3>
        {list.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Nenhuma categoria. Crie uma acima.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {list.map((c) => (
              <li
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {editingId === c.id ? (
                  <form onSubmit={handleUpdate} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                    <input
                      type="text"
                      className="input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      style={{ width: '180px' }}
                    />
                    <input
                      type="color"
                      value={editingColor}
                      onChange={(e) => setEditingColor(e.target.value)}
                      style={{ width: 36, height: 34, padding: 2, cursor: 'pointer', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={saving}>Salvar</button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancelar</button>
                  </form>
                ) : (
                  <>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        backgroundColor: c.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1 }}>{c.name}</span>
                    <button type="button" className="btn btn-secondary" onClick={() => startEdit(c)}>Editar</button>
                    <button type="button" className="btn btn-secondary" onClick={() => handleDelete(c.id)}>Excluir</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
