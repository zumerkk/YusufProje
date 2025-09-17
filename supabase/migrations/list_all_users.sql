-- Tüm kullanıcıları listele
DO $$
DECLARE
    user_record RECORD;
BEGIN
    RAISE NOTICE 'Listing all users:';
    FOR user_record IN SELECT email, role, is_active FROM users LOOP
        RAISE NOTICE 'Email: %, Role: %, Active: %', user_record.email, user_record.role, user_record.is_active;
    END LOOP;
END $$;