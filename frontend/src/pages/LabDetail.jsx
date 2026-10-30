import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { Alert, Badge, Empty, PageHeader, Spinner, fmtDate, scoreColor } from '../components/ui';

export default function LabDetail() {
  const { id } = useParams();
  const [lab, setLab] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/labs/${id}`), api.get('/inspections', { params: { lab: id } }), api.get('/incidents', { params: { lab: id } })])
      .then(([l, i, n]) => {
        setLab(l.data);
        setInspections(i.data);
        setIncidents(n.data);
      })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  if (!lab) return error ? <Alert>{error}</Alert> : <Spinner />;

  const info = [
    ['Code', lab.code],
    ['Building', lab.building],
    ['Department', lab.department],
    ['Capacity', lab.capacity],
    ['Manager', lab.manager?.name || '-'],
    ['Last inspected', fmtDate(lab.lastInspectionDate)],
  ];

  return (
    <div className="max-w-4xl">
      <PageHeader title={lab.name} subtitle={`${lab.code} - ${lab.building}`}>
        <Link to="/labs" className="btn-secondary">Back</Link>
      </PageHeader>
      <Alert>{error}</Alert>

      <div className="card mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {info.map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-slate-500">{k}</p>
            <p className="font-medium">{v}</p>
          </div>
        ))}
        <div><p className="text-xs text-slate-500">Hazard level</p><Badge value={lab.hazardLevel} /></div>
        <div><p className="text-xs text-slate-500">Status</p><Badge value={lab.status} /></div>
        <div>
          <p className="text-xs text-slate-500">Latest score</p>
          <p className={`text-2xl font-bold ${scoreColor(lab.lastScore)}`}>{lab.lastScore != null ? `${lab.lastScore}%` : '-'}</p>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="mb-3 font-semibold">Inspection history</h2>
        {inspections.length === 0 ? (
          <Empty>No inspections yet</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead><tr>{['Date', 'Checklist', 'Inspector', 'Status', 'Score', 'Risk', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {inspections.map((i) => (
                  <tr key={i._id}>
                    <td className="td">{fmtDate(i.completedDate || i.scheduledDate)}</td>
                    <td className="td">{i.templateTitle}</td>
                    <td className="td">{i.inspector?.name}</td>
                    <td className="td"><Badge value={i.status} /></td>
                    <td className={`td font-semibold ${scoreColor(i.score)}`}>{i.score != null ? `${i.score}%` : '-'}</td>
                    <td className="td"><Badge value={i.riskLevel} /></td>
                    <td className="td"><Link className="btn-secondary btn-sm" to={`/inspections/${i._id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">Incidents</h2>
        {incidents.length === 0 ? (
          <Empty>No incidents recorded</Empty>
        ) : (
          <ul className="divide-y">
            {incidents.map((i) => (
              <li key={i._id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <b>{i.title}</b> <span className="text-slate-400">- {fmtDate(i.createdAt)}</span>
                </span>
                <span className="flex gap-2"><Badge value={i.severity} /><Badge value={i.status} /></span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
