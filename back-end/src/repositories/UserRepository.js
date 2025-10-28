// Este repositório é responsável por todas as operações com usuários na BD
const db = require('../config/database');
const User = require('../models/User');

class UserRepository {
    // Buscar usuário por email (para login)
    async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM tbl_user WHERE email = ? AND is_active = TRUE',
            [email]
        );
        return rows.length > 0 ? new User(rows[0]) : null;
    }

    // Criar novo usuário
    async create(userData) {
        const [result] = await db.execute(`
            INSERT INTO tbl_user (name, email, password, phone, role, avatar) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userData.name, userData.email, userData.password, userData.phone, userData.role, userData.avatar]);
        
        return this.findById(result.insertId);
    }

    // Buscar usuário por ID
    async findById(id) {
        const [rows] = await db.execute(
          'SELECT * FROM tbl_user WHERE id = ?',
          [id]
        );
        return rows[0] ? new User(rows[0]) : null;
    }
      

    // Outros métodos: update, delete, findAll, etc.

    // Buscar todos os usuários ativos
    async findAll() {
        const [rows] = await db.execute(
            'SELECT * FROM tbl_user WHERE is_active = TRUE'
        );
        return rows.map(row => new User(row));
    }


    async update(id, { name, phone, avatar }) {
        await db.execute(
          'UPDATE tbl_user SET name = ?, phone = ?, avatar = ? WHERE id = ? AND is_active = TRUE',
          [name, phone, avatar, id]
        );
      
        return this.findById(id);
    }

    async updatePassword(id, hashedPassword) {
        await db.execute(
          'UPDATE tbl_user SET password = ? WHERE id = ? AND is_active = TRUE',
          [hashedPassword, id]
        );
    }

    async deactivate(id) {
        await db.execute(
          'UPDATE tbl_user SET is_active = FALSE WHERE id = ?',
          [id]
        );
    }

    async reactivate(id) {
        await db.execute(
          'UPDATE tbl_user SET is_active = TRUE WHERE id = ?',
          [id]
        );
    }
      
      
      
      
}

module.exports = new UserRepository();