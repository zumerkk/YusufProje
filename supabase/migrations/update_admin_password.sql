-- Admin kullanıcısının şifresini güncelle
UPDATE users 
SET password_hash = '$2b$10$IF.9DKG7eMeJD5Mcom52cuzBLBt1rVPS7NZmgoGPnrPTU0q5gdjZK'
WHERE email = 'admin@demo.com' AND role = 'admin';

-- Güncellemeyi kontrol et
SELECT email, role, is_active FROM users WHERE email = 'admin@demo.com';