-- Fix password hash for test users
UPDATE users 
SET password_hash = '$2a$10$UKKVPpY69XitqcFSAvBh4.sD0Oo8XHnb.anonP/fQCn76H7y8RWtm'
WHERE email IN ('student@test.com', 'teacher@test.com');