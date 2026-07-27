export interface Payment {
  id: number;
  enrollment_id: number;
  amount: number;
  payment_method?: string;
  merchant_transaction_id?: string;
  reference?: string;
  entity?: string;
  appypay_charge_id?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payment_date?: string;
  created_at?: string;
  student_name?: string;
  course_name?: string;
  class_name?: string;
}