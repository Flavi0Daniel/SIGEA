const GradeRepository = require('../repositories/GradeRepository');
const EnrollmentRepository = require('../repositories/EnrollmentRepository');

class GradeService {

  async addGrade(data, instructorId) {
    const enrollment = await EnrollmentRepository.findById(data.enrollment_id);
    if (!enrollment) throw new Error('Inscrição não encontrada');
    if (enrollment.status !== 'active') {
      throw new Error('Só é possível lançar notas para inscrições activas');
    }

    // Valida nota (escala angolana 0-20)
    const grade = parseFloat(data.grade);
    if (isNaN(grade) || grade < 0 || grade > 20) {
      throw new Error('Nota inválida. Deve ser entre 0 e 20');
    }

    // Valida percentagem de assiduidade (opcional)
    let attendance = null;
    if (data.attendance_percentage !== undefined && data.attendance_percentage !== null) {
      attendance = parseFloat(data.attendance_percentage);
      if (isNaN(attendance) || attendance < 0 || attendance > 100) {
        throw new Error('Percentagem de assiduidade inválida. Deve ser entre 0 e 100');
      }
    }

    return GradeRepository.create({
      enrollment_id: data.enrollment_id,
      grade,
      attendance_percentage: attendance,
      observations: data.observations || null
    });
  }

  async updateGrade(gradeId, data, requestingUser) {
    const grade = await GradeRepository.findById(gradeId);
    if (!grade) throw new Error('Nota não encontrada');

    // Só instructor ou admin pode editar
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'instructor') {
      throw new Error('Sem permissão para editar esta nota');
    }

    const newGrade = parseFloat(data.grade);
    if (isNaN(newGrade) || newGrade < 0 || newGrade > 20) {
      throw new Error('Nota inválida. Deve ser entre 0 e 20');
    }

    let attendance = null;
    if (data.attendance_percentage !== undefined && data.attendance_percentage !== null) {
      attendance = parseFloat(data.attendance_percentage);
      if (isNaN(attendance) || attendance < 0 || attendance > 100) {
        throw new Error('Percentagem de assiduidade inválida');
      }
    }

    return GradeRepository.update(gradeId, {
      grade: newGrade,
      attendance_percentage: attendance,
      observations: data.observations || null
    });
  }

  async deleteGrade(gradeId, requestingUser) {
    const grade = await GradeRepository.findById(gradeId);
    if (!grade) throw new Error('Nota não encontrada');

    if (requestingUser.role !== 'admin') {
      throw new Error('Apenas administradores podem eliminar notas');
    }

    await GradeRepository.delete(gradeId);
    return { message: 'Nota eliminada com sucesso' };
  }

  async getGradesByEnrollment(enrollmentId) {
    return GradeRepository.findByEnrollmentId(enrollmentId);
  }

  async getGradesByStudentAndClass(studentId, classId) {
    const grades = await GradeRepository.findByStudentAndClass(studentId, classId);
    const average = await GradeRepository.getAverageByStudentAndClass(studentId, classId);
    return { grades: grades.map(g => g.toJSON()), average };
  }

  async getGradesByClass(classId) {
    const grades = await GradeRepository.findByClassId(classId);
    return grades.map(g => g.toJSON());
  }
}

module.exports = new GradeService();