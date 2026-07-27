export interface Class {
  id: number;
  name: string;
  course_id: number;
  instructor_id?: number;
  max_students: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  course_name?: string;
  instructor_name?: string;
}