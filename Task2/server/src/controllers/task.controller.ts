import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as taskService from '../services/task.service';

export const getTasks = catchAsync(async (req: any, res: Response) => {
  const result = await taskService.getTasks(req.user._id, req.query);
  res.json({ success: true, data: result });
});

export const getTodayTasks = catchAsync(async (req: any, res: Response) => {
  const tasks = await taskService.getTodayTasks(req.user._id);
  res.json({ success: true, data: { tasks } });
});

export const getUpcomingTasks = catchAsync(async (req: any, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const tasks = await taskService.getUpcomingTasks(req.user._id, days);
  res.json({ success: true, data: { tasks } });
});

export const getTaskById = catchAsync(async (req: any, res: Response) => {
  const task = await taskService.getTaskById(req.user._id, req.params.id);
  res.json({ success: true, data: { task } });
});

export const createTask = catchAsync(async (req: any, res: Response) => {
  const task = await taskService.createTask(req.user._id, req.body);
  res.status(201).json({ success: true, data: { task } });
});

export const updateTask = catchAsync(async (req: any, res: Response) => {
  const task = await taskService.updateTask(req.user._id, req.params.id, req.body);
  res.json({ success: true, data: { task } });
});

export const deleteTask = catchAsync(async (req: any, res: Response) => {
  await taskService.deleteTask(req.user._id, req.params.id);
  res.json({ success: true, data: { message: 'Task deleted' } });
});

export const completeTask = catchAsync(async (req: any, res: Response) => {
  const result = await taskService.completeTask(req.user._id, req.params.id);
  res.json({ success: true, data: result });
});

export const getSubtasks = catchAsync(async (req: any, res: Response) => {
  const subtasks = await taskService.getSubtasks(req.user._id, req.params.id);
  res.json({ success: true, data: { subtasks } });
});

export const createSubtask = catchAsync(async (req: any, res: Response) => {
  const task = await taskService.createTask(req.user._id, {
    ...req.body,
    parentId: req.params.id,
  });
  res.status(201).json({ success: true, data: { task } });
});

export const bulkAction = catchAsync(async (req: any, res: Response) => {
  const { ids, action, data } = req.body;
  const result = await taskService.bulkAction(req.user._id, ids, action, data);
  res.json({ success: true, data: result });
});
