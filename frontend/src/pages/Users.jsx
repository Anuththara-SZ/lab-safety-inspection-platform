import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Alert, Badge, Modal, PageHeader, Spinner, fmtDate } from '../components/ui';

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'technician' });
  const [formError, setFormError] = useState('');

  const load = () => api.get('/users').then((r) => setUsers(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => {
    load();
  }, []);

  const changeRole = async (u, role) => {
    try {
      await api.put(`/users/${u._id}/role`, { role });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete user ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/users', form);
      setShowNew(false);
      setForm({ name: '', email: '', password: '', role: 'technician' });
      load();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage accounts and role-based access">
        <button className="btn-primary" onClick={() => { setFormError(''); setShowNew(true); }}>+ Add user</button>
      </PageHeader>
      <Alert>{error}</Alert>
      {!users ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Name', 'Email', 'Role', 'Joined', ''].map((h) => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const self = u._id === me.id;
                return (
                  <tr key={u._id}>
                    <td className="td font-medium">{u.name} {self && <span className="text-xs text-slate-400">(you)</span>}</td>
                    <td className="td">{u.email}</td>
                    <td className="td">
                      {self ? (
                        <Badge value={u.role} />
                      ) : (
                        <select className="input w-36 py-1" value={u.role} onChange={(e) => changeRole(u, e.target.value)}>
                          <option value="admin">Admin</option>
                          <option value="inspector">Inspector</option>
                          <option value="technician">Technician</option>
                        </select>
                      )}
                    </td>
                    <td className="td">{fmtDate(u.createdAt)}</td>
                    <td className="td text-right">{!self && <button className="btn-danger btn-sm" onClick={() => remove(u)}>Delete</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <Modal title="Add user" onClose={() => setShowNew(false)}>
          <Alert>{formError}</Alert>
          <form onSubmit={create} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="inspector">Inspector</option>
                <option value="technician">Technician</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn-primary">Create</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
