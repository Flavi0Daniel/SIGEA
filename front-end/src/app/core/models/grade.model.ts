export interface Grade {
  id: number;
  enrollment_id: number;
  grade: number;
  attendance_percentage?: number;
  observations?: string;
  evaluation_date: string;
  classification?: string;
  passing?: boolean;
  student_name?: string;
}