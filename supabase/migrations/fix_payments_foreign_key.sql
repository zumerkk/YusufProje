-- Fix foreign key constraint for payments table
-- Drop the existing constraint that references auth.users
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS payments_student_id_fkey;

-- Add new constraint that references public.users
ALTER TABLE public.payments 
ADD CONSTRAINT payments_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT SELECT ON public.payments TO anon;