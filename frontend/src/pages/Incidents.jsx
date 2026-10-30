import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Alert, Badge, Empty, Modal, PageHeader, Spinner, fmtDate } from '../components/ui';

export default function Incidents() {
  const { hasRole } = useAuth();
  const canManage = hasRole('admin', 'inspector');
  const [list, setList] = useState(null);
  const [labs, setLabs] = useState([]);
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ lab: '', title: '', description: '', severity: 'low' });
  const [formError, setFormError] = useState('');
  const [managing, setManaging] = useState(null);

  const load = useCallback(() => {
    const params = {};
    if (status) params.status = status;
    if (severity) params.severity = severity;
    params.sort = sort;
    api.get('/incidents', { params }).then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  }, [status, severity, sort]);

  useEffect(load, [load]);
  useEffect(() => {
    api.get('/labs').then((r) => setLabs(r.data));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/incidents', form);
      setShowNew(false);
      setForm({ lab: '', title: '', description: '', severity: 'low' });
      load();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const update = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.put(`/incidents/${managing._id}`, { status: managing.status, severity: managing.severity, resolution: managing.resolution });
      setManaging(null);
      load();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const remove = async (i) => {
    if (!window.confirm('Delete this incident?')) return;
    try {
      await api.delete(`/incidents/${i._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div>
      <PageHeader title="Incidents" subtitle={hasRole('technician') ? 'Incidents you have reported' : 'Safety incidents and near-misses'}>
        <button className="btn-primary" onClick={() => { setFormError(''); setShowNew(true); }}>
          + Report incident
        </button>
      </PageHeader>
      <Alert>{error}</Alert>

      <div className="mb-4 flex flex-wrap gap-3">
        <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
        <select className="input max-w-[180px]" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All severities</option>
          {['low', 'medium', 'high', 'critical'].map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select className="input max-w-[200px]" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort incidents">
          <option value="-createdAt">Sort: Newest first</option>
          <option value="createdAt">Sort: Oldest first</option>
          <option value="title">Sort: Title (A-Z)</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {!list ? (
        <Spinner />
      ) : list.length === 0 ? (
        <Empty>No incidents found</Empty>
      ) : (
        <div className="space-y-3">
          {list.map((i) => (
            <div key={i._id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{i.title}</h3>
                  <p className="text-xs text-slate-500">
                    {i.lab?.code} - {i.lab?.name} | Reported by {i.reportedBy?.name} on {fmtDate(i.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge value={i.severity} />
                  <Badge value={i.status} />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-700">{i.description}</p>
              {i.resolution && (
                <p className="mt-2 rounded bg-green-50 px-3 py-2 text-sm text-green-800">
                  <b>Resolution:</b> {i.resolution} {i.resolvedAt && `(${fmtDate(i.resolvedAt)})`}
                </p>
              )}
              {canManage && (
                <div className="mt-3 flex gap-2">
                  <button className="btn-secondary btn-sm" onClick={() => { setFormError(''); setManaging({ ...i }); }}>Update status</button>
                  {hasRole('admin') && <button className="btn-danger btn-sm" onClick={() => remove(i)}>Delete</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <Modal title="Report an incident" onClose={() => setShowNew(false)}>
          <Alert>{formError}</Alert>
          <form onSubmit={create} className="space-y-4">
            <div>
              <label className="label">Laboratory</label>
              <select className="input" required value={form.lab} onChange={(e) => setForm({ ...form, lab: e.target.value })}>
                <option value="">Select...</option>
                {labs.map((l) => (
                  <option key={l._id} value={l._id}>{l.code} - {l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Severity</label>
              <select className="input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                {['low', 'medium', 'high', 'critical'].map((s) => (
                  <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn-primary">Submit report</button>
            </div>
          </form>
        </Modal>
      )}

      {managing && (
        <Modal title="Update incident" onClose={() => setManaging(null)}>
          <Alert>{formError}</Alert>
          <form onSubmit={update} className="space-y-4">
            <p className="text-sm font-medium">{managing.title}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select className="input" value={managing.status} onChange={(e) => setManaging({ ...managing, status: e.target.value })}>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="label">Severity</label>
                <select className="input" value={managing.severity} onChange={(e) => setManaging({ ...managing, severity: e.target.value })}>
                  {['low', 'medium', 'high', 'critical'].map((s) => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Resolution / notes</label>
              <textarea className="input" rows={3} value={managing.resolution || ''} onChange={(e) => setManaging({ ...managing, resolution: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setManaging(null)}>Cancel</button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
