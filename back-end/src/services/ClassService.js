const ClassRepository = require('../repositories/ClassRepository');
const CourseRepository = require('../repositories/CourseRepository');

class ClassService {

  async getAll() {
    return ClassRepository.findAll();
  }

  async getActive() {
    return ClassRepository.findActive();
  }

  async getById(id) {
    const turma = await ClassRepository.findById(id);
    if (!turma) throw new Error('Turma não encontrada');
    return turma;
  }

  async getByCourse(courseId) {
    const course = await CourseRepository.findById(courseId);
    if (!course) throw new Error('Curso não encontrado');
    return ClassRepository.findByCourse(courseId);
  }

  async getByInstructor(instructorId) {
    return ClassRepository.findByInstructor(instructorId);
  }

  async create(data) {
    // Verifica se o curso existe
    const course = await CourseRepository.findById(data.course_id);
    if (!course) throw new Error('Curso não encontrado');
    if (!course.is_active) throw new Error('Não é possível criar turma para um curso inactivo');

    return ClassRepository.create(data);
  }

  async update(id, data) {
    const turma = await ClassRepository.findById(id);
    if (!turma) throw new Error('Turma não encontrada');

    // Não permite mudar o curso de uma turma já existente
    if (data.course_id && data.course_id !== turma.course_id) {
      throw new Error('Não é possível alterar o curso de uma turma existente');
    }

    return ClassRepository.update(id, data);
  }

  async setActive(id, isActive) {
    const turma = await ClassRepository.findById(id);
    if (!turma) throw new Error('Turma não encontrada');
    return ClassRepository.setActive(id, isActive);
  }

  async assignInstructor(classId, instructorId) {
    const turma = await ClassRepository.findById(classId);
    if (!turma) throw new Error('Turma não encontrada');
    return ClassRepository.update(classId, { instructor_id: instructorId });
  }

  async delete(id) {
    const turma = await ClassRepository.findById(id);
    if (!turma) throw new Error('Turma não encontrada');
    await ClassRepository.delete(id);
    return { message: 'Turma eliminada com sucesso' };
  }
}

module.exports = new ClassService();