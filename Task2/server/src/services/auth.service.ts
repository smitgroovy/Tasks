import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/AppError';

interface TokenPayload {
  userId: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function generateTokens(userId: string): AuthTokens {
  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });

  return { accessToken, refreshToken };
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function register(name: string, email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const tokens = generateTokens(user._id.toString());
  await User.findByIdAndUpdate(user._id, { refreshToken: hashToken(tokens.refreshToken) });

  return {
    user: { id: user._id, name: user.name, email: user.email, theme: user.theme },
    ...tokens,
  };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = generateTokens(user._id.toString());
  await User.findByIdAndUpdate(user._id, { refreshToken: hashToken(tokens.refreshToken) });

  return {
    user: { id: user._id, name: user.name, email: user.email, theme: user.theme },
    ...tokens,
  };
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || !user.refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const storedHash = user.refreshToken;
    const providedHash = hashToken(refreshToken);

    if (storedHash !== providedHash) {
      throw new UnauthorizedError('Refresh token reused');
    }

    const tokens = generateTokens(user._id.toString());
    await User.findByIdAndUpdate(user._id, { refreshToken: hashToken(tokens.refreshToken) });

    return tokens;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token expired');
    }
    throw error;
  }
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
    await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
  } catch {
    // Token invalid, still "logout" client-side
  }
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }
  return { id: user._id, name: user.name, email: user.email, theme: user.theme, avatar: user.avatar };
}

export async function updateTheme(userId: string, theme: 'light' | 'dark' | 'system') {
  await User.findByIdAndUpdate(userId, { theme });
}
