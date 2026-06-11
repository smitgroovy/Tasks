import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as adminService from '../services/admin.service';
import { catchAsync } from '../utils/catchAsync';

export const getUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await adminService.getUsers({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search as string,
    role: req.query.role as string,
    isActive: req.query.isActive as string,
  });
  res.json({ success: true, data: result });
});

export const getUserById = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await adminService.getUserById(req.params.id);
  res.json({ success: true, data: { user } });
});

export const updateUserRole = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { role } = req.body;
  const user = await adminService.updateUserRole(req.params.id, role);

  await adminService.logActivity({
    userId: req.user!._id.toString(),
    action: 'user.role.updated',
    resource: 'user',
    resourceId: req.params.id,
    details: { newRole: role },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ success: true, data: { user } });
});

export const toggleUserStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await adminService.toggleUserStatus(req.params.id);

  await adminService.logActivity({
    userId: req.user!._id.toString(),
    action: result.isActive ? 'user.activated' : 'user.deactivated',
    resource: 'user',
    resourceId: req.params.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ success: true, data: result });
});

export const updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;
  const user = await adminService.updateUser(req.params.id, { name, email });

  await adminService.logActivity({
    userId: req.user!._id.toString(),
    action: 'user.updated',
    resource: 'user',
    resourceId: req.params.id,
    details: { name, email },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ success: true, data: { user } });
});

export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await adminService.deleteUser(req.params.id);

  await adminService.logActivity({
    userId: req.user!._id.toString(),
    action: 'user.deleted',
    resource: 'user',
    resourceId: req.params.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ success: true, data: result });
});

export const getSystemStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const stats = await adminService.getSystemStats();
  res.json({ success: true, data: stats });
});

export const getAuditLogs = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const result = await adminService.getAuditLogs(page, limit);
  res.json({ success: true, data: result });
});
