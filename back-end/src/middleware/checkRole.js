function checkRole(...allowedRoles) {
    return (req, res, next) => {
      const userRole = req.user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado: permissão insuficiente'
        });
      }
      next();
    };
  }
  
  module.exports = checkRole;
  