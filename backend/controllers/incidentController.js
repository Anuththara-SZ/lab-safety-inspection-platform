const Incident = require('../models/Incident');
const Lab = require('../models/Lab');
const asyncHandler = require('../utils/asyncHandler');
const sortBy = require('../utils/sort');

const populate = (q) => q.populate('lab', 'name code').populate('reportedBy', 'name role');

exports.listIncidents = asyncHandler(async (req, res) => {
  const filter = {};
  ['status', 'severity', 'lab'].forEach((k) => req.query[k] && (filter[k] = req.query[k]));
  if (req.user.role === 'technician') filter.reportedBy = req.user._id; // technicians see their own reports
  const sort = sortBy(req.query, ['createdAt', 'title', 'status'], '-createdAt');
  res.json(await populate(Incident.find(filter).sort(sort)));
});

exports.createIncident = asyncHandler(async (req, res) => {
  const { lab, title, description, severity } = req.body;
  if (!(await Lab.exists({ _id: lab }))) {
    res.status(404);
    throw new Error('Laboratory not found');
  }
  const inc = await Incident.create({ lab, title, description, severity, reportedBy: req.user._id });
  res.status(201).json(await populate(Incident.findById(inc._id)));
});

exports.updateIncident = asyncHandler(async (req, res) => {
  const inc = await Incident.findById(req.params.id);
  if (!inc) {
    res.status(404);
    throw new Error('Incident not found');
  }
  const { status, resolution, severity } = req.body;
  if (severity) inc.severity = severity;
  if (status) {
    inc.status = status;
    inc.resolvedAt = status === 'resolved' ? new Date() : undefined;
  }
  if (resolution !== undefined) inc.resolution = resolution;
  await inc.save();
  res.json(await populate(Incident.findById(inc._id)));
});

exports.deleteIncident = asyncHandler(async (req, res) => {
  const inc = await Incident.findByIdAndDelete(req.params.id);
  if (!inc) {
    res.status(404);
    throw new Error('Incident not found');
  }
  res.json({ message: 'Incident deleted' });
});
