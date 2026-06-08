import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
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

router.get('/', catchAsync(async (_req, res) => {
  const tags = await Tag.find().sort('name').lean();
  res.json({ success: true, data: { tags } });
}));

router.post('/', validate(createTagSchema), catchAsync(async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json({ success: true, data: { tag } });
  } catch (error: any) {
    if (error.code === 11000) throw new ConflictError('Tag already exists');
    throw error;
  }
}));

router.delete('/:id', catchAsync(async (req, res) => {
  const result = await Tag.findByIdAndDelete(req.params.id);
  if (!result) throw new NotFoundError('Tag');
  res.json({ success: true, data: { message: 'Tag deleted' } });
}));

export default router;
