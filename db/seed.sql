-- backend/db/seed.sql
-- This script populates the database with initial sample data.
-- Passwords are 'password123' for all users, hashed using bcrypt.

USE jan_suvida;

-- Clear existing data for a clean slate
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE upvotes;
TRUNCATE TABLE complaints;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Seed Users
-- Passwords are all 'password123' hashed with bcrypt (cost factor 10).
INSERT INTO users (username, email, password_hash, is_admin, points) VALUES
('akash_sharma', 'akash@example.com', '$2a$10$T5h0.cAFb7Yg2f.S3/8V/u.kbU2wzYqjN.j4dK3z.g4hL8M7c.z6y', FALSE, 15),
('priya_singh', 'priya@example.com', '$2a$10$T5h0.cAFb7Yg2f.S3/8V/u.kbU2wzYqjN.j4dK3z.g4hL8M7c.z6y', FALSE, 25),
('rohan_mehta', 'rohan@example.com', '$2a$10$T5h0.cAFb7Yg2f.S3/8V/u.kbU2wzYqjN.j4dK3z.g4hL8M7c.z6y', FALSE, 5),
('admin_user', 'admin@jansuvida.gov', '$2a$10$T5h0.cAFb7Yg2f.S3/8V/u.kbU2wzYqjN.j4dK3z.g4hL8M7c.z6y', TRUE, 0);

-- Seed Complaints (image_data is intentionally NULL for this seed script)
INSERT INTO complaints (user_id, description, latitude, longitude, status, upvotes) VALUES
(1, 'Large pothole on Main Street near the central library. Causing traffic issues.', 28.6139, 77.2090, 'PENDING', 5),
(2, 'Streetlight #SL-113 is not working at the corner of Park Avenue and 2nd Street.', 28.6145, 77.2105, 'PENDING', 12),
(1, 'Overflowing garbage bin at City Park entrance. Poses a health hazard.', 28.6150, 77.2120, 'IN_PROGRESS', 8),
(3, 'Broken pavement on the sidewalk along River Road. Dangerous for pedestrians.', 28.6100, 77.2050, 'RESOLVED', 20),
(2, 'Abandoned vehicle (License: DL5CAB1234) has been parked for over a week on Oak Lane.', 28.6180, 77.2150, 'PENDING', 3),
(1, 'Leaking water pipe near the market square is wasting a lot of water.', 28.6125, 77.2085, 'REJECTED', 1);

-- Seed Upvotes
INSERT INTO upvotes (user_id, complaint_id) VALUES
(1, 2), (1, 3),
(2, 1), (2, 4),
(3, 1), (3, 2), (3, 3);