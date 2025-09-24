-- Check and grant permissions for lessons table

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'lessons' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant permissions to authenticated role for lessons table
GRANT ALL PRIVILEGES ON lessons TO authenticated;

-- Grant read access to anon role for lessons table (if needed)
GRANT SELECT ON lessons TO anon;

-- Verify permissions after granting
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'lessons' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;