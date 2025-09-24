-- Delete Zümer Kekillioğlu user and related data
-- First delete from profiles table (child table)
DELETE FROM profiles WHERE user_id = (
    SELECT id FROM users WHERE email = 'z.kekillioglu@gmail.com'
);

-- Then delete from users table (parent table)
DELETE FROM users WHERE email = 'z.kekillioglu@gmail.com';

-- Verify deletion
SELECT COUNT(*) as remaining_records FROM users WHERE email = 'z.kekillioglu@gmail.com';