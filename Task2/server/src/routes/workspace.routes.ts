import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Workspace } from '../models/Workspace';
import { NotFoundError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import crypto from 'crypto';

const router = Router();

router.get('/', catchAsync(async (req: AuthRequest, res) => {
  const workspaces = await Workspace.find({
    'members.userId': req.user!._id,
  }).lean();
  res.json({ success: true, data: { workspaces } });
}));

router.post('/', catchAsync(async (req: AuthRequest, res) => {
  const workspace = await Workspace.create({
    name: req.body.name,
    members: [{
      userId: req.user!._id,
      role: 'owner',
      joinedAt: new Date(),
    }],
    inviteCode: crypto.randomBytes(8).toString('hex'),
  });
  res.status(201).json({ success: true, data: { workspace } });
}));

router.post('/join', catchAsync(async (req: AuthRequest, res) => {
  const workspace = await Workspace.findOne({ inviteCode: req.body.inviteCode });
  if (!workspace) throw new NotFoundError('Workspace');

  const alreadyMember = workspace.members.some(
    (m) => m.userId.toString() === req.user!._id.toString()
  );

  if (!alreadyMember) {
    workspace.members.push({
      userId: req.user!._id,
      role: 'member',
      joinedAt: new Date(),
    });
    await workspace.save();
  }

  res.json({ success: true, data: { workspace } });
}));

router.get('/:id/members', catchAsync(async (req: AuthRequest, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    'members.userId': req.user!._id,
  })
    .populate('members.userId', 'name email avatar role')
    .lean();

  if (!workspace) throw new NotFoundError('Workspace');
  res.json({ success: true, data: { members: workspace.members } });
}));

router.delete('/:id/members/:userId', catchAsync(async (req: AuthRequest, res) => {
  const workspace = await Workspace.findOne({
    _id: req.params.id,
    'members.userId': req.user!._id,
  });

  if (!workspace) throw new NotFoundError('Workspace');

  const member = workspace.members.find(
    (m) => m.userId.toString() === req.user!._id.toString()
  );
  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    throw new NotFoundError('Permission denied');
  }

  workspace.members = workspace.members.filter(
    (m) => m.userId.toString() !== req.params.userId
  );
  await workspace.save();

  res.json({ success: true, data: { message: 'Member removed' } });
}));

export default router;
