import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Alert, Empty, Modal, PageHeader, Spinner } from '../components/ui';

const CATEGORIES = ['Fire Safety', 'Chemical', 'Electrical', 'PPE', 'Emergency', 'Waste', 'General'];
const blankItem = () => ({ text: '', category: 'General', critical: false });

export default function Templates() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const load = () => api.get('/templates').then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = { title: editing.title, description: editing.description, items: editing.items };
      if (editing._id) await api.put(`/templates/${editing._id}`, payload);
      else await api.post('/templates', payload);
      setEditing(null);
      load();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete template "${t.title}"? Past inspections are not affected.`)) return;
    try {
      await api.delete(`/templates/${t._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const setItem = (idx, patch) => setEditing({ ...editing, items: editing.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });

  return (
    <div>
      <PageHeader title="Inspection Checklists" subtitle="Reusable checklist templates used to create inspections">
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setFormError(''); setEditing({ title: '', description: '', items: [blankItem()] }); }}>
            + New checklist
          </button>
        )}
      </PageHeader>
      <Alert>{error}</Alert>

      {!list ? (
        <Spinner />
      ) : list.length === 0 ? (
        <Empty>No checklists yet</Empty>
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <div key={t._id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-sm text-slate-500">{t.description} ({t.items.length} items, {t.items.filter((i) => i.critical).length} critical)</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary btn-sm" onClick={() => setExpanded(expanded === t._id ? null : t._id)}>
                    {expanded === t._id ? 'Hide' : 'View items'}
                  </button>
                  {isAdmin && (
                    <>
                      <button className="btn-secondary btn-sm" onClick={() => { setFormError(''); setEditing(JSON.parse(JSON.stringify(t))); }}>Edit</button>
                      <button className="btn-danger btn-sm" onClick={() => remove(t)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
              {expanded === t._id && (
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                  {t.items.map((i) => (
                    <li key={i._id}>
                      {i.text} <span className="text-xs text-slate-400">[{i.category}]</span> {i.critical && <b className="text-xs text-red-600">CRITICAL</b>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal wide title={editing._id ? 'Edit checklist' : 'New checklist'} onClose={() => setEditing(null)}>
          <Alert>{formError}</Alert>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input className="input" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Checklist items</label>
              <div className="space-y-2">
                {editing.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input className="input flex-1" placeholder="Checklist question" required value={it.text} onChange={(e) => setItem(idx, { text: e.target.value })} />
                    <select className="input w-36" value={it.category} onChange={(e) => setItem(idx, { category: e.target.value })}>
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                      <input type="checkbox" checked={it.critical} onChange={(e) => setItem(idx, { critical: e.target.checked })} /> Critical
                    </label>
                    <button type="button" className="text-xl text-red-500 disabled:opacity-30" disabled={editing.items.length === 1} onClick={() => setEditing({ ...editing, items: editing.items.filter((_, i) => i !== idx) })}>
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-secondary btn-sm mt-2" onClick={() => setEditing({ ...editing, items: [...editing.items, blankItem()] })}>
                + Add item
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary">Save checklist</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
