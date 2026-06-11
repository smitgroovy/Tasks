import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.registerUser(name, email, password);
  res.status(201).json({ success: true, data: result });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json({ success: true, data: result });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required' },
    });
  }
  const result = await authService.refreshUserToken(refreshToken);
  res.json({ success: true, data: result });
});

export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
  await authService.logoutUser(req.user!._id.toString());
  res.json({ success: true, data: null, message: 'Logged out successfully' });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await authService.getCurrentUser(req.user!._id.toString());
  res.json({ success: true, data: { user } });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.json({
    success: true,
    message: 'If the email exists, a reset link has been sent',
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  res.json({ success: true, message: 'Password reset successful' });
});
