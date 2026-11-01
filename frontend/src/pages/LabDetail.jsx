import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/icons';
import { Alert, Badge, Empty, Modal, PageHeader, Spinner, fmtDate, scoreColor } from '../components/ui';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function getBase() {
  try {
    return localStorage.getItem('qrBase') || window.location.origin;
  } catch {
    return window.location.origin;
  }
}

export default function LabDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canInspect = hasRole('admin', 'inspector');
  const [lab, setLab] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [base, setBase] = useState(getBase);
  const [showStart, setShowStart] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [startError, setStartError] = useState('');
  const qrWrap = useRef(null);

  useEffect(() => {
    Promise.all([api.get(`/labs/${id}`), api.get('/inspections', { params: { lab: id } }), api.get('/incidents', { params: { lab: id } })])
      .then(([l, i, n]) => {
        setLab(l.data);
        setInspections(i.data);
        setIncidents(n.data);
      })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  const cleanBase = base.trim().replace(/\/+$/, '');
  const qrUrl = `${cleanBase}/labs/${id}`;

  const saveBase = (v) => {
    setBase(v);
    try {
      localStorage.setItem('qrBase', v);
    } catch {
      /* storage unavailable: ignore */
    }
  };

  const qrDataUrl = () => qrWrap.current?.querySelector('canvas')?.toDataURL('image/png');

  const downloadQr = () => {
    const url = qrDataUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lab.code}-qr.png`;
    a.click();
  };

  const printLabel = () => {
    const url = qrDataUrl();
    const w = window.open('', '_blank', 'width=520,height=700');
    if (!w || !url) return;
    w.document.write(`<!doctype html><html><head><title>${esc(lab.code)} QR label</title>
      <style>body{font-family:Arial,sans-serif;text-align:center;padding:28px}
      .box{border:3px solid #1e40af;border-radius:16px;padding:24px;display:inline-block}
      h1{margin:0;font-size:44px;color:#0f172a}h2{margin:4px 0 16px;font-size:18px;color:#334155;font-weight:600}
      p{margin:10px 0 0;color:#475569;font-size:14px}small{color:#64748b;word-break:break-all;font-size:11px}</style></head>
      <body><div class="box"><h1>${esc(lab.code)}</h1><h2>${esc(lab.name)}</h2>
      <img src="${url}" width="300" height="300" alt="QR code"/>
      <p><b>Scan to open inspection record</b></p><small>${esc(qrUrl)}</small></div></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const openStart = async () => {
    setStartError('');
    setShowStart(true);
    try {
      const { data } = await api.get('/templates');
      setTemplates(data);
      if (data.length && !templateId) setTemplateId(data[0]._id);
    } catch (e) {
      setStartError(errMsg(e));
    }
  };

  const startInspection = async (e) => {
    e.preventDefault();
    setStartError('');
    try {
      const { data } = await api.post('/inspections', { lab: id, template: templateId });
      navigate(`/inspections/${data._id}`);
    } catch (err) {
      setStartError(errMsg(err));
    }
  };

  if (!lab) return error ? <Alert>{error}</Alert> : <Spinner />;

  const info = [
    ['Code', lab.code],
    ['Building', lab.building],
    ['Department', lab.department],
    ['Capacity', lab.capacity],
    ['Manager', lab.manager?.name || '-'],
    ['Last inspected', fmtDate(lab.lastInspectionDate)],
  ];
  const localhostWarning = /localhost|127\.0\.0\.1/.test(cleanBase);

  return (
    <div className="max-w-5xl">
      <PageHeader title={lab.name} subtitle={`${lab.code} - ${lab.building}`}>
        <Link to="/labs" className="btn-secondary">Back</Link>
        {canInspect && lab.status === 'active' && (
          <button className="btn-primary" onClick={openStart}>Start inspection</button>
        )}
      </PageHeader>
      <Alert>{error}</Alert>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="card grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-2 content-start">
          {info.map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-500">{k}</p>
              <p className="font-medium text-slate-900">{v}</p>
            </div>
          ))}
          <div><p className="text-xs text-slate-500">Hazard level</p><Badge value={lab.hazardLevel} /></div>
          <div><p className="text-xs text-slate-500">Status</p><Badge value={lab.status} /></div>
          <div>
            <p className="text-xs text-slate-500">Latest score</p>
            <p className={`text-2xl font-bold ${scoreColor(lab.lastScore)}`}>{lab.lastScore != null ? `${lab.lastScore}%` : '-'}</p>
          </div>
        </div>

        {/* QR code card */}
        <div className="card no-print text-center">
          <h2 className="mb-1 flex items-center justify-center gap-2 font-semibold text-slate-900">
            <Icon name="clipboard" size={18} /> Lab QR code
          </h2>
          <p className="mb-3 text-xs text-slate-500">Inspectors scan this to open the lab record and start an inspection.</p>
          <div ref={qrWrap} className="mx-auto inline-block rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <QRCodeCanvas value={qrUrl} size={176} level="M" marginSize={1} />
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <button className="btn-secondary btn-sm" onClick={downloadQr}>Download PNG</button>
            <button className="btn-secondary btn-sm" onClick={printLabel}>Print label</button>
          </div>
          {hasRole('admin') && (
            <div className="mt-4 text-left">
              <label className="label text-xs" htmlFor="qrbase">QR base address</label>
              <input id="qrbase" className="input text-xs" value={base} onChange={(e) => saveBase(e.target.value)} />
              {localhostWarning && (
                <p className="mt-1 text-xs text-amber-700">
                  Phones cannot open "localhost". For testing, use your PC's Wi-Fi address, e.g. http://192.168.1.10:5173
                </p>
              )}
            </div>
          )}
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

      {showStart && (
        <Modal title={`Start inspection - ${lab.code}`} onClose={() => setShowStart(false)}>
          <Alert>{startError}</Alert>
          <form onSubmit={startInspection} className="space-y-4">
            <div>
              <label className="label" htmlFor="tpl">Checklist template</label>
              <select id="tpl" className="input" required value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>{t.title} ({t.items.length} items)</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500">The checklist opens immediately so you can answer each item on site.</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowStart(false)}>Cancel</button>
              <button className="btn-primary" disabled={!templateId}>Begin checklist</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
