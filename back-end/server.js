require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Importar rotas
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
// ... outras rotas

const app = express();

// Middleware de segurança e configuração
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// ... outras rotas

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});