class Enrollment {
  constructor(data) {
    this.id = data.id;
    this.student_id = data.student_id;
    this.class_id = data.class_id;
    this.status = data.status || 'pending';         // pending | active | completed | cancelled
    this.payment_status = data.payment_status || 'pending'; // pending | paid | overdue
    this.enrollment_date = data.enrollment_date;
    // Campos extra vindos de JOINs (opcionais)
    this.class_name = data.class_name || null;
    this.course_name = data.course_name || null;
    this.student_name = data.student_name || null;
    this.student_email = data.student_email || null;
    this.student_phone = data.student_phone || null;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Enrollment;