export interface Course {
  id: number;
  name: string;
  description?: string;
  duration_hours: number;
  price: number;
  category?: string;
  is_active: boolean;
  created_at?: string;
}