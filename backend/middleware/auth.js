const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Authentication: verifies the Bearer token and loads the user
exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) {
    res.status(401);
    throw new Error('Not authenticated: token missing');
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Not authenticated: invalid or expired token');
  }
  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error('User no longer exists');
  }
  req.user = user;
  next();
});

// Authorization: restricts a route to the given roles
exports.authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role '${req.user.role}' is not allowed to perform this action`));
    }
    next();
  };
