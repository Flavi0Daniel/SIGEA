// Este serviço cuida de toda a lógica de autenticação
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');

class AuthService {
    // Registar novo usuário
    async register(userData) {
        // Verificar se o email já existe
        const existingUser = await UserRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email já está em uso');
        }

        // Encriptar a senha
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Criar usuário
        const newUser = await UserRepository.create({
            ...userData,
            password: hashedPassword
        });

        // Gerar token JWT
        const token = this.generateToken(newUser.id);

        return {
            user: newUser.toJSON(), // Remove a senha do retorno
            token
        };
    }

    // Fazer login
    async login(email, password) {
        // Buscar usuário
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Credenciais inválidas');
        }

        // Gerar token
        const token = this.generateToken(user.id);

        return {
            user: user.toJSON(),
            token
        };
    }

    // Gerar token JWT
    generateToken(userId) {
        return jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }
}

module.exports = new AuthService();