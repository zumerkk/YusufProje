-- 9-12. sınıf seviyelerindeki tüm sınıfları sil
-- Önce ilişkili tabloları temizle
DELETE FROM class_students WHERE class_id IN (
  SELECT id FROM classes WHERE grade_level BETWEEN 9 AND 12
);

DELETE FROM lessons WHERE class_id IN (
  SELECT id FROM classes WHERE grade_level BETWEEN 9 AND 12
);

DELETE FROM schedules WHERE class_id IN (
  SELECT id FROM classes WHERE grade_level BETWEEN 9 AND 12
);

-- Son olarak sınıfları sil
DELETE FROM classes WHERE grade_level BETWEEN 9 AND 12;

-- Silinen kayıt sayısını kontrol et
SELECT COUNT(*) as remaining_classes_9_to_12 FROM classes WHERE grade_level BETWEEN 9 AND 12;