const { Op } = require('sequelize');
const User = require('../models/sql/User');
const AuditLog = require('../models/mongo/AuditLog');
const auditLog = require('../utils/auditLogger');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
};

const updateProfile = async (req, res) => {
  const { username, email } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await user.update({ username: username || user.username, email: email || user.email });
    await auditLog({ userId: user.id.toString(), username: user.username, role: user.role, action: 'PROFILE_UPDATED', resource: '/api/profile', method: 'PUT', req });
    res.json({ message: 'Profile updated', user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ error: 'Username or email already taken.' });
    res.status(500).json({ error: 'Server error.' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both fields required.' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  try {
    const user = await User.findByPk(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });
    const salt = await bcrypt.genSalt(10);
    await user.update({ password: await bcrypt.hash(newPassword, salt) });
    res.json({ message: 'Password changed successfully.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
};


const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const where = {};
    if (role && role !== 'all') where.role = role;
    if (search) where[Op.or] = [
      { username: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where, attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']], limit: parseInt(limit), offset
    });
    res.json({ total: count, page: parseInt(page), totalPages: Math.ceil(count / limit), users: rows });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
};


const updateUser = async (req, res) => {
  const { username, email, role, isActive } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await user.update({
      username: username ?? user.username,
      email: email ?? user.email,
      role: role ?? user.role,
      isActive: isActive ?? user.isActive,
    });
    await auditLog({ userId: req.user.id.toString(), username: req.user.username, role: req.user.role, action: 'ADMIN_USER_UPDATED', resource: `/api/admin/users/${req.params.id}`, method: 'PUT', req });
    res.json({ message: 'User updated', user: { id: user.id, username: user.username, email: user.email, role: user.role, isActive: user.isActive } });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
};

const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account.' });
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await user.destroy();
    await auditLog({ userId: req.user.id.toString(), username: req.user.username, role: req.user.role, action: 'ADMIN_USER_DELETED', resource: `/api/admin/users/${req.params.id}`, method: 'DELETE', message: `Deleted user: ${user.username}`, req });
    res.json({ message: `User "${user.username}" deleted successfully.` });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
};

const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const logs = await AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await AuditLog.countDocuments();
    res.json({ total, page, totalPages: Math.ceil(total / limit), logs });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch audit logs.' }); }
};

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalActive = await User.count({ where: { isActive: true } });
    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(5);
    res.json({ totalUsers, totalAdmins, totalRegularUsers: totalUsers - totalAdmins, totalActive, recentLogs });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
};

module.exports = { getProfile, updateProfile, changePassword, getAllUsers, getUserById, updateUser, deleteUser, getAuditLogs, getStats };
