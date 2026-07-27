class Payment {
  constructor(data) {
    this.id                      = data.id;
    this.enrollment_id           = data.enrollment_id;
    this.amount                  = data.amount;
    this.payment_method          = data.payment_method          || null;
    this.merchant_transaction_id = data.merchant_transaction_id || null;
    this.reference               = data.reference               || null;
    this.entity                  = data.entity                  || null;
    this.appypay_charge_id       = data.appypay_charge_id       || null;
    this.transaction_id          = data.transaction_id          || null;
    this.status                  = data.status                  || 'PENDING';
    this.payment_date            = data.payment_date            || null;
    this.created_at              = data.created_at;
    // Campos extra vindos de JOINs
    this.student_name            = data.student_name            || null;
    this.course_name             = data.course_name             || null;
    this.class_name              = data.class_name              || null;
  }

  isPaid() {
    return this.status === 'COMPLETED';
  }

  isPending() {
    return this.status === 'PENDING';
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Payment;