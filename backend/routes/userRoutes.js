const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/userController');

router.use(protect);
router.get('/staff', authorize('admin', 'inspector'), c.listStaff);

router.use(authorize('admin'));
router.get('/', c.listUsers);
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'inspector', 'technician']).withMessage('Invalid role'),
  ],
  validate,
  c.createUser
);
router.put('/:id/role', [body('role').isIn(['admin', 'inspector', 'technician']).withMessage('Invalid role')], validate, c.updateRole);
router.delete('/:id', c.deleteUser);

module.exports = router;
