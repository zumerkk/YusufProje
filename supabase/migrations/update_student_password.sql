-- Update test student password with correct hash
UPDATE users 
SET password_hash = '$2a$10$fjDqK0kspt/v6/.j/vEtW.twZkuTf/5DD0iDCw8S6xNcfJj.YiC/y'
WHERE email = 'student@test.com';

-- Verify the update
SELECT id, email, role, is_active FROM users WHERE email = 'student@test.com';