
import express from 'express';
import cors from 'cors';
import security from './middleware/security.middleware.js';
import config from './config/app.config.js';
import routes from './routes/user.routes.js';
import errorHandler from './middleware/error-handler.middleware.js';
import { AppError } from './utils/errors.util.js';

const app = express();

// Security
app.use(security.helmet);
app.use(security.mongoSanitize);
app.use(security.xss);
app.use(security.hpp);

// Rate limiting
app.use('/api', security.limiter);
app.use('/api/auth', security.authLimiter);

// CORS
app.use(cors(config.cors));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Error handler
app.use(errorHandler);

module.exports = app;
