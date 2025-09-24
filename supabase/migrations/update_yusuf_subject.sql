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
  u.full_name,
  u.role,
  t.id as teacher_id,
  ts.subject_name,
  ts.proficiency_level,
  ts.years_experience,
  ts.created_at
FROM users u
JOIN teachers t ON u.id = t.user_id
JOIN teacher_subjects ts ON t.id = ts.teacher_id
WHERE u.email = 'yusufkarabulut338@gmail.com';