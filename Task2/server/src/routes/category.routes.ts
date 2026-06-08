import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { Category } from '../models/Category';
import { Task } from '../models/Task';
import { NotFoundError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

const DEFAULT_CATEGORIES = [
  { name: 'Work', color: '#6366f1', icon: 'briefcase', order: 0 },
  { name: 'Personal', color: '#8b5cf6', icon: 'user', order: 1 },
  { name: 'Health', color: '#22c55e', icon: 'heart', order: 2 },
  { name: 'Learning', color: '#f97316', icon: 'book', order: 3 },
  { name: 'Finance', color: '#eab308', icon: 'dollar', order: 4 },
];

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().optional(),
  }),
});

// Seed defaults if empty, then return all with task counts
router.get('/', catchAsync(async (_req, res) => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
  }

  const categories = await Category.find().sort('order').lean();

  // Get task counts per category
  const counts = await Task.aggregate([
    { $match: { categoryId: { $ne: null }, status: { $ne: 'done' } } },
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

router.post('/', validate(createCategorySchema), catchAsync(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: { category } });
}));

router.patch('/:id', catchAsync(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new NotFoundError('Category');
  res.json({ success: true, data: { category } });
}));

router.delete('/:id', catchAsync(async (req, res) => {
  // Unassign tasks from this category
  await Task.updateMany({ categoryId: req.params.id }, { categoryId: null });
  const result = await Category.findByIdAndDelete(req.params.id);
  if (!result) throw new NotFoundError('Category');
  res.json({ success: true, data: { message: 'Category deleted' } });
}));

// Get tasks for a specific category
router.get('/:id/tasks', catchAsync(async (req, res) => {
  const tasks = await Task.find({
    categoryId: req.params.id,
    parentId: null,
  })
    .populate('categoryId', 'name color icon')
    .populate('tags', 'name color')
    .sort({ priority: 1, dueDate: 1 })
    .lean();

  res.json({ success: true, data: { tasks } });
}));

export default router;
