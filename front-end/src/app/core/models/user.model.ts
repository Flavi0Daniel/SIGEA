export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'instructor' | 'student';
  is_active: boolean;
  created_at?: string;
}