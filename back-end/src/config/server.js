require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// ─── Rotas ────────────────────────────────────────────────────────────────────
const authRoutes        = require('../routes/auth');
const userRoutes        = require('../routes/users');
const courseRoutes      = require('../routes/courses');
const classRoutes       = require('../routes/classes');
const enrollmentRoutes  = require('../routes/enrollments');
const gradeRoutes       = require('../routes/grades');
const paymentRoutes     = require('../routes/payments');
const certificateRoutes = require('../routes/certificates');

// ─── Middleware global ────────────────────────────────────────────────────────
const errorHandler = require('../middleware/errorHandler');

const app = express();

// Segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logs HTTP
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parse de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ficheiros estáticos
app.use('/certificates', express.static(path.join(__dirname, '../../certificates')));
app.use('/uploads',      express.static(path.join(__dirname, '../../uploads')));

// ─── Rotas da API ─────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/courses',      courseRoutes);
app.use('/api/classes',      classRoutes);
app.use('/api/enrollments',  enrollmentRoutes);
app.use('/api/grades',       gradeRoutes);
app.use('/api/payments',     paymentRoutes);
app.use('/api/certificates', certificateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    system: 'SIGEA',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// ─── Tratamento global de erros ───────────────────────────────────────────────
app.use(errorHandler);

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 SIGEA API a correr na porta ${PORT}`);
  console.log(`   Ambiente  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health    : http://localhost:${PORT}/api/health\n`);
});

module.exports = app;