-- Create a test student user
INSERT INTO users (id, email, password_hash, role, is_active) 
VALUES (
  gen_random_uuid(),
  'student@test.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
  'student',
  true
) ON CONFLICT (email) DO NOTHING;

-- Get the created user
SELECT id, email, role FROM users WHERE email = 'student@test.com';