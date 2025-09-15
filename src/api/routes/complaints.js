// backend/src/api/routes/complaints.js
// Defines the routes for complaint-related endpoints.

const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/authMiddleware');


// 2. Add 'protect' middleware before the controller function
router.post('/', protect, upload.single('image'), complaintController.submitComplaint);


// GET /api/complaints - Get a paginated list of all complaints
router.get('/', complaintController.getComplaints);

// GET /api/complaints/:id - Get a single complaint by its ID
router.get('/:id', complaintController.getComplaintById);

// PUT /api/complaints/:id/status - Update the status of a complaint (for admins)
router.put('/:id/status', complaintController.updateComplaintStatus);

// POST /api/complaints/:id/upvote - Upvote a complaint
router.post('/:id/upvote', complaintController.upvoteComplaint);


module.exports = router;