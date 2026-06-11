import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { Task } from '../models/Task';
import { NotFoundError, ValidationError } from '../utils/AppError';

interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
}

export const getUsers = async (query: UserQuery) => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.role && ['super_admin', 'admin', 'editor', 'user'].includes(query.role)) {
    filter.role = query.role;
  }

  if (query.isActive === 'true' || query.isActive === 'false') {
    filter.isActive = query.isActive === 'true';
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId)
    .select('-password -refreshToken -passwordResetToken -passwordResetExpires');

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};

export const updateUserRole = async (userId: string, role: string) => {
  const validRoles = ['super_admin', 'admin', 'editor', 'user'];
  if (!validRoles.includes(role)) {
    throw new ValidationError('Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select('-password -refreshToken -passwordResetToken -passwordResetExpires');

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};

export const toggleUserStatus = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  user.isActive = !user.isActive;
  if (!user.isActive) {
    user.refreshToken = undefined;
  }
  await user.save();

  return {
    id: user._id,
    isActive: user.isActive,
  };
};

export const updateUser = async (userId: string, data: { name?: string; email?: string }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  ).select('-password -refreshToken -passwordResetToken -passwordResetExpires');

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  await Task.deleteMany({ userId });

  return { message: 'User deleted' };
};

export const getSystemStats = async () => {
  const [totalUsers, activeUsers, usersByRole, totalTasks, tasksByStatus] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    Task.countDocuments(),
    Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      byRole: usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
    },
    tasks: {
      total: totalTasks,
      byStatus: tasksByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    },
  };
};

export const getAuditLogs = async (page = 1, limit = 50) => {
  const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));

  const [logs, total] = await Promise.all([
    ActivityLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(100, Math.max(1, limit)))
      .lean(),
    ActivityLog.countDocuments(),
  ]);

  return {
    logs,
    pagination: {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
      total,
      pages: Math.ceil(total / Math.min(100, Math.max(1, limit))),
    },
  };
};

export const logActivity = async (data: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}) => {
  return ActivityLog.create(data);
};
