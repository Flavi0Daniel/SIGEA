// Este controlador gere as rotas de autenticação
const AuthService = require('../services/AuthService');

class AuthController {
    // POST /api/auth/register
    async register(req, res) {
        try {
            const result = await AuthService.register(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Usuário registado com sucesso',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            
            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AuthController();