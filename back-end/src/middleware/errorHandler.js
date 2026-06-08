/**
 * errorHandler.js
 * Middleware global de tratamento de erros.
 * Deve ser registado DEPOIS de todas as rotas no server.js.
 */

function errorHandler(err, req, res, next) {
  // Log completo no servidor
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error(err.stack || err.message);

  // Erros de validação do express-validator ou semelhantes
  if (err.type === 'validation') {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos',
      errors: err.errors
    });
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }

  // Erros de violação de constraint na BD (ex: email duplicado)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Registo duplicado. Verifique os dados e tente novamente.'
    });
  }

  // Erros de referência FK na BD
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referência inválida. O recurso relacionado não existe.'
    });
  }

  // Erros conhecidos lançados pelos services (new Error('mensagem'))
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }

  // Erro genérico (não expõe detalhes internos em produção)
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message || 'Erro interno do servidor';

  res.status(statusCode).json({ success: false, message });
}

module.exports = errorHandler;