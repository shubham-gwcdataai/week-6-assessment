const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  getProfile, updateProfile, changePassword,
  getAllUsers, getUserById, updateUser, deleteUser,
  getAuditLogs, getStats
} = require('../controllers/userController');

// User routes 
router.get('/profile',           authenticate, getProfile);
router.put('/profile',           authenticate, updateProfile);
router.put('/profile/password',  authenticate, changePassword);

// Admin-only routes
router.get('/admin/stats',         authenticate, authorize('admin'), getStats);
router.get('/admin/users',         authenticate, authorize('admin'), getAllUsers);
router.get('/admin/users/:id',     authenticate, authorize('admin'), getUserById);
router.put('/admin/users/:id',     authenticate, authorize('admin'), updateUser);
router.delete('/admin/users/:id',  authenticate, authorize('admin'), deleteUser);
router.get('/admin/audit-logs',    authenticate, authorize('admin'), getAuditLogs);

module.exports = router;
