-- Demo kullanıcıları ve profilleri oluştur
-- Bu dosya demo hesapları için gerekli verileri ekler

-- Demo kullanıcıları oluştur (şifre: demo123456)
INSERT INTO users (id, email, password_hash, role, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'demo.ogrenci@dersatlasi.com', '$2b$10$K7L/8Y3QTAI9/PdMHNOzNOeWl3r6pIkpX7RumsgnMpMvYPEfZ4F1W', 'student', true),
  ('550e8400-e29b-41d4-a716-446655440001', 'demo.ogretmen@dersatlasi.com', '$2b$10$K7L/8Y3QTAI9/PdMHNOzNOeWl3r6pIkpX7RumsgnMpMvYPEfZ4F1W', 'teacher', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'demo.admin@dersatlasi.com', '$2b$10$K7L/8Y3QTAI9/PdMHNOzNOeWl3r6pIkpX7RumsgnMpMvYPEfZ4F1W', 'admin', true);

-- Demo kullanıcılar için profil bilgileri ekle
INSERT INTO profiles (user_id, first_name, last_name, phone, date_of_birth, avatar_url, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo', 'Öğrenci', '+90 555 123 4567', '2005-06-15', null, 'İstanbul'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Demo', 'Öğretmen', '+90 555 987 6543', '1985-03-20', null, 'Ankara'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Demo', 'Admin', '+90 555 111 2233', '1980-01-10', null, 'İzmir');

-- Demo öğrenci için students tablosuna kayıt ekle
INSERT INTO students (id, user_id, grade_level, school_name, parent_name, parent_phone, parent_email, learning_goals) VALUES
  ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '11', 'Demo Lisesi', 'Demo Veli', '+90 555 999 8877', 'demo.veli@email.com', 'Matematik ve fen bilimleri alanında gelişim');

-- Demo öğretmen için teachers tablosuna kayıt ekle
INSERT INTO teachers (id, user_id, bio, hourly_rate, experience_years, education, is_verified, rating, total_reviews, availability_status) VALUES
  ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'Deneyimli matematik ve fizik öğretmeni. 10 yıllık öğretmenlik deneyimi.', 150.00, 10, 'Matematik Öğretmenliği Lisans', true, 4.8, 25, 'available');

-- Demo öğretmen için uzmanlık alanları ekle
INSERT INTO teacher_subjects (id, teacher_id, subject_name, grade_levels, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 'Matematik', ARRAY['9', '10', '11', '12'], 'Lise matematik dersleri'),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', 'Fizik', ARRAY['9', '10', '11', '12'], 'Lise fizik dersleri');

-- Demo dersler ekle
INSERT INTO lessons (id, teacher_id, student_id, subject, lesson_date, duration_minutes, status, lesson_notes, price, payment_status) VALUES
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440009', 'Matematik', '2024-01-15 14:00:00+03', 60, 'completed', 'Türev konusu işlendi', 150.00, 'paid'),
  ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440009', 'Fizik', '2024-01-20 15:00:00+03', 60, 'scheduled', 'Hareket konusu planlandı', 150.00, 'pending');

-- Demo ders değerlendirmeleri ekle
INSERT INTO lesson_reviews (id, lesson_id, reviewer_id, rating, comment, is_public) VALUES
  ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 5, 'Çok faydalı bir dersti, öğretmen çok açıklayıcıydı.', true);