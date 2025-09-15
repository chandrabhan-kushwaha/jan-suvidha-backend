// backend/src/app.js
// Configures the Express application and its middleware.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const complaintRoutes = require('./api/routes/complaints');
const authRoutes = require('./api/routes/auth'); // Added this line for Auth Route

const app = express();

// --- Core Middleware ---

// Enable Cross-Origin Resource Sharing for the frontend
app.use(cors());

// Set various security-related HTTP headers
app.use(helmet());

// Parse incoming JSON requests
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);


// --- API Routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Jan Suvida API!' });
});
// --- API Routes ---

app.use('/api/auth', authRoutes); // Add this line for api of auth


app.use('/api/complaints', complaintRoutes);


// --- Error Handling ---
// 404 Not Found handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;