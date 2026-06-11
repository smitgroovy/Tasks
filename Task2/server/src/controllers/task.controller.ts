import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import * as taskService from '../services/task.service';

export const getTasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const result = await taskService.getTasks({
    ...req.query as any,
    userId: req.user!._id.toString(),
    isAdmin,
  });
  res.json({ success: true, data: result });
});

export const getTodayTasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const tasks = await taskService.getTodayTasks(req.user!._id.toString(), isAdmin);
  res.json({ success: true, data: { tasks } });
});

export const getUpcomingTasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const tasks = await taskService.getUpcomingTasks(days, req.user!._id.toString(), isAdmin);
  res.json({ success: true, data: { tasks } });
});

export const getTaskById = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const task = await taskService.getTaskById(req.params.id, req.user!._id.toString(), isAdmin);
  res.json({ success: true, data: { task } });
});

export const createTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const task = await taskService.createTask({
    ...req.body,
    userId: req.user!._id,
  });
  res.status(201).json({ success: true, data: { task } });
});

export const updateTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const task = await taskService.updateTask(req.params.id, req.body, req.user!._id.toString(), isAdmin);
  res.json({ success: true, data: { task } });
});

export const deleteTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  await taskService.deleteTask(req.params.id, req.user!._id.toString(), isAdmin);
  res.json({ success: true, data: { message: 'Task deleted' } });
});

export const completeTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const result = await taskService.completeTask(req.params.id, req.user!._id.toString(), isAdmin);
  res.json({ success: true, data: result });
});

export const getSubtasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const subtasks = await taskService.getSubtasks(req.params.id, req.user!._id.toString(), isAdmin);
  res.json({ success: true, data: { subtasks } });
});

export const createSubtask = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const parent = await taskService.getTaskById(req.params.id, req.user!._id.toString(), isAdmin);
  const task = await taskService.createTask({
    ...req.body,
    parentId: req.params.id,
    userId: req.user!._id,
  });
  res.status(201).json({ success: true, data: { task } });
});

export const bulkAction = catchAsync(async (req: AuthRequest, res: Response) => {
  const { ids, action, data } = req.body;
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const result = await taskService.bulkAction(ids, action, data, req.user!._id.toString(), isAdmin);
  res.json({ success: true, data: result });
});
