const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/inspectionController');

router.use(protect);
router.get('/', c.listInspections);
router.get('/:id', c.getInspection);
router.post(
  '/',
  authorize('admin', 'inspector'),
  [body('lab').isMongoId().withMessage('Select a laboratory'), body('template').isMongoId().withMessage('Select a template')],
  validate,
  c.createInspection
);
router.put('/:id/submit', authorize('admin', 'inspector'), c.submitInspection);
router.delete('/:id', authorize('admin'), c.deleteInspection);

module.exports = router;
