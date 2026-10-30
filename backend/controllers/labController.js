const Lab = require('../models/Lab');
const Inspection = require('../models/Inspection');
const Incident = require('../models/Incident');
const sortBy = require('../utils/sort');
const asyncHandler = require('../utils/asyncHandler');

const notFound = (res) => {
  res.status(404);
  throw new Error('Laboratory not found');
};

exports.listLabs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.hazardLevel) filter.hazardLevel = req.query.hazardLevel;
  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { code: rx }, { building: rx }];
  }
  const sort = sortBy(req.query, ['code', 'name', 'building', 'lastScore', 'lastInspectionDate', 'createdAt'], 'code');
  res.json(await Lab.find(filter).populate('manager', 'name').sort(sort));
});

exports.getLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id).populate('manager', 'name email');
  if (!lab) notFound(res);
  res.json(lab);
});

exports.createLab = asyncHandler(async (req, res) => {
  res.status(201).json(await Lab.create(req.body));
});

exports.updateLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!lab) notFound(res);
  res.json(lab);
});

exports.deleteLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) notFound(res);
  // Safe delete: refuse if other records depend on this lab
  const [inspections, incidents] = await Promise.all([
    Inspection.countDocuments({ lab: lab._id }),
    Incident.countDocuments({ lab: lab._id }),
  ]);
  if (inspections || incidents) {
    res.status(409);
    throw new Error(
      `Cannot delete ${lab.code}: it has ${inspections} inspection(s) and ${incidents} incident(s). Set its status to 'closed' instead.`
    );
  }
  await lab.deleteOne();
  res.json({ message: 'Laboratory deleted' });
});
