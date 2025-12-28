export interface User {
  id: number;
  name: string | null;  // Allow null
  email: string;
  role: 'Admin' | 'User' | 'Guest';
  status: 'Active' | 'Inactive';
  createdAt?: Date;
  updatedAt?: Date;
}