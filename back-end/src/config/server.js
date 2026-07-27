require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

// ─── Rotas ────────────────────────────────────────────────────
const authRoutes        = require('../routes/auth');
const userRoutes        = require('../routes/users');
const courseRoutes      = require('../routes/courses');
const classRoutes       = require('../routes/classes');
const enrollmentRoutes  = require('../routes/enrollments');
const gradeRoutes       = require('../routes/grades');
const paymentRoutes     = require('../routes/payments');
const certificateRoutes = require('../routes/certificates');

// ─── Simulador AppyPay (apenas em desenvolvimento) ────────────
const appypaySimulator  = require('../simulator/appypay');

const errorHandler = require('../middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/certificates', express.static(path.join(__dirname, '../../certificates')));
app.use('/uploads',      express.static(path.join(__dirname, '../../uploads')));

// ─── Rotas da API ─────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/courses',      courseRoutes);
app.use('/api/classes',      classRoutes);
app.use('/api/enrollments',  enrollmentRoutes);
app.use('/api/grades',       gradeRoutes);
app.use('/api/payments',     paymentRoutes);
app.use('/api/certificates', certificateRoutes);

// Simulador AppyPay — desactivar em produção
if (process.env.NODE_ENV !== 'production') {
  app.use('/simulator', appypaySimulator);
  console.log('🧪 Simulador AppyPay activo em /simulator');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    system: 'SIGEA',
    environment: process.env.NODE_ENV || 'development',
    simulator: process.env.NODE_ENV !== 'production',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 SIGEA API a correr na porta ${PORT}`);
  console.log(`   Ambiente  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health    : http://localhost:${PORT}/api/health\n`);
});

module.exports = app;