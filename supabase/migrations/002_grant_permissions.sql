-- Grant permissions to anon and authenticated roles

-- Grant SELECT permissions to anon role for public data
GRANT SELECT ON teachers TO anon;
GRANT SELECT ON teacher_subjects TO anon;
GRANT SELECT ON lesson_reviews TO anon;

-- Grant full permissions to authenticated role
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON profiles TO authenticated;
GRANT ALL PRIVILEGES ON teachers TO authenticated;
GRANT ALL PRIVILEGES ON students TO authenticated;
GRANT ALL PRIVILEGES ON teacher_subjects TO authenticated;
GRANT ALL PRIVILEGES ON lessons TO authenticated;
GRANT ALL PRIVILEGES ON lesson_reviews TO authenticated;

-- Grant USAGE on sequences to authenticated role
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;