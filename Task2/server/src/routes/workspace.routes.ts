import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Workspace } from '../models/Workspace';
import { NotFoundError, ForbiddenError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import crypto from 'crypto';

const router = Router();
router.use(authenticate);

router.get('/', catchAsync(async (req: any, res) => {
  const workspaces = await Workspace.find({
    'members.userId': req.user._id,
  }).lean();
  res.json({ success: true, data: { workspaces } });
}));

router.post('/', catchAsync(async (req: any, res) => {
  const workspace = await Workspace.create({
    name: req.body.name,
    ownerId: req.user._id,
    members: [{ userId: req.user._id, role: 'owner' }],
    inviteCode: crypto.randomBytes(8).toString('hex'),
  });
  res.status(201).json({ success: true, data: { workspace } });
}));

router.post('/join', catchAsync(async (req: any, res) => {
  const workspace = await Workspace.findOne({ inviteCode: req.body.inviteCode });
  if (!workspace) throw new NotFoundError('Workspace');

  const isMember = workspace.members.some(
    (m) => m.userId.toString() === req.user._id
  );

  if (!isMember) {
    workspace.members.push({ userId: req.user._id, role: 'member', joinedAt: new Date() });
    await workspace.save();
  }

  res.json({ success: true, data: { workspace } });
}));

router.get('/:id/members', catchAsync(async (req: any, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('members.userId', 'name email avatar')
    .lean();
  if (!workspace) throw new NotFoundError('Workspace');
  res.json({ success: true, data: { members: workspace.members } });
}));

router.delete('/:id/members/:userId', catchAsync(async (req: any, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) throw new NotFoundError('Workspace');

  if (workspace.ownerId.toString() !== req.user._id) {
    throw new ForbiddenError('Only the owner can remove members');
  }

  workspace.members = workspace.members.filter(
    (m) => m.userId.toString() !== req.params.userId
  );
  await workspace.save();

  res.json({ success: true, data: { message: 'Member removed' } });
}));

export default router;
