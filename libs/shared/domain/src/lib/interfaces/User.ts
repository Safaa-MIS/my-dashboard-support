// domain/interfaces/User.ts

import { UserRole } from "../types/UserRoles";



// Define status type
export type UserStatus = 'Active' | 'Inactive';

// Main User interface
export interface User {
  id: number;
  name: string | null;
  email: string;
  roles: UserRole[];
  permissions: string[]; 
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// For backend responses (dates are strings from backend, also roles may be strings)
export interface UserDTO {
  id: number;
  name: string | null;
  email: string;
  roles: string[]; 
  permissions: string[]; 
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth response from login
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    roles: string[];
    permissions: string[]; // Permissions in auth response
  };
}

// For creating new users
export interface CreateUserRequest {
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  password: string;
}

// For updating users
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}