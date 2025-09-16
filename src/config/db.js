// backend/src/config/db.js
// This module sets up and exports the MySQL database connection pool.

const mysql = require('mysql2/promise');
require('dotenv').config();

console.log("DB_USER from env:", process.env.DB_USER);
// Create a connection pool using settings from the .env file.
// A pool is more efficient than single connections for web applications.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the promise-based version of the pool for modern async/await usage.
module.exports = pool;
