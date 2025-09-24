-- Find Zümer Kekillioğlu user
SELECT 
    u.id as user_id,
    u.email,
    u.role,
    p.id as profile_id,
    p.first_name,
    p.last_name
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'z.kekillioglu@gmail.com';