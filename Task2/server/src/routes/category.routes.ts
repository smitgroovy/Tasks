import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireRole, AuthRequest } from '../middleware/auth';
import { Category } from '../models/Category';
import { Task } from '../models/Task';
import { NotFoundError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().optional(),
  }),
});

router.get('/', catchAsync(async (req: AuthRequest, res) => {
  const userId = req.user!._id.toString();

  const count = await Category.countDocuments({ userId });
  if (count === 0) {
    const defaults = [
      { name: 'Work', color: '#6366f1', icon: 'briefcase', order: 0 },
      { name: 'Personal', color: '#8b5cf6', icon: 'user', order: 1 },
      { name: 'Health', color: '#22c55e', icon: 'heart', order: 2 },
      { name: 'Learning', color: '#f97316', icon: 'book', order: 3 },
      { name: 'Finance', color: '#eab308', icon: 'dollar', order: 4 },
    ].map(c => ({ ...c, userId }));
    await Category.insertMany(defaults);
  }

  const categories = await Category.find({ userId }).sort('order').lean();

  const counts = await Task.aggregate([
    { $match: { userId: req.user!._id, categoryId: { $ne: null }, status: { $ne: 'done' } } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);

  const countMap: Record<string, number> = {};
  counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

  const result = categories.map((cat) => ({
    ...cat,
    taskCount: countMap[cat._id.toString()] || 0,
  }));

  res.json({ success: true, data: { categories: result } });
}));

router.post('/', requireRole('admin', 'editor', 'super_admin'), validate(createCategorySchema), catchAsync(async (req: AuthRequest, res) => {
  const category = await Category.create({ ...req.body, userId: req.user!._id });
  res.status(201).json({ success: true, data: { category } });
}));

router.patch('/:id', requireRole('admin', 'editor', 'super_admin'), catchAsync(async (req: AuthRequest, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!._id },
    req.body,
    { new: true }
  );
  if (!category) throw new NotFoundError('Category');
  res.json({ success: true, data: { category } });
}));

router.delete('/:id', requireRole('admin', 'super_admin'), catchAsync(async (req: AuthRequest, res) => {
  await Task.updateMany({ categoryId: req.params.id, userId: req.user!._id }, { categoryId: null });
  const result = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
  if (!result) throw new NotFoundError('Category');
  res.json({ success: true, data: { message: 'Category deleted' } });
}));

router.get('/:id/tasks', catchAsync(async (req: AuthRequest, res) => {
  const tasks = await Task.find({
    categoryId: req.params.id,
    userId: req.user!._id,
    parentId: null,
  })
    .populate('categoryId', 'name color icon')
    .populate('tags', 'name color')
    .sort({ priority: 1, dueDate: 1 })
    .lean();

  res.json({ success: true, data: { tasks } });
}));

export default router;
