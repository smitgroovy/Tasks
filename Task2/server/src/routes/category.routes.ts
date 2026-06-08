import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { Category } from '../models/Category';
import { NotFoundError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const router = Router();
router.use(authenticate);

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().optional(),
  }),
});

router.get('/', catchAsync(async (req: any, res) => {
  const categories = await Category.find({ userId: req.user._id }).sort('order').lean();
  res.json({ success: true, data: { categories } });
}));

router.post('/', validate(createCategorySchema), catchAsync(async (req: any, res) => {
  const category = await Category.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: { category } });
}));

router.patch('/:id', catchAsync(async (req: any, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true }
  );
  if (!category) throw new NotFoundError('Category');
  res.json({ success: true, data: { category } });
}));

router.delete('/:id', catchAsync(async (req: any, res) => {
  const result = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!result) throw new NotFoundError('Category');
  res.json({ success: true, data: { message: 'Category deleted' } });
}));

export default router;
