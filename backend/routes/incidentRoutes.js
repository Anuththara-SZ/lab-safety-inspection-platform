const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/incidentController');

router.use(protect);
router.get('/', c.listIncidents);
router.post(
  '/',
  [
    body('lab').isMongoId().withMessage('Select a laboratory'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  ],
  validate,
  c.createIncident
);
router.put(
  '/:id',
  authorize('admin', 'inspector'),
  [body('status').optional().isIn(['open', 'investigating', 'resolved']), body('severity').optional().isIn(['low', 'medium', 'high', 'critical'])],
  validate,
  c.updateIncident
);
router.delete('/:id', authorize('admin'), c.deleteIncident);

module.exports = router;
