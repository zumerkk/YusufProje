-- Admin kullanıcısı oluştur
DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
BEGIN
    -- Admin kullanıcısı oluştur
    INSERT INTO users (id, email, password_hash, role, is_active) VALUES
    (admin_id, 'admin@demo.com', '$2b$10$demo.hash.for.testing', 'admin', true)
    ON CONFLICT (email) DO NOTHING;

    -- Admin profili oluştur
    INSERT INTO profiles (user_id, first_name, last_name, phone) 
    SELECT admin_id, 'Admin', 'User', '555-9999'
    WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = admin_id);
END $$;

-- Oluşturulan admin kullanıcısını kontrol et
SELECT 
  u.id,
  u.email,
  u.role,
  p.first_name,
  p.last_name
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.role = 'admin';