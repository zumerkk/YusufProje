-- Demo kullanıcıları şifresini güncelle (demo123456)
-- Admin kullanıcısı şifresini güncelle
UPDATE users SET password_hash = '$2b$10$K7L/8Y3QTAI9/PdMHNOzNOeWl3r6pIkpX7RumsgnMpMvYPEfZ4F1W' WHERE email = 'demo.admin@dersatlasi.com';

-- Teacher kullanıcısı şifresini güncelle
UPDATE users SET password_hash = '$2b$10$K7L/8Y3QTAI9/PdMHNOzNOeWl3r6pIkpX7RumsgnMpMvYPEfZ4F1W' WHERE email = 'demo.ogretmen@dersatlasi.com';

-- Student kullanıcısı şifresini güncelle
UPDATE users SET password_hash = '$2b$10$K7L/8Y3QTAI9/PdMHNOzNOeWl3r6pIkpX7RumsgnMpMvYPEfZ4F1W' WHERE email = 'demo.ogrenci@dersatlasi.com';

-- Tablolar için izinleri kontrol et ve gerekirse ekle
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON teachers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON teacher_subjects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lessons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lesson_reviews TO authenticated;

-- Anon kullanıcılar için sadece okuma izni
GRANT SELECT ON users TO anon;
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON teachers TO anon;
GRANT SELECT ON students TO anon;
GRANT SELECT ON teacher_subjects TO anon;
GRANT SELECT ON lessons TO anon;
GRANT SELECT ON lesson_reviews TO anon;