import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { Category } from '../models/Category';
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

router.get('/', catchAsync(async (_req, res) => {
  const categories = await Category.find().sort('order').lean();
  res.json({ success: true, data: { categories } });
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
  const result = await Category.findByIdAndDelete(req.params.id);
  if (!result) throw new NotFoundError('Category');
  res.json({ success: true, data: { message: 'Category deleted' } });
}));

export default router;
