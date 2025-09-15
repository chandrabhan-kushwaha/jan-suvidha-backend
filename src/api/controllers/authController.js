// backend/src/api/controllers/authController.js
// Handles the business logic for user authentication.

const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');

// --- Validation Schemas ---
const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(), // CHANGED from username
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


// --- Controller Functions ---
exports.register = async (req, res, next) => {
  try {
    // 1. Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { fullName, email, password } = value;

    // Create a simple username from the email for uniqueness if needed, or just rely on email
    const username = email.split('@')[0] + Math.random().toString(36).substring(2, 6);

    // 2. Check if user already exists
    let [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Save user to database with the new full_name field
    const sql = 'INSERT INTO users (username, email, full_name, password_hash) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [username, email, fullName, passwordHash]);
    const userId = result.insertId;

    // ... (JWT generation and response remain the same)
    const token = jwt.sign(
      { id: userId, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({ token });

  } catch (err) {
    next(err);
  }
};


exports.login = async (req, res, next) => {
    try {
        // 1. Validate request body
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { email, password } = value;

        // 2. Find user by email
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 3. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { id: user.id, isAdmin: user.is_admin === 1 },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({ token });

    } catch (err) {
        next(err);
    }
};