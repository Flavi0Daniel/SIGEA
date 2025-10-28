require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Inicializa o Express
const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const courseRoutes = require('../routes/courses');
const classRoutes = require('../routes/classes');

// ... outras rotas

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classes', classRoutes);

// ... outras rotas

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
