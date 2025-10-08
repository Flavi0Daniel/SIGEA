const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcrypt');

class UserController {
  async getProfile(req, res) {
    const user = await UserRepository.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, data: user.toJSON() });
  }

  async listAllUsers(req, res) {
    try {
      const users = await UserRepository.findAll();
      const formatted = users.map(user => {
        return typeof user.toJSON === 'function' ? user.toJSON() : user;
      });
  
      res.json({ success: true, data: formatted });
    } catch (err) {
      console.error('Erro ao listar usuários:', err);
      res.status(500).json({ success: false, message: 'Erro interno ao listar usuários' });
    }
  }
  
  async updateProfile(req, res) {
    const { name, phone, avatar } = req.body;

    try {
      const updatedUser = await UserRepository.update(req.user.id, { name, phone, avatar });
      res.json({ success: true, data: updatedUser.toJSON() });
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      res.status(500).json({ success: false, message: 'Erro ao atualizar perfil' });
    }
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    try {
      const user = await UserRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Senha atual incorreta' });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await UserRepository.updatePassword(req.user.id, hashed);

      res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      res.status(500).json({ success: false, message: 'Erro ao alterar senha' });
    }
  }

  async deactivateUser(req, res) {
    const userId = parseInt(req.params.id);

    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      await UserRepository.deactivate(userId);
      res.json({ success: true, message: 'Usuário desativado com sucesso' });
    } catch (err) {
      console.error('Erro ao desativar usuário:', err);
      res.status(500).json({ success: false, message: 'Erro ao desativar usuário' });
    }
  }

  async createUser(req, res) {
    const { name, email, password, phone, role, avatar } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await UserRepository.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        avatar: avatar || 'default.png'
      });

      res.status(201).json({ success: true, data: newUser.toJSON() });
    } catch (err) {
      console.error('Erro ao criar usuário:', err); // <-- isso já está certo
      res.status(500).json({ success: false, message: err.message || 'Erro ao criar usuário' });
    }    
  }

  async reactivateUser(req, res) {
    const userId = parseInt(req.params.id);

    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      await UserRepository.reactivate(userId);
      res.json({ success: true, message: 'Usuário reativado com sucesso' });
    } catch (err) {
      console.error('Erro ao reativar usuário:', err);
      res.status(500).json({ success: false, message: 'Erro ao reativar usuário' });
    }
  }

}

module.exports = new UserController();
