-- Fix foreign key constraint for student_packages table
-- Drop the existing constraint that references auth.users
ALTER TABLE public.student_packages 
DROP CONSTRAINT IF EXISTS student_packages_student_id_fkey;

-- Add new constraint that references public.users
ALTER TABLE public.student_packages 
ADD CONSTRAINT student_packages_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE ON public.student_packages TO authenticated;
GRANT SELECT ON public.student_packages TO anon;