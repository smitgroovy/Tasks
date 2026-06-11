"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/stats', (0, auth_1.authorize)('admin', 'teacher', 'student', 'viewer'), student_controller_1.getStats);
router.get('/', (0, auth_1.authorize)('admin', 'teacher', 'student', 'viewer'), student_controller_1.getAllStudents);
router.get('/:id', (0, auth_1.authorize)('admin', 'teacher', 'student', 'viewer'), student_controller_1.getStudentById);
router.post('/', (0, auth_1.authorize)('admin', 'teacher'), student_controller_1.createStudent);
router.put('/:id', (0, auth_1.authorize)('admin', 'teacher'), student_controller_1.updateStudent);
router.delete('/:id', (0, auth_1.authorize)('admin'), student_controller_1.deleteStudent);
exports.default = router;
//# sourceMappingURL=student.routes.js.map