const Joi = require('joi');
const Complaint = require('../../models/complaintModel');

// This schema validates the incoming form data, excluding the file.
const complaintSchema = Joi.object({
  description: Joi.string().min(10).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  category: Joi.string().required(),
});

// This is the single, correct version of the submitComplaint function.
exports.submitComplaint = async (req, res, next) => {
  try {
    // 1. Validate the text fields from the form submission.
    const { error, value } = complaintSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // 2. THIS IS THE CRITICAL FIX:
    // Extract the validated data into constants. This defines 'description'.
    const { description, latitude, longitude, category } = value;

    // 3. Check that an image file was uploaded.
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required.' });
    }

    // 4. Get the user's ID securely from the login token.
    const userId = req.user.id;

    // 5. Prepare the data object for the database.
    const complaintData = {
      userId,
      description,
      latitude,
      longitude,
      imageData: req.file.buffer,
      imageMimetype: req.file.mimetype,
      category,
    };
    
    const newComplaint = await Complaint.create(complaintData);
    
    // 6. Send a success response.
    res.status(201).json({
      message: 'Complaint submitted successfully!',
      complaintId: newComplaint.id,
    });
  } catch (err) {
    next(err);
  }
};

// --- Other Controller Functions ---

exports.getComplaints = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const complaints = await Complaint.findAll(page, limit);
        res.status(200).json(complaints);
    } catch (err) {
        next(err);
    }
};

exports.getComplaintById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findById(id);

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }
        
        if (complaint.image_data) {
            complaint.image_data = complaint.image_data.toString('base64');
        }

        res.status(200).json(complaint);
    } catch (err) {
        next(err);
    }
};

exports.updateComplaintStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const allowedStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status provided.' });
        }

        const affectedRows = await Complaint.updateStatus(id, status);

        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        res.status(200).json({ message: 'Status updated successfully.' });
    } catch (err) {
        next(err);
    }
};

exports.upvoteComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; 

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        const result = await Complaint.incrementUpvote(id, userId);
        
        if (result.changed && result.affectedRows === 0) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }

        res.status(200).json({ 
            message: result.message || 'Upvote successful.',
            changed: result.changed 
        });
    } catch (err) {
        next(err);
    }
};