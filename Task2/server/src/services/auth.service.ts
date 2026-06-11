import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { AppError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/AppError';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const generateAccessToken = (user: IUser): string => {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRY as any };
  return jwt.sign(
    { userId: user._id, role: user.role },
    env.JWT_ACCESS_SECRET,
    options
  );
};

const generateRefreshToken = (user: IUser): string => {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRY as any };
  return jwt.sign(
    { userId: user._id, role: user.role },
    env.JWT_REFRESH_SECRET,
    options
  );
};

const generateTokenPair = async (user: IUser): Promise<TokenPair> => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashedRefresh;
  await user.save();

  return { accessToken, refreshToken };
};

export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const tokens = await generateTokenPair(user);

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    ...tokens,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account has been deactivated');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  const tokens = await generateTokenPair(user);

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    ...tokens,
  };
};

export const refreshUserToken = async (refreshToken: string) => {
  let decoded: { userId: string; role: string };
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string; role: string };
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account has been deactivated');
  }

  if (!user.refreshToken) {
    throw new UnauthorizedError('Refresh token not found');
  }

  const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isValid) {
    user.refreshToken = undefined;
    await user.save();
    throw new UnauthorizedError('Refresh token reuse detected');
  }

  const tokens = await generateTokenPair(user);

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    ...tokens,
  };
};

export const logoutUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).select('-password -refreshToken -passwordResetToken -passwordResetExpires');
  if (!user) {
    throw new NotFoundError('User');
  }
  return user;
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  if (env.SMTP_HOST) {
    const { sendPasswordResetEmail } = await import('./email.service');
    await sendPasswordResetEmail(user.email, resetToken).catch(console.error);
  }

  return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const users = await User.find({
    passwordResetExpires: { $gt: new Date() },
  });

  let targetUser: IUser | null = null;
  for (const user of users) {
    if (user.passwordResetToken) {
      const isValid = await bcrypt.compare(token, user.passwordResetToken);
      if (isValid) {
        targetUser = user;
        break;
      }
    }
  }

  if (!targetUser) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  targetUser.password = await bcrypt.hash(newPassword, 12);
  targetUser.passwordResetToken = undefined;
  targetUser.passwordResetExpires = undefined;
  targetUser.refreshToken = undefined;
  await targetUser.save();

  return { message: 'Password reset successful' };
};
