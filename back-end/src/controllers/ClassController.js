const ClassRepository = require('../repositories/ClassRepository');

class ClassController {
  async create(req, res) {
    const { course_id, instructor_id, name, start_date, end_date, max_students, schedule } = req.body;

    try {
      const turma = await ClassRepository.create({
        course_id,
        instructor_id,
        name,
        start_date,
        end_date,
        max_students,
        schedule
      });

      res.status(201).json({ success: true, data: turma.toJSON() });
    } catch (err) {
      console.error('Erro ao criar turma:', err);
      res.status(500).json({ success: false, message: 'Erro ao criar turma' });
    }
  }

  //async list(req, res) {
    //try {
      //const turmas = await ClassRepository.findAllActive();
     // res.json({ success: true, data: turmas.map(t => t.toJSON()) });
    //} catch (err) {
     // res.status(500).json({ success: false, message: 'Erro ao listar turmas' });
   // }
  //}

  async list(req, res) {
    try {
      let turmas;
  
      if (req.user.role === 'admin') {
        turmas = await ClassRepository.findAllActive();
      } else if (req.user.role === 'instructor') {
        turmas = await ClassRepository.findByInstructorId(req.user.id);
      } else {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }
  
      res.json({ success: true, data: turmas.map(t => t.toJSON()) });
    } catch (err) {
      console.error('Erro ao listar turmas:', err);
      res.status(500).json({ success: false, message: 'Erro ao listar turmas' });
    }
  }
  

  async update(req, res) {
    const id = parseInt(req.params.id);
    const { course_id, instructor_id, name, start_date, end_date, max_students, schedule } = req.body;

    try {
      const updated = await ClassRepository.update(id, {
        course_id,
        instructor_id,
        name,
        start_date,
        end_date,
        max_students,
        schedule
      });

      res.json({ success: true, data: updated.toJSON() });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar turma' });
    }
  }

  async deactivate(req, res) {
    const id = parseInt(req.params.id);

    try {
      await ClassRepository.deactivate(id);
      res.json({ success: true, message: 'Turma desativada com sucesso' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erro ao desativar turma' });
    }
  }

  async reactivate(req, res) {
    const id = parseInt(req.params.id);

    try {
      await ClassRepository.reactivate(id);
      res.json({ success: true, message: 'Turma reativada com sucesso' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erro ao reativar turma' });
    }
  }
}

module.exports = new ClassController();
