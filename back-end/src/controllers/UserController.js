const UserRepository = require('../repositories/UserRepository');

class UserController {
  async getProfile(req, res) {
    const user = await UserRepository.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, data: user.toJSON() });
  }
}

module.exports = new UserController();
