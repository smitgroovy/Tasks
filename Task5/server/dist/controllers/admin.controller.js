"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const getUsers = async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, data: result.rows, count: result.rows.length });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    try {
        const { email, password, first_name, last_name, role } = req.body;
        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        const existing = await database_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }
        const password_hash = await bcryptjs_1.default.hash(password, 12);
        const userRole = role || 'viewer';
        const result = await database_1.default.query(`INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, is_active, created_at`, [email, password_hash, first_name, last_name, userRole]);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: 'Failed to create user' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, role, is_active } = req.body;
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (first_name !== undefined) {
            fields.push(`first_name = $${paramCount}`);
            values.push(first_name);
            paramCount++;
        }
        if (last_name !== undefined) {
            fields.push(`last_name = $${paramCount}`);
            values.push(last_name);
            paramCount++;
        }
        if (role !== undefined) {
            fields.push(`role = $${paramCount}`);
            values.push(role);
            paramCount++;
        }
        if (is_active !== undefined) {
            fields.push(`is_active = $${paramCount}`);
            values.push(is_active);
            paramCount++;
        }
        if (fields.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }
        values.push(id);
        const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`;
        const result = await database_1.default.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user && req.user.id === parseInt(id)) {
            return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
        }
        const result = await database_1.default.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
};
exports.getUserById = getUserById;
//# sourceMappingURL=admin.controller.js.map