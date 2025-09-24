-- Delete existing admin user if exists
DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@test.com');
DELETE FROM users WHERE email = 'admin@test.com';

-- Create test admin user
INSERT INTO users (email, password_hash, role, is_active) 
VALUES ('admin@test.com', '$2a$10$G6H9uTZPQh0NoLyEsBGn2u802f7i9a/9Vc8JHcUoNGYWF3NiFFZm.', 'admin', true);

-- Create corresponding profile
INSERT INTO profiles (user_id, first_name, last_name)
SELECT id, 'Admin', 'User' FROM users WHERE email = 'admin@test.com';