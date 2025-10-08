const express = require('express');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const UserController = require('../controllers/UserController');

const router = express.Router();

// Rota protegida para perfil do usuário
router.get('/me', verifyToken, UserController.getProfile);

// Rota protegida por token e role
router.get('/all', verifyToken, checkRole('admin'), UserController.listAllUsers);


router.put('/me', verifyToken, UserController.updateProfile);


router.put('/me/password', verifyToken, UserController.changePassword);


router.put('/:id/deactivate', verifyToken, checkRole('admin'), UserController.deactivateUser);


router.post('/create', verifyToken, checkRole('admin'), UserController.createUser);


router.put('/:id/reactivate', verifyToken, checkRole('admin'), UserController.reactivateUser);


module.exports = router;
