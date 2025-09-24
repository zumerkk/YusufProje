-- Check existing users
SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 10;