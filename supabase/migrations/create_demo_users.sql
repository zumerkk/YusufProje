-- Demo kullanıcılarını oluştur
INSERT INTO users (email, password_hash, role, is_active) VALUES 
('demo.ogrenci@dersatlasi.com', '$2b$10$8kmg.qt1Qf.lqTFtzju99uPJpyoQlGkX1MR4xoURj4piun1oiNSRS', 'student', true),
('demo.ogretmen@dersatlasi.com', '$2b$10$8kmg.qt1Qf.lqTFtzju99uPJpyoQlGkX1MR4xoURj4piun1oiNSRS', 'teacher', true),
('demo.admin@dersatlasi.com', '$2b$10$8kmg.qt1Qf.lqTFtzju99uPJpyoQlGkX1MR4xoURj4piun1oiNSRS', 'admin', true)
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;