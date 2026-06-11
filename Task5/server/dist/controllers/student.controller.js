"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getAllStudents = void 0;
const database_1 = __importDefault(require("../config/database"));
const validation_1 = require("../middleware/validation");
// Get all students
const getAllStudents = async (req, res) => {
    try {
        const { course, status, search } = req.query;
        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];
        if (course) {
            params.push(course);
            query += ` AND course = $${params.length}`;
        }
        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
        }
        query += ' ORDER BY created_at DESC';
        const result = await database_1.default.query(query, params);
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length,
        });
    }
    catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch students' });
    }
};
exports.getAllStudents = getAllStudents;
// Get student by ID
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('SELECT * FROM students WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch student' });
    }
};
exports.getStudentById = getStudentById;
// Create new student
const createStudent = async (req, res) => {
    try {
        const validatedData = validation_1.studentSchema.parse(req.body);
        const result = await database_1.default.query(`INSERT INTO students (first_name, last_name, email, phone, date_of_birth, course, year, sgpa, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`, [
            validatedData.first_name,
            validatedData.last_name,
            validatedData.email,
            validatedData.phone || null,
            validatedData.date_of_birth || null,
            validatedData.course,
            validatedData.year,
            validatedData.sgpa || null,
            validatedData.status,
        ]);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return res.status(400).json({ success: false, error: error.message });
        }
        console.error('Error creating student:', error);
        res.status(500).json({ success: false, error: 'Failed to create student' });
    }
};
exports.createStudent = createStudent;
// Update student
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = validation_1.studentUpdateSchema.parse(req.body);
        const fields = [];
        const values = [];
        let paramCount = 1;
        Object.entries(validatedData).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });
        if (fields.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }
        values.push(id);
        const query = `UPDATE students SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await database_1.default.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return res.status(400).json({ success: false, error: error.message });
        }
        console.error('Error updating student:', error);
        res.status(500).json({ success: false, error: 'Failed to update student' });
    }
};
exports.updateStudent = updateStudent;
// Delete student
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        res.json({ success: true, message: 'Student deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ success: false, error: 'Failed to delete student' });
    }
};
exports.deleteStudent = deleteStudent;
// Get stats
const getStats = async (req, res) => {
    try {
        const total = await database_1.default.query('SELECT COUNT(*) FROM students');
        const active = await database_1.default.query("SELECT COUNT(*) FROM students WHERE status = 'active'");
        const graduated = await database_1.default.query("SELECT COUNT(*) FROM students WHERE status = 'graduated'");
        const avgSgpa = await database_1.default.query('SELECT AVG(sgpa) FROM students WHERE sgpa IS NOT NULL');
        const byCourse = await database_1.default.query('SELECT course, COUNT(*) FROM students GROUP BY course ORDER BY COUNT(*) DESC');
        res.json({
            success: true,
            data: {
                total: parseInt(total.rows[0].count),
                active: parseInt(active.rows[0].count),
                graduated: parseInt(graduated.rows[0].count),
                averageSgpa: parseFloat(avgSgpa.rows[0].avg || '0').toFixed(2),
                byCourse: byCourse.rows,
            },
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
};
exports.getStats = getStats;
//# sourceMappingURL=student.controller.js.map