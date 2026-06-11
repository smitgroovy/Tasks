import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database';
import { AuthRequest, UserPayload } from '../types';
import { JWT_SECRET } from '../middleware/auth';

const generateAccessToken = (user: UserPayload): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = async (userId: number): Promise<string> => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  return token;
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const userRole = role || 'viewer';

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at`,
      [email, password_hash, first_name, last_name, userRole]
    );

    const user = result.rows[0];
    const payload: UserPayload = { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: payload,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to register user' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const payload: UserPayload = { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        user: payload,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Failed to login' });
  }
};

export const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token required' });
    }

    const result = await pool.query(
      'SELECT rt.id, rt.user_id, rt.expires_at, u.email, u.role, u.first_name, u.last_name, u.is_active FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id WHERE rt.token = $1',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    const tokenData = result.rows[0];

    if (!tokenData.is_active) {
      await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenData.id]);
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenData.id]);
      return res.status(401).json({ success: false, error: 'Refresh token expired' });
    }

    await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenData.id]);

    const payload: UserPayload = {
      id: tokenData.user_id,
      email: tokenData.email,
      role: tokenData.role,
      first_name: tokenData.first_name,
      last_name: tokenData.last_name,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = await generateRefreshToken(tokenData.user_id);

    res.json({
      success: true,
      data: {
        user: payload,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh token' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Failed to logout' });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(resetToken, 10);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await pool.query(
        'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
        [hashedToken, expiresAt, user.id]
      );

      const { sendPasswordResetEmail } = await import('../services/email.service');
      await sendPasswordResetEmail(user.email, resetToken);
    }

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const result = await pool.query(
      'SELECT id, password_reset_token FROM users WHERE password_reset_expires > NOW()'
    );

    let targetUserId: number | null = null;

    for (const user of result.rows) {
      if (user.password_reset_token) {
        const isValid = await bcrypt.compare(token, user.password_reset_token);
        if (isValid) {
          targetUserId = user.id;
          break;
        }
      }
    }

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    await pool.query(
      'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
      [password_hash, targetUserId]
    );

    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [targetUserId]);

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
};
