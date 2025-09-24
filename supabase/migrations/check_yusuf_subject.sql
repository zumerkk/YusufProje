-- Yusuf öğretmeninin güncel branş bilgisini kontrol et
SELECT 
    u.email,
    u.role,
    t.id as teacher_id,
    ts.subject_name,
    ts.proficiency_level,
    ts.years_experience,
    ts.created_at
FROM users u
JOIN teachers t ON u.id = t.user_id
JOIN teacher_subjects ts ON t.id = ts.teacher_id
WHERE u.email = 'yusufkarabulut338@gmail.com'
ORDER BY ts.created_at DESC;