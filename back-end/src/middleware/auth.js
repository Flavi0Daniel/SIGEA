const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
    }

    req.user = user; // Agora o req.user tem o role, email, etc.
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
  }
}

module.exports = verifyToken;
