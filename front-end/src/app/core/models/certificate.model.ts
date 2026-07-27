export interface Certificate {
  id: number;
  enrollment_id: number;
  certificate_number: string;
  issue_date: string;
  pdf_path?: string;
  whatsapp_sent: boolean;
  course_name?: string;
  class_name?: string;
}