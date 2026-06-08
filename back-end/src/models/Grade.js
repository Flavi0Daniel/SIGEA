class Grade {
  constructor(data) {
    this.id = data.id;
    this.enrollment_id = data.enrollment_id;
    this.grade = data.grade !== undefined ? parseFloat(data.grade) : null; // 0-20
    this.attendance_percentage = data.attendance_percentage !== undefined
      ? parseFloat(data.attendance_percentage)
      : null;
    this.observations = data.observations || null;
    this.evaluation_date = data.evaluation_date;
    // Campo extra vindo de JOIN
    this.student_name = data.student_name || null;
  }

  // Classificação na escala angolana (0-20)
  getClassification() {
    const g = this.grade;
    if (g === null) return null;
    if (g >= 18) return 'Muito Bom';
    if (g >= 14) return 'Bom';
    if (g >= 10) return 'Satisfatório';
    return 'Insatisfatório';
  }

  isPassing() {
    return this.grade !== null && this.grade >= 10;
  }

  toJSON() {
    return {
      ...this,
      classification: this.getClassification(),
      passing: this.isPassing()
    };
  }
}

module.exports = Grade;