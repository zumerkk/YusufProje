-- Mevcut demo kullanıcılarının email adreslerini güncelle
UPDATE users SET email = 'demo.ogrenci@dersatlasi.com' WHERE id = '550e8400-e29b-41d4-a716-446655440000';
UPDATE users SET email = 'demo.ogretmen@dersatlasi.com' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE users SET email = 'demo.admin@dersatlasi.com' WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Şifreleri de güncelle (demo123456)
UPDATE users SET password_hash = '$2b$10$K7L/8Y3QTAI9/PdMHNOzNOeWl3r6pIkpX7RumsgnMpMvYPEfZ4F1W' WHERE id = '550e8400-e29b-41d4-a716-446655440000';
UPDATE users SET password_hash = '$2b$10$K7L/8Y3QTAI9/PdMHNOzNOeWl3r6pIkpX7RumsgnMpMvYPEfZ4F1W' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE users SET password_hash = '$2b$10$K7L/8Y3QTAI9/PdMHNOzNOeWl3r6pIkpX7RumsgnMpMvYPEfZ4F1W' WHERE id = '550e8400-e29b-41d4-a716-446655440002';