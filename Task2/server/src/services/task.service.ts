import { Task, ITask } from '../models/Task';
import { Category } from '../models/Category';
import { Tag } from '../models/Tag';
import { NotFoundError } from '../utils/AppError';

interface TaskFilters {
  status?: string;
  priority?: string;
  category?: string;
  tag?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  userId?: string;
  isAdmin?: boolean;
}

export async function getTasks(filters: TaskFilters) {
  const query: any = { parentId: null };

  if (!filters.isAdmin) {
    query.userId = filters.userId;
  }

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.category) query.categoryId = filters.category;
  if (filters.tag) query.tags = { $in: [filters.tag] };
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  let sort: any = { order: 1, createdAt: -1 };
  if (filters.sort === 'dueDate') sort = { dueDate: 1, priority: 1 };
  if (filters.sort === 'priority') sort = { priority: 1, dueDate: 1 };
  if (filters.sort === 'title') sort = { title: 1 };

  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('categoryId', 'name color icon')
      .populate('tags', 'name color')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function getTodayTasks(userId?: string, isAdmin?: boolean) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const query: any = {
    parentId: null,
    $or: [
      { dueDate: { $gte: start, $lt: end } },
      { dueDate: { $lt: start }, status: { $ne: 'done' } },
      { dueDate: null, status: { $ne: 'done' } },
    ],
  };

  if (!isAdmin) {
    query.userId = userId;
  }

  const tasks = await Task.find(query)
    .populate('categoryId', 'name color icon')
    .populate('tags', 'name color')
    .sort({ priority: 1, dueDate: 1 })
    .lean();

  return tasks;
}

export async function getUpcomingTasks(days = 7, userId?: string, isAdmin?: boolean) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + days);

  const query: any = {
    parentId: null,
    dueDate: { $gte: start, $lt: end },
    status: { $ne: 'done' },
  };

  if (!isAdmin) {
    query.userId = userId;
  }

  const tasks = await Task.find(query)
    .populate('categoryId', 'name color icon')
    .populate('tags', 'name color')
    .sort({ dueDate: 1, priority: 1 })
    .lean();

  return tasks;
}

export async function getTaskById(taskId: string, userId?: string, isAdmin?: boolean) {
  const query: any = { _id: taskId };
  if (!isAdmin) {
    query.userId = userId;
  }

  const task = await Task.findOne(query)
    .populate('categoryId', 'name color icon')
    .populate('tags', 'name color')
    .populate('parentId', 'title status')
    .lean();

  if (!task) throw new NotFoundError('Task');
  return task;
}

export async function createTask(data: Partial<ITask>) {
  if (data.categoryId) {
    const cat = await Category.findById(data.categoryId);
    if (!cat) throw new NotFoundError('Category');
  }

  if (data.tags && data.tags.length > 0) {
    const tags = await Tag.find({ _id: { $in: data.tags } });
    if (tags.length !== data.tags.length) throw new NotFoundError('One or more tags');
  }

  const maxOrder = await Task.findOne({ userId: data.userId, parentId: data.parentId || null }).sort('-order').lean();
  const order = (maxOrder?.order || 0) + 1;

  const task = await Task.create({
    ...data,
    order,
  });

  return task.populate(['categoryId', 'tags']);
}

export async function updateTask(taskId: string, data: Partial<ITask>, userId?: string, isAdmin?: boolean) {
  const query: any = { _id: taskId };
  if (!isAdmin) {
    query.userId = userId;
  }

  const task = await Task.findOne(query);
  if (!task) throw new NotFoundError('Task');

  Object.assign(task, data);
  await task.save();

  return task.populate(['categoryId', 'tags']);
}

export async function deleteTask(taskId: string, userId?: string, isAdmin?: boolean) {
  const query: any = { _id: taskId };
  if (!isAdmin) {
    query.userId = userId;
  }

  const task = await Task.findOne(query);
  if (!task) throw new NotFoundError('Task');

  await Task.deleteMany({ parentId: taskId });
  await Task.deleteOne({ _id: taskId });
}

export async function completeTask(taskId: string, userId?: string, isAdmin?: boolean) {
  const query: any = { _id: taskId };
  if (!isAdmin) {
    query.userId = userId;
  }

  const task = await Task.findOne(query);
  if (!task) throw new NotFoundError('Task');

  task.status = 'done';
  task.completedAt = new Date();
  await task.save();

  let nextRecurring = null;
  if (task.recurrence && task.recurrence.type !== 'none') {
    const { getNextDueDate } = await import('../utils/dateHelpers');
    const nextDue = task.dueDate
      ? getNextDueDate(task.dueDate, task.recurrence as any)
      : null;

    if (nextDue && (!task.recurrence.endDate || nextDue <= task.recurrence.endDate)) {
      nextRecurring = await Task.create({
        userId: task.userId,
        workspaceId: task.workspaceId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: 'todo',
        dueDate: nextDue,
        categoryId: task.categoryId,
        tags: task.tags,
        recurrence: task.recurrence,
        order: task.order,
      });

      task.recurrence.lastGenerated = nextDue;
      await task.save();
    }
  }

  return { task, nextRecurring };
}

export async function getSubtasks(parentId: string, userId?: string, isAdmin?: boolean) {
  const query: any = { parentId };
  if (!isAdmin) {
    query.userId = userId;
  }

  const tasks = await Task.find(query)
    .populate('tags', 'name color')
    .sort({ order: 1 })
    .lean();

  return tasks;
}

export async function bulkAction(ids: string[], action: string, data?: any, userId?: string, isAdmin?: boolean) {
  const query: any = { _id: { $in: ids } };
  if (!isAdmin) {
    query.userId = userId;
  }

  const result = await Task.updateMany(
    query,
    { $set: data || {} }
  );

  return { count: result.modifiedCount };
}
