// backend/src/api/models/complaintModel.js
// Handles all database interactions for the complaints table.

const db = require('../config/db');

// Update the create function to include 'category'
exports.create = async ({ userId, description, latitude, longitude, imageData, imageMimetype, category }) => {
  const sql = 'INSERT INTO complaints (user_id, description, latitude, longitude, image_data, image_mimetype, category) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const [result] = await db.query(sql, [userId, description, latitude, longitude, imageData, imageMimetype, category]);
  return { id: result.insertId };
};


// Finds all complaints with pagination
exports.findAll = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const sql = `
    SELECT id, user_id, description, latitude, longitude, status, upvotes, created_at 
    FROM complaints 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.query(sql, [limit, offset]);
  return rows;
};

// Finds a single complaint by its ID, including image data
exports.findById = async (id) => {
  const sql = 'SELECT * FROM complaints WHERE id = ?';
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

// Updates the status of a complaint
exports.updateStatus = async (id, status) => {
    const sql = 'UPDATE complaints SET status = ? WHERE id = ?';
    const [result] = await db.query(sql, [status, id]);
    return result.affectedRows;
};

// Increments the upvote count for a complaint
exports.incrementUpvote = async (complaintId, userId) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Check if the user has already upvoted
        let [rows] = await connection.query('SELECT id FROM upvotes WHERE user_id = ? AND complaint_id = ?', [userId, complaintId]);
        if (rows.length > 0) {
            // User has already upvoted, do nothing
            await connection.commit();
            return { changed: false, message: 'Already upvoted.' };
        }

        // 2. Add a record to the upvotes table
        await connection.query('INSERT INTO upvotes (user_id, complaint_id) VALUES (?, ?)', [userId, complaintId]);

        // 3. Increment the upvotes count in the complaints table
        const [result] = await connection.query('UPDATE complaints SET upvotes = upvotes + 1 WHERE id = ?', [complaintId]);

        await connection.commit();
        return { changed: true, affectedRows: result.affectedRows };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};