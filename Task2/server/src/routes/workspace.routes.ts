import { Router } from 'express';
import { Workspace } from '../models/Workspace';
import { NotFoundError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import crypto from 'crypto';

const router = Router();

router.get('/', catchAsync(async (_req, res) => {
  const workspaces = await Workspace.find().lean();
  res.json({ success: true, data: { workspaces } });
}));

router.post('/', catchAsync(async (req, res) => {
  const workspace = await Workspace.create({
    name: req.body.name,
    members: [],
    inviteCode: crypto.randomBytes(8).toString('hex'),
  });
  res.status(201).json({ success: true, data: { workspace } });
}));

router.post('/join', catchAsync(async (req, res) => {
  const workspace = await Workspace.findOne({ inviteCode: req.body.inviteCode });
  if (!workspace) throw new NotFoundError('Workspace');
  res.json({ success: true, data: { workspace } });
}));

router.get('/:id/members', catchAsync(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('members.userId', 'name email avatar')
    .lean();
  if (!workspace) throw new NotFoundError('Workspace');
  res.json({ success: true, data: { members: workspace.members } });
}));

export default router;
