const { body, param, query, validationResult } = require('express-validator');

// Middleware que verifica o resultado das validações e devolve 422 se houver erros
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ─── AUTH ────────────────────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim().notEmpty().withMessage('O nome é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
  body('email')
    .trim().notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('A password é obrigatória')
    .isLength({ min: 6 }).withMessage('A password deve ter pelo menos 6 caracteres'),
  body('phone')
    .optional()
    .matches(/^(\+244|244)?9[0-9]{8}$/).withMessage('Número de telefone angolano inválido'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin']).withMessage('Perfil inválido')
];

const loginRules = [
  body('email')
    .trim().notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('A password é obrigatória')
];

// ─── USERS ───────────────────────────────────────────────────────────────────

const updateUserRules = [
  body('name')
    .optional().trim()
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
  body('email')
    .optional().trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^(\+244|244)?9[0-9]{8}$/).withMessage('Número de telefone angolano inválido'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin']).withMessage('Perfil inválido')
];

const changePasswordRules = [
  body('current_password')
    .notEmpty().withMessage('A password actual é obrigatória'),
  body('new_password')
    .notEmpty().withMessage('A nova password é obrigatória')
    .isLength({ min: 6 }).withMessage('A nova password deve ter pelo menos 6 caracteres'),
  body('confirm_password')
    .notEmpty().withMessage('A confirmação é obrigatória')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('As passwords não coincidem');
      }
      return true;
    })
];

// ─── COURSES ─────────────────────────────────────────────────────────────────

const createCourseRules = [
  body('name')
    .trim().notEmpty().withMessage('O nome do curso é obrigatório')
    .isLength({ min: 3, max: 150 }).withMessage('O nome deve ter entre 3 e 150 caracteres'),
  body('description')
    .optional().trim()
    .isLength({ max: 1000 }).withMessage('A descrição não pode exceder 1000 caracteres'),
  body('duration_hours')
    .notEmpty().withMessage('A carga horária é obrigatória')
    .isInt({ min: 1 }).withMessage('A carga horária deve ser um número inteiro positivo'),
  body('price')
    .notEmpty().withMessage('O preço é obrigatório')
    .isFloat({ min: 0 }).withMessage('O preço deve ser um valor positivo'),
  body('category')
    .optional().trim()
    .isLength({ max: 100 }).withMessage('A categoria não pode exceder 100 caracteres')
];

const updateCourseRules = [
  body('name')
    .optional().trim()
    .isLength({ min: 3, max: 150 }).withMessage('O nome deve ter entre 3 e 150 caracteres'),
  body('description')
    .optional().trim()
    .isLength({ max: 1000 }).withMessage('A descrição não pode exceder 1000 caracteres'),
  body('duration_hours')
    .optional()
    .isInt({ min: 1 }).withMessage('A carga horária deve ser um número inteiro positivo'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('O preço deve ser um valor positivo')
];

// ─── CLASSES (TURMAS) ─────────────────────────────────────────────────────────

const createClassRules = [
  body('name')
    .trim().notEmpty().withMessage('O nome da turma é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('O nome deve ter entre 2 e 100 caracteres'),
  body('course_id')
    .notEmpty().withMessage('O curso é obrigatório')
    .isInt({ min: 1 }).withMessage('ID de curso inválido'),
  body('instructor_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de instructor inválido'),
  body('max_students')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('Capacidade deve ser entre 1 e 500'),
  body('start_date')
    .notEmpty().withMessage('A data de início é obrigatória')
    .isISO8601().withMessage('Data de início inválida (use YYYY-MM-DD)'),
  body('end_date')
    .notEmpty().withMessage('A data de fim é obrigatória')
    .isISO8601().withMessage('Data de fim inválida (use YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('A data de fim deve ser posterior à data de início');
      }
      return true;
    })
];

// ─── ENROLLMENTS ─────────────────────────────────────────────────────────────

const enrollRules = [
  body('class_id')
    .notEmpty().withMessage('A turma é obrigatória')
    .isInt({ min: 1 }).withMessage('ID de turma inválido')
];

// ─── GRADES ──────────────────────────────────────────────────────────────────

const createGradeRules = [
  body('enrollment_id')
    .notEmpty().withMessage('A matrícula é obrigatória')
    .isInt({ min: 1 }).withMessage('ID de matrícula inválido'),
  body('assessment_type')
    .notEmpty().withMessage('O tipo de avaliação é obrigatório')
    .isIn(['test', 'assignment', 'final', 'practical']).withMessage('Tipo de avaliação inválido'),
  body('score')
    .notEmpty().withMessage('A nota é obrigatória')
    .isFloat({ min: 0, max: 20 }).withMessage('A nota deve ser entre 0 e 20'),
  body('notes')
    .optional().trim()
    .isLength({ max: 500 }).withMessage('As observações não podem exceder 500 caracteres')
];

const updateGradeRules = [
  body('score')
    .notEmpty().withMessage('A nota é obrigatória')
    .isFloat({ min: 0, max: 20 }).withMessage('A nota deve ser entre 0 e 20'),
  body('notes')
    .optional().trim()
    .isLength({ max: 500 }).withMessage('As observações não podem exceder 500 caracteres')
];

// ─── PARAMS GENÉRICOS ─────────────────────────────────────────────────────────

const idParamRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

module.exports = {
  validate,
  // Auth
  registerRules,
  loginRules,
  // Users
  updateUserRules,
  changePasswordRules,
  // Courses
  createCourseRules,
  updateCourseRules,
  // Classes
  createClassRules,
  // Enrollments
  enrollRules,
  // Grades
  createGradeRules,
  updateGradeRules,
  // Generic
  idParamRules
};