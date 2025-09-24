-- Check current permissions for tables
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('lessons', 'students', 'users', 'teachers', 'classes')
ORDER BY table_name, grantee;

-- Grant necessary permissions for anon role (for public access)
GRANT SELECT ON lessons TO anon;
GRANT SELECT ON students TO anon;
GRANT SELECT ON users TO anon;
GRANT SELECT ON teachers TO anon;
GRANT SELECT ON classes TO anon;

-- Grant full permissions for authenticated role
GRANT ALL PRIVILEGES ON lessons TO authenticated;
GRANT ALL PRIVILEGES ON students TO authenticated;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON teachers TO authenticated;
GRANT ALL PRIVILEGES ON classes TO authenticated;

-- Also grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;