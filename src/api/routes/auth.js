// backend/src/api/routes/auth.js
// Defines routes for user registration and login.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Register a new citizen
router.post('/register', authController.register);

// POST /api/auth/login - Log in a user (citizen or admin)
router.post('/login', authController.login);

// We will add /register-admin later and protect it.

module.exports = router;
