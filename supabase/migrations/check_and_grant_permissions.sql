-- Check and grant permissions for classes and class_students tables

-- Check current permissions
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('classes', 'class_students') 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant permissions for classes table
GRANT SELECT ON classes TO anon;
GRANT ALL PRIVILEGES ON classes TO authenticated;

-- Grant permissions for class_students table
GRANT SELECT ON class_students TO anon;
GRANT ALL PRIVILEGES ON class_students TO authenticated;

-- Verify permissions after granting
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('classes', 'class_students') 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

COMMIT;