"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign(user, auth_1.JWT_SECRET, { expiresIn: '15m' });
};
const generateRefreshToken = async (userId) => {
    const token = crypto_1.default.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await database_1.default.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [userId, token, expiresAt]);
    return token;
};
const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, role } = req.body;
        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }
        const existing = await database_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }
        const password_hash = await bcryptjs_1.default.hash(password, 12);
        const userRole = role || 'viewer';
        const result = await database_1.default.query(`INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at`, [email, password_hash, first_name, last_name, userRole]);
        const user = result.rows[0];
        const payload = { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name };
        const accessToken = generateAccessToken(payload);
        const refreshToken = await generateRefreshToken(user.id);
        res.status(201).json({
            success: true,
            data: {
                user: payload,
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Failed to register user' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }
        const result = await database_1.default.query('SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        const user = result.rows[0];
        if (!user.is_active) {
            return res.status(403).json({ success: false, error: 'Account is deactivated' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        const payload = { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name };
        const accessToken = generateAccessToken(payload);
        const refreshToken = await generateRefreshToken(user.id);
        res.json({
            success: true,
            data: {
                user: payload,
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Failed to login' });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, error: 'Refresh token required' });
        }
        const result = await database_1.default.query('SELECT rt.id, rt.user_id, rt.expires_at, u.email, u.role, u.first_name, u.last_name, u.is_active FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id WHERE rt.token = $1', [refreshToken]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid refresh token' });
        }
        const tokenData = result.rows[0];
        if (!tokenData.is_active) {
            await database_1.default.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenData.id]);
            return res.status(403).json({ success: false, error: 'Account is deactivated' });
        }
        if (new Date(tokenData.expires_at) < new Date()) {
            await database_1.default.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenData.id]);
            return res.status(401).json({ success: false, error: 'Refresh token expired' });
        }
        await database_1.default.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenData.id]);
        const payload = {
            id: tokenData.user_id,
            email: tokenData.email,
            role: tokenData.role,
            first_name: tokenData.first_name,
            last_name: tokenData.last_name,
        };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = await generateRefreshToken(tokenData.user_id);
        res.json({
            success: true,
            data: {
                user: payload,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    }
    catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({ success: false, error: 'Failed to refresh token' });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await database_1.default.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        }
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: 'Failed to logout' });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const result = await database_1.default.query('SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ success: false, error: 'Failed to get user' });
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map