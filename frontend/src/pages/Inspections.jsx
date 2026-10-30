import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Alert, Badge, Empty, Modal, PageHeader, Spinner, fmtDate, scoreColor } from '../components/ui';

export default function Inspections() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const canCreate = hasRole('admin', 'inspector');
  const [list, setList] = useState(null);
  const [status, setStatus] = useState('');
  const [risk, setRisk] = useState('');
  const [sort, setSort] = useState('-scheduledDate');
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [labs, setLabs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ lab: '', template: '', scheduledDate: new Date().toISOString().slice(0, 10), inspector: '' });
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    const params = {};
    if (status) params.status = status;
    if (risk) params.riskLevel = risk;
    params.sort = sort;
    api.get('/inspections', { params }).then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  }, [status, risk, sort]);

  useEffect(load, [load]);

  const openNew = async () => {
    setFormError('');
    setShowNew(true);
    const [l, t] = await Promise.all([api.get('/labs'), api.get('/templates')]);
    setLabs(l.data.filter((x) => x.status === 'active'));
    setTemplates(t.data);
    if (hasRole('admin')) setStaff((await api.get('/users/staff')).data);
  };

  const create = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = { ...form };
      if (!payload.inspector) delete payload.inspector;
      const { data } = await api.post('/inspections', payload);
      navigate(`/inspections/${data._id}`);
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const remove = async (i) => {
    if (!window.confirm('Delete this inspection record?')) return;
    try {
      await api.delete(`/inspections/${i._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div>
      <PageHeader title="Inspections" subtitle={hasRole('technician') ? 'Completed inspection reports' : 'Schedule, perform and review safety inspections'}>
        {canCreate && (
          <button className="btn-primary" onClick={openNew}>
            + New inspection
          </button>
        )}
      </PageHeader>
      <Alert>{error}</Alert>

      <div className="mb-4 flex flex-wrap gap-3">
        {!hasRole('technician') && (
          <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        )}
        <select className="input max-w-[180px]" value={risk} onChange={(e) => setRisk(e.target.value)}>
          <option value="">All risk levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select className="input max-w-[200px]" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort inspections">
          <option value="-scheduledDate">Sort: Newest first</option>
          <option value="scheduledDate">Sort: Oldest first</option>
          <option value="-score">Sort: Highest score</option>
          <option value="score">Sort: Lowest score</option>
        </select>
      </div>

      {!list ? (
        <Spinner />
      ) : list.length === 0 ? (
        <Empty>No inspections found</Empty>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Laboratory', 'Checklist', 'Inspector', 'Date', 'Status', 'Score', 'Risk', ''].map((h) => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((i) => (
                <tr key={i._id}>
                  <td className="td font-semibold">{i.lab?.code} <span className="font-normal text-slate-500">{i.lab?.name}</span></td>
                  <td className="td">{i.templateTitle}</td>
                  <td className="td">{i.inspector?.name}</td>
                  <td className="td">{fmtDate(i.completedDate || i.scheduledDate)}</td>
                  <td className="td"><Badge value={i.status} /></td>
                  <td className={`td font-semibold ${scoreColor(i.score)}`}>{i.score != null ? `${i.score}%` : '-'}</td>
                  <td className="td"><Badge value={i.riskLevel} /></td>
                  <td className="td whitespace-nowrap text-right">
                    <Link className="btn-secondary btn-sm mr-2" to={`/inspections/${i._id}`}>
                      {i.status === 'scheduled' && canCreate && (hasRole('admin') || i.inspector?._id === user.id) ? 'Start' : 'View'}
                    </Link>
                    {hasRole('admin') && <button className="btn-danger btn-sm" onClick={() => remove(i)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <Modal title="Schedule new inspection" onClose={() => setShowNew(false)}>
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
              <label className="label">Checklist template</label>
              <select className="input" required value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}>
                <option value="">Select...</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>{t.title} ({t.items.length} items)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
            </div>
            {hasRole('admin') && (
              <div>
                <label className="label">Assign inspector (default: you)</label>
                <select className="input" value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })}>
                  <option value="">Myself</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn-primary">Create &amp; open checklist</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
