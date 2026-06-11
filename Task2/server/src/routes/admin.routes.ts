import { Router } from 'express';
import { requireRole } from '../middleware/auth';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(requireRole('super_admin', 'admin'));

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', requireRole('super_admin'), adminController.updateUserRole);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', requireRole('super_admin'), adminController.deleteUser);

router.get('/stats', adminController.getSystemStats);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
