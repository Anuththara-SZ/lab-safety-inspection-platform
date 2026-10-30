const Template = require('../models/Template');
const asyncHandler = require('../utils/asyncHandler');

const notFound = (res) => {
  res.status(404);
  throw new Error('Template not found');
};

exports.listTemplates = asyncHandler(async (req, res) => res.json(await Template.find().sort('title')));

exports.getTemplate = asyncHandler(async (req, res) => {
  const t = await Template.findById(req.params.id);
  if (!t) notFound(res);
  res.json(t);
});

exports.createTemplate = asyncHandler(async (req, res) => {
  res.status(201).json(await Template.create({ ...req.body, createdBy: req.user._id }));
});

exports.updateTemplate = asyncHandler(async (req, res) => {
  const t = await Template.findById(req.params.id);
  if (!t) notFound(res);
  ['title', 'description', 'items'].forEach((k) => {
    if (req.body[k] !== undefined) t[k] = req.body[k];
  });
  await t.save(); // runs validators
  res.json(t);
});

exports.deleteTemplate = asyncHandler(async (req, res) => {
  const t = await Template.findByIdAndDelete(req.params.id);
  if (!t) notFound(res);
  res.json({ message: 'Template deleted' });
});
