-- Create test user for testing
INSERT INTO users (email, password_hash, role, is_active) 
VALUES (
  'student@test.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
  'student',
  true
);