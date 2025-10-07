// Define as rotas de autenticação
const express = require('express');
const AuthController = require('../controllers/AuthController');
const { validateRegister, validateLogin } = require('../middleware/validation');


const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRegister, AuthController.register);

// POST /api/auth/login
router.post('/login', validateLogin, AuthController.login);

// GET /api/auth/ping
router.get('/ping', (req, res) => {
    res.json({ success: true, message: 'API de autenticação está viva!' });
  });

module.exports = router;