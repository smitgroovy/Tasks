import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireRole, AuthRequest } from '../middleware/auth';
import { Tag } from '../models/Tag';
import { NotFoundError, ConflictError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(30),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
});

router.get('/', catchAsync(async (req: AuthRequest, res) => {
  const tags = await Tag.find({ userId: req.user!._id }).sort('name').lean();
  res.json({ success: true, data: { tags } });
}));

router.post('/', requireRole('admin', 'editor', 'super_admin'), validate(createTagSchema), catchAsync(async (req: AuthRequest, res) => {
  try {
    const tag = await Tag.create({ ...req.body, userId: req.user!._id });
    res.status(201).json({ success: true, data: { tag } });
  } catch (error: any) {
    if (error.code === 11000) throw new ConflictError('Tag already exists');
    throw error;
  }
}));

router.delete('/:id', requireRole('admin', 'super_admin'), catchAsync(async (req: AuthRequest, res) => {
  const result = await Tag.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
  if (!result) throw new NotFoundError('Tag');
  res.json({ success: true, data: { message: 'Tag deleted' } });
}));

export default router;
