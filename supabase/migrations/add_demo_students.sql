-- Demo öğrenci verileri ekle

-- Önce demo öğrenci kullanıcıları oluştur (rastgele UUID'ler kullan)
DO $$
DECLARE
    zuemer_id UUID := gen_random_uuid();
    ahmet_id UUID := gen_random_uuid();
    ayse_id UUID := gen_random_uuid();
    mehmet_id UUID := gen_random_uuid();
    fatma_id UUID := gen_random_uuid();
BEGIN
    -- Users tablosuna ekle
    INSERT INTO users (id, email, password_hash, role, is_active) VALUES
    (zuemer_id, 'zuemer@demo.com', '$2b$10$demo.hash.for.testing', 'student', true),
    (ahmet_id, 'ahmet8@demo.com', '$2b$10$demo.hash.for.testing', 'student', true),
    (ayse_id, 'ayse8@demo.com', '$2b$10$demo.hash.for.testing', 'student', true),
    (mehmet_id, 'mehmet7@demo.com', '$2b$10$demo.hash.for.testing', 'student', true),
    (fatma_id, 'fatma6@demo.com', '$2b$10$demo.hash.for.testing', 'student', true)
    ON CONFLICT (email) DO NOTHING;

    -- Profiles tablosuna ekle (sadece mevcut değilse)
     INSERT INTO profiles (user_id, first_name, last_name, phone) 
     SELECT zuemer_id, 'Zümer', 'Kekillioğlu', '555-0001'
     WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = zuemer_id);
     
     INSERT INTO profiles (user_id, first_name, last_name, phone) 
     SELECT ahmet_id, 'Ahmet', 'Yılmaz', '555-0002'
     WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = ahmet_id);
     
     INSERT INTO profiles (user_id, first_name, last_name, phone) 
     SELECT ayse_id, 'Ayşe', 'Demir', '555-0003'
     WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = ayse_id);
     
     INSERT INTO profiles (user_id, first_name, last_name, phone) 
     SELECT mehmet_id, 'Mehmet', 'Kaya', '555-0004'
     WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = mehmet_id);
     
     INSERT INTO profiles (user_id, first_name, last_name, phone) 
     SELECT fatma_id, 'Fatma', 'Özkan', '555-0005'
     WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = fatma_id);

     -- Students tablosuna ekle (sadece mevcut değilse)
     INSERT INTO students (user_id, grade_level, school_name, parent_name, parent_phone, parent_email) 
     SELECT zuemer_id, '8. Sınıf', 'Demo İlkokulu', 'Ali Kekillioğlu', '555-1001', 'ali@demo.com'
     WHERE NOT EXISTS (SELECT 1 FROM students WHERE user_id = zuemer_id);
     
     INSERT INTO students (user_id, grade_level, school_name, parent_name, parent_phone, parent_email) 
     SELECT ahmet_id, '8. Sınıf', 'Demo İlkokulu', 'Veli Yılmaz', '555-1002', 'veli@demo.com'
     WHERE NOT EXISTS (SELECT 1 FROM students WHERE user_id = ahmet_id);
     
     INSERT INTO students (user_id, grade_level, school_name, parent_name, parent_phone, parent_email) 
     SELECT ayse_id, '8. Sınıf', 'Demo İlkokulu', 'Emine Demir', '555-1003', 'emine@demo.com'
     WHERE NOT EXISTS (SELECT 1 FROM students WHERE user_id = ayse_id);
     
     INSERT INTO students (user_id, grade_level, school_name, parent_name, parent_phone, parent_email) 
     SELECT mehmet_id, '7. Sınıf', 'Demo İlkokulu', 'Hasan Kaya', '555-1004', 'hasan@demo.com'
     WHERE NOT EXISTS (SELECT 1 FROM students WHERE user_id = mehmet_id);
     
     INSERT INTO students (user_id, grade_level, school_name, parent_name, parent_phone, parent_email) 
     SELECT fatma_id, '6. Sınıf', 'Demo İlkokulu', 'Zeynep Özkan', '555-1005', 'zeynep@demo.com'
     WHERE NOT EXISTS (SELECT 1 FROM students WHERE user_id = fatma_id);
END $$;

-- Eklenen verileri kontrol et
SELECT 
  u.email,
  p.first_name,
  p.last_name,
  s.grade_level,
  s.school_name
FROM users u
JOIN profiles p ON u.id = p.user_id
JOIN students s ON u.id = s.user_id
WHERE u.role = 'student'
ORDER BY s.grade_level, p.first_name;