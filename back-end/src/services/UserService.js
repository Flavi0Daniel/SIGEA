const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcryptjs');

class UserService {

  async getAll() {
    return UserRepository.findAll();
  }

  async getById(id) {
    const user = await UserRepository.findById(id);
    if (!user) throw new Error('Utilizador não encontrado');
    return user;
  }

  async update(id, data, requestingUser) {
    // Aluno só pode editar o seu próprio perfil
    if (requestingUser.role !== 'admin' && requestingUser.id !== id) {
      throw new Error('Sem permissão para editar este perfil');
    }

    // Aluno não pode alterar o seu próprio role
    if (requestingUser.role !== 'admin' && data.role) {
      delete data.role;
    }

    // Verifica email duplicado se vier novo email
    if (data.email) {
      const existing = await UserRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new Error('Este email já está em uso');
      }
    }

    const updated = await UserRepository.update(id, data);
    if (!updated) throw new Error('Utilizador não encontrado');
    return updated;
  }

  async changePassword(id, currentPassword, newPassword) {
    const user = await UserRepository.findById(id);
    if (!user) throw new Error('Utilizador não encontrado');

    // Precisamos da password hash — busca com campo sensível
    const userWithPass = await UserRepository.findByEmail(user.email);
    const valid = await bcrypt.compare(currentPassword, userWithPass.password);
    if (!valid) throw new Error('Password actual incorrecta');

    const hashed = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(id, hashed);
    return { message: 'Password alterada com sucesso' };
  }

  async deactivate(id, requestingUser) {
    if (requestingUser.role !== 'admin') {
      throw new Error('Apenas administradores podem desactivar contas');
    }
    if (requestingUser.id === id) {
      throw new Error('Não pode desactivar a sua própria conta');
    }
    const updated = await UserRepository.setActive(id, false);
    if (!updated) throw new Error('Utilizador não encontrado');
    return { message: 'Conta desactivada com sucesso' };
  }

  async activate(id) {
    const updated = await UserRepository.setActive(id, true);
    if (!updated) throw new Error('Utilizador não encontrado');
    return { message: 'Conta activada com sucesso' };
  }

  async delete(id, requestingUser) {
    if (requestingUser.role !== 'admin') {
      throw new Error('Apenas administradores podem eliminar contas');
    }
    if (requestingUser.id === id) {
      throw new Error('Não pode eliminar a sua própria conta');
    }
    await UserRepository.delete(id);
    return { message: 'Utilizador eliminado com sucesso' };
  }

  async getByRole(role) {
    return UserRepository.findByRole(role);
  }
}

module.exports = new UserService();