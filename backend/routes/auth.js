// routes/auth.js  —  Public routes (no auth required)

const router = require('express').Router();
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');

// Validation rules using express-validator
const registerRules = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3–50 chars'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);

module.exports = router;
