const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendAuth = (res, user, status = 200) =>
  res.status(status).json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });

// POST /api/auth/register  (self-registration always creates a 'technician')
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    res.status(409);
    throw new Error('Email already registered');
  }
  const user = await User.create({ name, email, password, role: 'technician' });
  sendAuth(res, user, 201);
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  sendAuth(res, user);
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role });
});
