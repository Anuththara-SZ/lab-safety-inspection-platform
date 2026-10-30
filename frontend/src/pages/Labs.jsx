import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Alert, Badge, Empty, Modal, PageHeader, Spinner, fmtDate, scoreColor } from '../components/ui';

const blank = { name: '', code: '', building: '', department: 'Electrical and Information Engineering', capacity: 20, hazardLevel: 'medium', status: 'active', manager: '' };

export default function Labs() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [labs, setLabs] = useState(null);
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [hazard, setHazard] = useState('');
  const [sort, setSort] = useState('code');
  const [editing, setEditing] = useState(null); // null | lab object (with or without _id)
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (hazard) params.hazardLevel = hazard;
    params.sort = sort;
    api.get('/labs', { params }).then((r) => setLabs(r.data)).catch((e) => setError(errMsg(e)));
  }, [search, hazard, sort]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (isAdmin) api.get('/users/staff').then((r) => setStaff(r.data));
  }, [isAdmin]);

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    const payload = { ...editing, manager: editing.manager || undefined };
    try {
      if (editing._id) await api.put(`/labs/${editing._id}`, payload);
      else await api.post('/labs', payload);
      setEditing(null);
      load();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const remove = async (lab) => {
    if (!window.confirm(`Delete ${lab.code} - ${lab.name}?`)) return;
    try {
      await api.delete(`/labs/${lab._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });

  return (
    <div>
      <PageHeader title="Laboratories" subtitle="Registry of all laboratories and their latest safety status">
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setFormError(''); setEditing({ ...blank }); }}>
            + Add laboratory
          </button>
        )}
      </PageHeader>
      <Alert>{error}</Alert>

      <div className="mb-4 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search name, code or building..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[180px]" value={hazard} onChange={(e) => setHazard(e.target.value)}>
          <option value="">All hazard levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select className="input max-w-[220px]" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort labs">
          <option value="code">Sort: Code (A-Z)</option>
          <option value="name">Sort: Name (A-Z)</option>
          <option value="-lastScore">Sort: Highest score</option>
          <option value="lastScore">Sort: Lowest score</option>
          <option value="lastInspectionDate">Sort: Longest since inspection</option>
          <option value="-lastInspectionDate">Sort: Recently inspected</option>
        </select>
      </div>

      {!labs ? (
        <Spinner />
      ) : labs.length === 0 ? (
        <Empty>No laboratories found</Empty>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Code', 'Name', 'Building', 'Hazard', 'Status', 'Last inspected', 'Score', 'Manager', ''].map((h) => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labs.map((l) => (
                <tr key={l._id}>
                  <td className="td font-semibold"><Link className="text-brand-600 hover:underline" to={`/labs/${l._id}`}>{l.code}</Link></td>
                  <td className="td">{l.name}</td>
                  <td className="td">{l.building}</td>
                  <td className="td"><Badge value={l.hazardLevel} /></td>
                  <td className="td"><Badge value={l.status} /></td>
                  <td className="td">{fmtDate(l.lastInspectionDate)}</td>
                  <td className={`td font-semibold ${scoreColor(l.lastScore)}`}>{l.lastScore != null ? `${l.lastScore}%` : '-'}</td>
                  <td className="td">{l.manager?.name || '-'}</td>
                  <td className="td whitespace-nowrap text-right">
                    {isAdmin && (
                      <>
                        <button className="btn-secondary btn-sm mr-2" onClick={() => { setFormError(''); setEditing({ ...l, manager: l.manager?._id || '' }); }}>Edit</button>
                        <button className="btn-danger btn-sm" onClick={() => remove(l)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit laboratory' : 'Add laboratory'} onClose={() => setEditing(null)}>
          <Alert>{formError}</Alert>
          <form onSubmit={save} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Name</label>
              <input className="input" required value={editing.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label">Code</label>
              <input className="input" required value={editing.code} onChange={set('code')} />
            </div>
            <div>
              <label className="label">Building</label>
              <input className="input" required value={editing.building} onChange={set('building')} />
            </div>
            <div className="col-span-2">
              <label className="label">Department</label>
              <input className="input" value={editing.department} onChange={set('department')} />
            </div>
            <div>
              <label className="label">Capacity</label>
              <input className="input" type="number" min="1" value={editing.capacity} onChange={set('capacity')} />
            </div>
            <div>
              <label className="label">Hazard level</label>
              <select className="input" value={editing.hazardLevel} onChange={set('hazardLevel')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={editing.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="label">Lab manager</label>
              <select className="input" value={editing.manager} onChange={set('manager')}>
                <option value="">- None -</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
