const Inspection = require('../models/Inspection');
const Template = require('../models/Template');
const Lab = require('../models/Lab');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sortBy = require('../utils/sort');

const populate = (q) =>
  q.populate('lab', 'name code building hazardLevel').populate('inspector', 'name email');

const fail = (res, code, msg) => {
  res.status(code);
  throw new Error(msg);
};

exports.listInspections = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.lab) filter.lab = req.query.lab;
  if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
  // Inspectors only see their own assignments unless they are admins; technicians see completed reports
  if (req.user.role === 'inspector') filter.inspector = req.user._id;
  if (req.user.role === 'technician') filter.status = 'completed';
  const sort = sortBy(req.query, ['scheduledDate', 'completedDate', 'score', 'status'], '-scheduledDate');
  const list = await populate(Inspection.find(filter).select('-responses').sort(sort));
  res.json(list);
});

exports.getInspection = asyncHandler(async (req, res) => {
  const insp = await populate(Inspection.findById(req.params.id));
  if (!insp) fail(res, 404, 'Inspection not found');
  if (req.user.role === 'technician' && insp.status !== 'completed') fail(res, 403, 'Report not available yet');
  res.json(insp);
});

// POST /api/inspections  -> schedules an inspection from a checklist template
exports.createInspection = asyncHandler(async (req, res) => {
  const { lab, template, scheduledDate } = req.body;
  // Admins may assign any inspector; inspectors can only assign themselves
  const inspectorId = req.user.role === 'admin' && req.body.inspector ? req.body.inspector : req.user._id;

  const [labDoc, tpl, inspector] = await Promise.all([
    Lab.findById(lab),
    Template.findById(template),
    User.findById(inspectorId),
  ]);
  if (!labDoc) fail(res, 404, 'Laboratory not found');
  if (!tpl) fail(res, 404, 'Template not found');
  if (!inspector || inspector.role === 'technician') fail(res, 400, 'Inspector must be an admin or inspector');

  const insp = await Inspection.create({
    lab: labDoc._id,
    template: tpl._id,
    templateTitle: tpl.title,
    inspector: inspector._id,
    scheduledDate: scheduledDate || Date.now(),
    responses: tpl.items.map((i) => ({ text: i.text, category: i.category, critical: i.critical })),
  });
  res.status(201).json(await populate(Inspection.findById(insp._id)));
});

// PUT /api/inspections/:id/submit  -> record answers, compute score and risk
exports.submitInspection = asyncHandler(async (req, res) => {
  const insp = await Inspection.findById(req.params.id);
  if (!insp) fail(res, 404, 'Inspection not found');
  if (insp.status === 'completed') fail(res, 400, 'Inspection already completed');
  if (req.user.role !== 'admin' && String(insp.inspector) !== String(req.user._id))
    fail(res, 403, 'Only the assigned inspector can submit this inspection');

  const answers = req.body.responses || [];
  answers.forEach((a) => {
    const r = insp.responses.id(a._id);
    if (r && ['pass', 'fail', 'na'].includes(a.result)) {
      r.result = a.result;
      r.remarks = a.remarks || '';
    }
  });
  if (insp.responses.some((r) => r.result === 'pending')) fail(res, 400, 'Answer every checklist item before submitting');
  const missingRemark = insp.responses.find((r) => r.result === 'fail' && !r.remarks);
  if (missingRemark) fail(res, 400, `Remarks are required for failed item: "${missingRemark.text}"`);

  insp.summary = req.body.summary;
  insp.status = 'completed';
  insp.completedDate = new Date();
  insp.calculateResult();
  await insp.save();

  await Lab.findByIdAndUpdate(insp.lab, { lastInspectionDate: insp.completedDate, lastScore: insp.score });
  res.json(await populate(Inspection.findById(insp._id)));
});

exports.deleteInspection = asyncHandler(async (req, res) => {
  const insp = await Inspection.findByIdAndDelete(req.params.id);
  if (!insp) fail(res, 404, 'Inspection not found');
  // Keep the lab's "last inspection" summary consistent after a deletion
  const latest = await Inspection.findOne({ lab: insp.lab, status: 'completed' }).sort('-completedDate');
  await Lab.findByIdAndUpdate(insp.lab, {
    lastInspectionDate: latest ? latest.completedDate : null,
    lastScore: latest ? latest.score : null,
  });
  res.json({ message: 'Inspection deleted' });
});
