export interface Enrollment {
  id: number;
  student_id: number;
  class_id: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'overdue';
  enrollment_date: string;
  class_name?: string;
  course_name?: string;
  student_name?: string;
}