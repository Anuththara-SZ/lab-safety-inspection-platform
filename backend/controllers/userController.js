const User = require('../models/User');
const Lab = require('../models/Lab');
const Inspection = require('../models/Inspection');
const Incident = require('../models/Incident');
const asyncHandler = require('../utils/asyncHandler');

exports.listUsers = asyncHandler(async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  res.json(await User.find(filter).sort('name'));
});

// Lightweight list for dropdowns (admin + inspector)
exports.listStaff = asyncHandler(async (req, res) => {
  res.json(await User.find({ role: { $in: ['admin', 'inspector'] } }).select('name role').sort('name'));
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

exports.updateRole = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    res.status(400);
    throw new Error('You cannot change your own role');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  // Safe delete: keep the audit trail intact
  const [inspections, incidents, labs] = await Promise.all([
    Inspection.countDocuments({ inspector: user._id }),
    Incident.countDocuments({ reportedBy: user._id }),
    Lab.countDocuments({ manager: user._id }),
  ]);
  if (inspections || incidents || labs) {
    res.status(409);
    throw new Error(
      `Cannot delete ${user.name}: linked to ${inspections} inspection(s), ${incidents} incident(s) and ${labs} lab(s). Reassign them first.`
    );
  }
  await user.deleteOne();
  res.json({ message: 'User deleted' });
});
