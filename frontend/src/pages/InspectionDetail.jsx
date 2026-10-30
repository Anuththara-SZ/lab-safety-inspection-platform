import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Alert, Badge, PageHeader, Spinner, fmtDate, scoreColor } from '../components/ui';

export default function InspectionDetail() {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [insp, setInsp] = useState(null);
  const [answers, setAnswers] = useState({});
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/inspections/${id}`)
      .then((r) => {
        setInsp(r.data);
        const init = {};
        r.data.responses.forEach((x) => (init[x._id] = { result: x.result, remarks: x.remarks || '' }));
        setAnswers(init);
        setSummary(r.data.summary || '');
      })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  const editable = insp && insp.status === 'scheduled' && (hasRole('admin') || insp.inspector?._id === user.id);

  const grouped = useMemo(() => {
    if (!insp) return {};
    return insp.responses.reduce((g, r) => {
      (g[r.category || 'General'] = g[r.category || 'General'] || []).push(r);
      return g;
    }, {});
  }, [insp]);

  const answered = insp ? insp.responses.filter((r) => answers[r._id]?.result !== 'pending').length : 0;
  const setAnswer = (rid, patch) => setAnswers((a) => ({ ...a, [rid]: { ...a[rid], ...patch } }));

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      const payload = { summary, responses: Object.entries(answers).map(([_id, v]) => ({ _id, ...v })) };
      const { data } = await api.put(`/inspections/${id}/submit`, payload);
      setInsp(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (!insp) return error ? <Alert>{error}</Alert> : <Spinner />;

  const failed = insp.responses.filter((r) => r.result === 'fail');

  return (
    <div className="max-w-4xl">
      <PageHeader title={`${insp.lab?.code} - ${insp.lab?.name}`} subtitle={insp.templateTitle}>
        <Link to="/inspections" className="btn-secondary">Back</Link>
        {insp.status === 'completed' && <button className="btn-primary" onClick={() => window.print()}>Print report</button>}
      </PageHeader>
      <Alert>{error}</Alert>

      <div className="card mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div><p className="text-xs text-slate-500">Inspector</p><p className="font-medium">{insp.inspector?.name}</p></div>
        <div><p className="text-xs text-slate-500">Date</p><p className="font-medium">{fmtDate(insp.completedDate || insp.scheduledDate)}</p></div>
        <div><p className="text-xs text-slate-500">Status</p><Badge value={insp.status} /></div>
        <div><p className="text-xs text-slate-500">Hazard level</p><Badge value={insp.lab?.hazardLevel} /></div>
        {insp.status === 'completed' && (
          <>
            <div><p className="text-xs text-slate-500">Safety score</p><p className={`text-2xl font-bold ${scoreColor(insp.score)}`}>{insp.score}%</p></div>
            <div><p className="text-xs text-slate-500">Risk level</p><Badge value={insp.riskLevel} /></div>
            <div className="col-span-2"><p className="text-xs text-slate-500">Summary</p><p className="text-sm">{insp.summary || '-'}</p></div>
          </>
        )}
      </div>

      {insp.status === 'completed' && failed.length > 0 && (
        <div className="card mb-6 border-red-200 bg-red-50">
          <h2 className="mb-2 font-semibold text-red-800">Corrective actions required ({failed.length})</h2>
          <ul className="list-disc pl-5 text-sm text-red-900 space-y-1">
            {failed.map((f) => (
              <li key={f._id}>
                {f.text} {f.critical && <b>[CRITICAL]</b>} - <i>{f.remarks}</i>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editable && (
        <div className="mb-4 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-700">
          Progress: {answered} / {insp.responses.length} items answered. Failed items require remarks.
        </div>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="card mb-4">
          <h2 className="mb-3 font-semibold text-slate-800">{cat}</h2>
          <div className="divide-y">
            {items.map((r) => {
              const a = answers[r._id] || { result: r.result, remarks: r.remarks };
              return (
                <div key={r._id} className="py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm text-slate-800">
                      {r.text} {r.critical && <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">Critical</span>}
                    </p>
                    {editable ? (
                      <div className="flex gap-1">
                        {['pass', 'fail', 'na'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAnswer(r._id, { result: opt })}
                            className={`btn btn-sm border ${
                              a.result === opt
                                ? opt === 'pass' ? 'bg-green-600 text-white border-green-600' : opt === 'fail' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-600 text-white border-slate-600'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {opt === 'na' ? 'N/A' : opt === 'pass' ? 'Pass' : 'Fail'}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Badge value={r.result} />
                    )}
                  </div>
                  {editable ? (
                    (a.result === 'fail' || a.remarks) && (
                      <input
                        className="input mt-2"
                        placeholder={a.result === 'fail' ? 'Remarks (required for failed items)' : 'Remarks (optional)'}
                        value={a.remarks}
                        onChange={(e) => setAnswer(r._id, { remarks: e.target.value })}
                      />
                    )
                  ) : (
                    r.remarks && <p className="mt-1 text-xs text-slate-500">Remarks: {r.remarks}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {editable && (
        <div className="card">
          <label className="label">Overall summary / recommendations</label>
          <textarea className="input" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
          <div className="mt-4 flex justify-end">
            <button className="btn-primary" onClick={submit} disabled={busy || answered < insp.responses.length}>
              {busy ? 'Submitting...' : 'Submit inspection'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
