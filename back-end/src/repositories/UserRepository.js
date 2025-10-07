// Este repositório é responsável por todas as operações com usuários na BD
const db = require('../config/database');
const User = require('../models/User');

class UserRepository {
    // Buscar usuário por email (para login)
    async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
            [email]
        );
        return rows.length > 0 ? new User(rows[0]) : null;
    }

    // Criar novo usuário
    async create(userData) {
        const [result] = await db.execute(`
            INSERT INTO users (name, email, password, phone, role, avatar) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userData.name, userData.email, userData.password, userData.phone, userData.role, userData.avatar]);
        
        return this.findById(result.insertId);
    }

    // Buscar usuário por ID
    async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
            [id]
        );
        return rows.length > 0 ? new User(rows[0]) : null;
    }

    // Outros métodos: update, delete, findAll, etc.
}

module.exports = new UserRepository();