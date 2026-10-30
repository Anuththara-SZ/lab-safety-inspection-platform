import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import api, { errMsg } from '../api';
import { Alert, Badge, Empty, PageHeader, Spinner, StatCard, fmtDate, scoreColor } from '../components/ui';

const RISK_COLORS = { low: '#16a34a', medium: '#eab308', high: '#f97316', critical: '#dc2626' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Spinner />;

  const { totals } = data;
  const riskData = Object.entries(data.inspectionsByRisk).map(([name, value]) => ({ name, value }));
  const sevData = ['low', 'medium', 'high', 'critical'].map((s) => ({ severity: s, count: data.incidentsBySeverity[s] || 0 }));
  const trend = data.scoreTrend.map((t) => ({ label: `${t.lab} ${fmtDate(t.date)}`, score: t.score }));

  return (
    <div>
      <PageHeader title="Safety Dashboard" subtitle="Overview of laboratory safety compliance" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 mb-6">
        <StatCard label="Active laboratories" value={totals.activeLabs} />
        <StatCard label="Completed inspections" value={totals.completedInspections} accent="text-green-600" />
        <StatCard label="Scheduled inspections" value={totals.scheduledInspections} accent="text-blue-600" />
        <StatCard label="Open incidents" value={totals.openIncidents} accent="text-red-600" />
        <StatCard label="Average safety score" value={`${totals.averageScore}%`} accent={scoreColor(totals.averageScore)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <div className="card">
          <h2 className="font-semibold mb-3">Score trend (last 10 inspections)</h2>
          {trend.length === 0 ? (
            <Empty>No completed inspections yet</Empty>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={false} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Inspections by risk level</h2>
          {riskData.length === 0 ? (
            <Empty>No data</Empty>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {riskData.map((d) => (
                    <Cell key={d.name} fill={RISK_COLORS[d.name]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Incidents by severity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sevData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                {sevData.map((d) => (
                  <Cell key={d.severity} fill={RISK_COLORS[d.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Labs overdue for inspection (&gt;{data.overdueDays} days)</h2>
          {data.overdueLabs.length === 0 ? (
            <Empty>All laboratories are up to date</Empty>
          ) : (
            <ul className="divide-y">
              {data.overdueLabs.map((l) => (
                <li key={l._id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <b>{l.code}</b> - {l.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge value={l.hazardLevel} />
                    <span className="text-slate-400">{l.lastInspectionDate ? fmtDate(l.lastInspectionDate) : 'Never'}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Open incidents</h2>
          <Link to="/incidents" className="text-sm text-brand-600">View all</Link>
        </div>
        {data.recentIncidents.length === 0 ? (
          <Empty>No open incidents</Empty>
        ) : (
          <ul className="divide-y">
            {data.recentIncidents.map((i) => (
              <li key={i._id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <b>{i.lab?.code}</b> - {i.title}
                </span>
                <span className="flex gap-2">
                  <Badge value={i.severity} />
                  <Badge value={i.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
