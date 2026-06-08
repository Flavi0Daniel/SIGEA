class Payment {
  constructor(data) {
    this.id = data.id;
    this.enrollment_id = data.enrollment_id;
    this.amount = data.amount;
    this.payment_method = data.payment_method || null; // proxypay | transfer | cash
    this.transaction_id = data.transaction_id || null;
    this.status = data.status || 'pending'; // pending | completed | failed | cancelled
    this.payment_date = data.payment_date || null;
    this.created_at = data.created_at;
    // Campos extra vindos de JOINs
    this.student_name = data.student_name || null;
    this.course_name = data.course_name || null;
    this.class_name = data.class_name || null;
  }

  isPaid() {
    return this.status === 'completed';
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Payment;