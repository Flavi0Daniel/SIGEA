const EnrollmentRepository = require('../repositories/EnrollmentRepository');
const ClassRepository      = require('../repositories/ClassRepository');
const AppyPayService       = require('./AppyPayService');

class EnrollmentService {

  async enroll(studentId, classId) {
    // 1. Verifica se a turma existe e está activa
    const turma = await ClassRepository.findById(classId);
    if (!turma || !turma.is_active) {
      throw new Error('Turma não encontrada ou inactiva');
    }

    // 2. Verifica matrícula duplicada
    const existing = await EnrollmentRepository.findByStudentAndClass(studentId, classId);
    if (existing && ['pending', 'active'].includes(existing.status)) {
      throw new Error('Já existe uma inscrição activa nesta turma');
    }

    // 3. Verifica capacidade
    const count = await EnrollmentRepository.countActiveInClass(classId);
    if (turma.max_students && count >= turma.max_students) {
      throw new Error('Turma sem vagas disponíveis');
    }

    // 4. Cria a inscrição
    const enrollment = await EnrollmentRepository.create({ student_id: studentId, class_id: classId });

    // 5. Gera cobrança na AppyPay / simulador
    const payment = await AppyPayService.createPaymentForEnrollment(enrollment);

    return { enrollment, payment };
  }

  async activate(enrollmentId) {
    const enrollment = await EnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw new Error('Inscrição não encontrada');
    await EnrollmentRepository.updateStatus(enrollmentId, 'active');
    await EnrollmentRepository.updatePaymentStatus(enrollmentId, 'paid');
    return EnrollmentRepository.findById(enrollmentId);
  }

  async cancel(enrollmentId, requestingUserId, requestingRole) {
    const enrollment = await EnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw new Error('Inscrição não encontrada');
    if (requestingRole !== 'admin' && enrollment.student_id !== requestingUserId) {
      throw new Error('Sem permissão para cancelar esta inscrição');
    }
    return EnrollmentRepository.updateStatus(enrollmentId, 'cancelled');
  }

  async complete(enrollmentId) {
    const enrollment = await EnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw new Error('Inscrição não encontrada');
    if (enrollment.status !== 'active') {
      throw new Error('Só inscrições activas podem ser concluídas');
    }
    return EnrollmentRepository.markCompleted(enrollmentId);
  }

  async getMyEnrollments(studentId) {
    return EnrollmentRepository.findByStudentId(studentId);
  }

  async getClassEnrollments(classId) {
    return EnrollmentRepository.findByClassId(classId);
  }

  async getAllEnrollments() {
    return EnrollmentRepository.findAll();
  }
}

module.exports = new EnrollmentService();