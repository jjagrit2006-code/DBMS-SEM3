const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDatabase } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables reliably regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-vortex-user-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Mount Routes
app.use('/api/health', require('./routes/health.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/stations', require('./routes/station.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/cafe', require('./routes/cafe.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/payroll', require('./routes/payroll.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    brand: 'VORTEX LOUNGE',
    service: 'Esports Lounge & Gaming Café Management API',
    status: 'ACTIVE',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/stations',
      '/api/sessions',
      '/api/bookings',
      '/api/wallet',
      '/api/cafe',
      '/api/staff',
      '/api/payroll',
      '/api/reports'
    ]
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  VORTEX LOUNGE API GATEWAY RUNNING ON PORT ${PORT} `);
    console.log(`  Health Check: http://localhost:${PORT}/api/health    `);
    console.log(`======================================================\n`);
  });
}

startServer();
