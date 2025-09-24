-- Trigger'ı geçici olarak devre dışı bırak
DROP TRIGGER IF EXISTS update_teacher_subjects_updated_at ON teacher_subjects;

-- Yusuf öğretmeninin branşını 'Fen Bilimleri' olarak güncelle
UPDATE teacher_subjects 
SET subject_name = 'Fen Bilimleri'
WHERE teacher_id = (
  SELECT t.id 
  FROM teachers t
  JOIN users u ON t.user_id = u.id
  WHERE u.email = 'yusufkarabulut338@gmail.com'
);

-- Güncelleme sonucunu kontrol et
SELECT 
  u.email,
  p.first_name,
  p.last_name,
  u.role,
  t.id as teacher_id,
  ts.subject_name,
  ts.proficiency_level,
  ts.years_experience
FROM users u
JOIN teachers t ON u.id = t.user_id
JOIN teacher_subjects ts ON t.id = ts.teacher_id
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'yusufkarabulut338@gmail.com';