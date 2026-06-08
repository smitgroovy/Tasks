import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Task } from '../models/Task';
import { catchAsync } from '../utils/catchAsync';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

const router = Router();
router.use(authenticate);

router.get('/stats', catchAsync(async (req: any, res) => {
  const period = req.query.period || 'week';
  const now = new Date();

  let startDate: Date;
  if (period === 'month') {
    startDate = subDays(now, 30);
  } else {
    startDate = subDays(now, 7);
  }

  const [completed, created, overdue] = await Promise.all([
    Task.countDocuments({
      userId: req.user._id,
      status: 'done',
      completedAt: { $gte: startDate },
    }),
    Task.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: startDate },
    }),
    Task.countDocuments({
      userId: req.user._id,
      status: { $ne: 'done' },
      dueDate: { $lt: startOfDay(now) },
    }),
  ]);

  // Calculate streak
  let streak = 0;
  let checkDate = startOfDay(now);
  while (true) {
    const dayEnd = endOfDay(checkDate);
    const dayStart = startOfDay(checkDate);
    const count = await Task.countDocuments({
      userId: req.user._id,
      status: 'done',
      completedAt: { $gte: dayStart, $lte: dayEnd },
    });
    if (count === 0) break;
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  res.json({
    success: true,
    data: { completed, created, overdue, streak, period },
  });
}));

router.get('/activity', catchAsync(async (req: any, res) => {
  const days = parseInt(req.query.days as string) || 7;
  const activity = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const count = await Task.countDocuments({
      userId: req.user._id,
      status: 'done',
      completedAt: { $gte: dayStart, $lte: dayEnd },
    });

    activity.push({
      date: dayStart.toISOString().split('T')[0],
      count,
    });
  }

  res.json({ success: true, data: { activity } });
}));

router.get('/heatmap', catchAsync(async (req: any, res) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const completedTasks = await Task.find({
    userId: req.user._id,
    status: 'done',
    completedAt: { $gte: startDate, $lte: endDate },
  }).select('completedAt').lean();

  const heatmap: Record<string, number> = {};
  completedTasks.forEach((task) => {
    const date = task.completedAt!.toISOString().split('T')[0];
    heatmap[date] = (heatmap[date] || 0) + 1;
  });

  res.json({ success: true, data: { heatmap } });
}));

export default router;
