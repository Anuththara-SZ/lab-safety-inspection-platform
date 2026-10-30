const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Rate limiting: general API + stricter limit on auth endpoints (brute-force protection)
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: { message: 'Too many attempts, try again later' } }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/labs', require('./routes/labRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/inspections', require('./routes/inspectionRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
