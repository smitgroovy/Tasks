import { z } from 'zod';

export const studentSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  course: z.string().min(1, 'Course is required').max(100),
  year: z.number().int().min(1).max(6).default(1),
  sgpa: z.number().min(0, 'SGPA must be at least 0').max(10, 'SGPA must be at most 10').optional(),
  status: z.enum(['active', 'inactive', 'graduated']).default('active'),
});

export const studentUpdateSchema = studentSchema.partial();
