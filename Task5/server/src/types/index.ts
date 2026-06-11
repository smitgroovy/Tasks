import { Request } from 'express';

export interface UserPayload {
  id: number;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'viewer';
  first_name: string;
  last_name: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export type Role = 'admin' | 'teacher' | 'student' | 'viewer';
