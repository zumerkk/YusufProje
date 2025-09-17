-- Mevcut kullanıcıları kontrol et
SELECT email, role, is_active FROM users WHERE email LIKE '%demo%' OR email LIKE '%@dersatlasi.com' OR email LIKE '%@example.com';