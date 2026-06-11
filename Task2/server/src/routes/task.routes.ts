import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireRole } from '../middleware/auth';
import * as taskController from '../controllers/task.controller';

const router = Router();

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    priority: z.enum(['urgent', 'high', 'medium', 'low']).optional(),
    dueDate: z.string().datetime().optional(),
    categoryId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    parentId: z.string().optional(),
    recurrence: z.object({
      type: z.enum(['none', 'daily', 'weekly', 'monthly', 'custom']),
      interval: z.number().min(1).optional(),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      endDate: z.string().datetime().optional(),
    }).optional(),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    priority: z.enum(['urgent', 'high', 'medium', 'low']).optional(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    order: z.number().optional(),
  }),
});

router.get('/today', taskController.getTodayTasks);
router.get('/upcoming', taskController.getUpcomingTasks);
router.get('/:id', taskController.getTaskById);
router.get('/:id/subtasks', taskController.getSubtasks);
router.post('/', requireRole('admin', 'editor', 'user', 'super_admin'), validate(createTaskSchema), taskController.createTask);
router.post('/:id/subtasks', requireRole('admin', 'editor', 'user', 'super_admin'), taskController.createSubtask);
router.post('/:id/complete', requireRole('admin', 'editor', 'user', 'super_admin'), taskController.completeTask);
router.patch('/:id', requireRole('admin', 'editor', 'super_admin'), validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', requireRole('admin', 'super_admin'), taskController.deleteTask);
router.post('/bulk', requireRole('admin', 'editor', 'super_admin'), taskController.bulkAction);
router.get('/', taskController.getTasks);

export default router;
