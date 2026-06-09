import { Request, Response } from 'express';
import pool from '../config/database';
import { studentSchema, studentUpdateSchema } from '../middleware/validation';

// Get all students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { course, status, search } = req.query;
    let query = 'SELECT * FROM students WHERE 1=1';
    const params: any[] = [];

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

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch students' });
  }
};

// Get student by ID
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch student' });
  }
};

// Create new student
export const createStudent = async (req: Request, res: Response) => {
  try {
    const validatedData = studentSchema.parse(req.body);

    const result = await pool.query(
      `INSERT INTO students (first_name, last_name, email, phone, date_of_birth, course, year, gpa, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        validatedData.first_name,
        validatedData.last_name,
        validatedData.email,
        validatedData.phone || null,
        validatedData.date_of_birth || null,
        validatedData.course,
        validatedData.year,
        validatedData.gpa || null,
        validatedData.status,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, error: 'Failed to create student' });
  }
};

// Update student
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = studentUpdateSchema.parse(req.body);

    const fields: string[] = [];
    const values: any[] = [];
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

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, error: 'Failed to update student' });
  }
};

// Delete student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, error: 'Failed to delete student' });
  }
};

// Get stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM students');
    const active = await pool.query("SELECT COUNT(*) FROM students WHERE status = 'active'");
    const graduated = await pool.query("SELECT COUNT(*) FROM students WHERE status = 'graduated'");
    const avgGpa = await pool.query('SELECT AVG(gpa) FROM students WHERE gpa IS NOT NULL');
    const byCourse = await pool.query('SELECT course, COUNT(*) FROM students GROUP BY course ORDER BY COUNT(*) DESC');

    res.json({
      success: true,
      data: {
        total: parseInt(total.rows[0].count),
        active: parseInt(active.rows[0].count),
        graduated: parseInt(graduated.rows[0].count),
        averageGpa: parseFloat(avgGpa.rows[0].avg || '0').toFixed(2),
        byCourse: byCourse.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};
