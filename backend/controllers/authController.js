require('dotenv').config();
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/sql/User');
const auditLog = require('../utils/auditLogger');

const generateToken = (user) => jwt.sign(
  { id: user.id, username: user.username, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
);

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password, role } = req.body;
  const assignedRole = role === 'admin' ? 'admin' : 'user'; // only allow user/admin

  try {
    const user = await User.create({ username, email, password, role: assignedRole });
    await auditLog({ userId: user.id.toString(), username: user.username, role: user.role, action: 'USER_REGISTERED', resource: '/api/auth/register', method: 'POST', req });
    const token = generateToken(user);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'Username or email already exists.' });
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      await auditLog({ action: 'LOGIN_FAILED', resource: '/api/auth/login', method: 'POST', success: false, message: `Failed login: ${email}`, req });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await auditLog({ userId: user.id.toString(), username: user.username, action: 'LOGIN_FAILED', resource: '/api/auth/login', method: 'POST', success: false, message: 'Wrong password', req });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    await auditLog({ userId: user.id.toString(), username: user.username, role: user.role, action: 'LOGIN_SUCCESS', resource: '/api/auth/login', method: 'POST', req });
    const token = generateToken(user);
    res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

module.exports = { register, login };
