require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const groupRoutes = require('./routes/groupRoutes');
const startReminderJob = require('./utils/reminderJob');

const app = express();
const configuredOrigins = [process.env.CLIENT_URL, ...(process.env.CLIENT_URLS || '').split(',')]
  .map(value => value?.trim())
  .filter(Boolean)
  .map(value => {
    try { return new URL(value).origin; } catch { return value; }
  });
const ALLOWED_ORIGINS = new Set(configuredOrigins.length
  ? configuredOrigins
  : ['http://localhost:5173', 'http://127.0.0.1:5173']);

function isAllowedDevelopmentOrigin(url) {
  if (process.env.NODE_ENV === 'production') return false;

  const hostname = url.hostname.toLowerCase();
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '::1'
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Non-browser clients such as curl do not send an Origin header.
    if (!origin) return callback(null, true);
    try {
      const url = new URL(origin);
      if (ALLOWED_ORIGINS.has(url.origin) || isAllowedDevelopmentOrigin(url)) {
        return callback(null, true);
      }
    } catch { /* Invalid origins are denied below. */ }

    const error = new Error(`Origin ${origin} is not allowed by CORS`);
    error.status = 403;
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'ResolveOps API' }));
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/groups', groupRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error.' });
});

const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  startReminderJob();
}).catch(err => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});
