import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
} from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', authorize('admin', 'teacher', 'student', 'viewer'), getStats);
router.get('/', authorize('admin', 'teacher', 'student', 'viewer'), getAllStudents);
router.get('/:id', authorize('admin', 'teacher', 'student', 'viewer'), getStudentById);
router.post('/', authorize('admin', 'teacher'), createStudent);
router.put('/:id', authorize('admin', 'teacher'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

export default router;
