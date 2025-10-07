const express = require('express');
const verifyToken = require('../middleware/auth');
const UserController = require('../controllers/UserController');

const router = express.Router();

// Rota protegida para perfil do usuário
router.get('/me', verifyToken, UserController.getProfile);

module.exports = router;
