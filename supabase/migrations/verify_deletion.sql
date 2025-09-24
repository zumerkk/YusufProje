-- 9-12. sınıf seviyelerinde kalan sınıfları kontrol et
SELECT 
  grade_level,
  name,
  section,
  student_count
FROM classes 
WHERE grade_level BETWEEN 9 AND 12
ORDER BY grade_level, section;

-- Toplam sınıf sayısını kontrol et
SELECT 
  grade_level,
  COUNT(*) as class_count
FROM classes 
GROUP BY grade_level
ORDER BY grade_level;

-- Genel durum
SELECT 
  COUNT(*) as total_classes,
  MIN(grade_level) as min_grade,
  MAX(grade_level) as max_grade
FROM classes;