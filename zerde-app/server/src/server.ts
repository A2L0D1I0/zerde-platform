import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import studentRoutes from './modules/student/student.routes';
import teacherRoutes from './modules/teacher/teacher.routes';
import tutorRoutes from './modules/tutor/tutor.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
import courseRoutes from './modules/courses/course.routes';
import questionRoutes from './modules/questions/question.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Lightweight)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Zerde Intelligent Educational Platform (Clean Feature-Driven MVP)',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Feature-Driven Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/ai', tutorRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Not Found Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Маршрут табылмады (Route not found): ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Zerde Backend API Server running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

export default app;
