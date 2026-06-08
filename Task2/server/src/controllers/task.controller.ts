import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as taskService from '../services/task.service';

export const getTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.getTasks(req.query as any);
  res.json({ success: true, data: result });
});

export const getTodayTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await taskService.getTodayTasks();
  res.json({ success: true, data: { tasks } });
});

export const getUpcomingTasks = catchAsync(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const tasks = await taskService.getUpcomingTasks(days);
  res.json({ success: true, data: { tasks } });
});

export const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(req.params.id);
  res.json({ success: true, data: { task } });
});

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json({ success: true, data: { task } });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.json({ success: true, data: { task } });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.params.id);
  res.json({ success: true, data: { message: 'Task deleted' } });
});

export const completeTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.completeTask(req.params.id);
  res.json({ success: true, data: result });
});

export const getSubtasks = catchAsync(async (req: Request, res: Response) => {
  const subtasks = await taskService.getSubtasks(req.params.id);
  res.json({ success: true, data: { subtasks } });
});

export const createSubtask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.createTask({
    ...req.body,
    parentId: req.params.id,
  } as any);
  res.status(201).json({ success: true, data: { task } });
});

export const bulkAction = catchAsync(async (req: Request, res: Response) => {
  const { ids, action, data } = req.body;
  const result = await taskService.bulkAction(ids, action, data);
  res.json({ success: true, data: result });
});
