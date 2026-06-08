import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as authService from '../services/auth.service';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.register(name, email, password);
  res.status(201).json({ success: true, data: result });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);
  res.json({ success: true, data: tokens });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  res.json({ success: true, data: { message: 'Logged out' } });
});

export const me = catchAsync(async (req: any, res: Response) => {
  const user = await authService.getMe(req.user._id);
  res.json({ success: true, data: user });
});
