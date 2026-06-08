class Certificate {
  constructor(data) {
    this.id = data.id;
    this.enrollment_id = data.enrollment_id;
    this.certificate_number = data.certificate_number;
    this.issue_date = data.issue_date;
    this.pdf_path = data.pdf_path || null;
    this.whatsapp_sent = !!data.whatsapp_sent;
    this.whatsapp_sent_at = data.whatsapp_sent_at || null;
    // Campos extra vindos de JOINs
    this.course_name = data.course_name || null;
    this.class_name = data.class_name || null;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Certificate;