// backend/src/tests/complaints.test.js
// Integration tests for the /api/complaints endpoints.

const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const path = require('path');

// Mock the database module
jest.mock('../config/db');

describe('Complaints API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for POST /api/complaints
  describe('POST /api/complaints', () => {
    it('should create a new complaint and return 201', async () => {
      const mockComplaintId = 101;
      db.query.mockResolvedValue([{ insertId: mockComplaintId }]);
      
      const response = await request(app)
        .post('/api/complaints')
        .field('description', 'Test pothole description that is long enough.')
        .field('latitude', 28.1234)
        .field('longitude', 77.5678)
        .field('userId', 1)
        .attach('image', path.resolve(__dirname, 'test-image.png')); // Ensure you have a test image here

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('complaintId', mockComplaintId);
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if image is missing', async () => {
        const response = await request(app)
          .post('/api/complaints')
          .field('description', 'Test pothole description.')
          .field('latitude', 28.1234)
          .field('longitude', 77.5678)
          .field('userId', 1);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Image is required.');
    });
  });

  // Test for GET /api/complaints
  describe('GET /api/complaints', () => {
    it('should return a list of complaints', async () => {
      const mockComplaints = [
        { id: 1, description: 'Pothole' },
        { id: 2, description: 'Broken Light' },
      ];
      db.query.mockResolvedValue([mockComplaints]);

      const response = await request(app).get('/api/complaints');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].description).toBe('Pothole');
    });
  });

  // Test for PUT /api/complaints/:id/status
  describe('PUT /api/complaints/:id/status', () => {
    it('should update a complaint status and return 200', async () => {
        db.query.mockResolvedValue([{ affectedRows: 1 }]);

        const response = await request(app)
            .put('/api/complaints/1/status')
            .send({ status: 'IN_PROGRESS' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Status updated successfully.');
        expect(db.query).toHaveBeenCalledWith(expect.any(String), ['IN_PROGRESS', '1']);
    });
  });

  // Test for POST /api/complaints/:id/upvote
  describe('POST /api/complaints/:id/upvote', () => {
    it('should successfully upvote a complaint', async () => {
        // Mock transaction: begin, select (no previous upvote), insert, update, commit
        const mockConnection = {
            beginTransaction: jest.fn(),
            query: jest.fn()
                .mockResolvedValueOnce([[]]) // No existing upvote
                .mockResolvedValueOnce([{}]) // Insert into upvotes
                .mockResolvedValueOnce([{ affectedRows: 1 }]), // Update complaints
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
        };
        db.getConnection.mockResolvedValue(mockConnection);

        const response = await request(app)
            .post('/api/complaints/1/upvote')
            .send({ userId: 2 });
            
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Upvote successful.');
        expect(mockConnection.commit).toHaveBeenCalled();
    });
  });
});