const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/templateController');

const rules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one checklist item is required'),
  body('items.*.text').trim().notEmpty().withMessage('Checklist item text is required'),
];

router.use(protect);
router.get('/', c.listTemplates);
router.get('/:id', c.getTemplate);
router.post('/', authorize('admin'), rules, validate, c.createTemplate);
router.put('/:id', authorize('admin'), rules, validate, c.updateTemplate);
router.delete('/:id', authorize('admin'), c.deleteTemplate);

module.exports = router;
