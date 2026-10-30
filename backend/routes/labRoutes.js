const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/labController');

const rules = [
  body('name').trim().notEmpty().withMessage('Lab name is required'),
  body('code').trim().notEmpty().withMessage('Lab code is required'),
  body('building').trim().notEmpty().withMessage('Building is required'),
  body('hazardLevel').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['active', 'inactive', 'closed']),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
];

router.use(protect);
router.get('/', c.listLabs);
router.get('/:id', c.getLab);
router.post('/', authorize('admin'), rules, validate, c.createLab);
router.put('/:id', authorize('admin'), rules, validate, c.updateLab);
router.delete('/:id', authorize('admin'), c.deleteLab);

module.exports = router;
