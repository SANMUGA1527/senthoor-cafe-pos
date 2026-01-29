-- Reset policies for bills table to ensure writing is allowed
DROP POLICY IF EXISTS "Allow public read access to bills" ON public.bills;
DROP POLICY IF EXISTS "Allow public insert access to bills" ON public.bills;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.bills;

-- Ensure RLS is enabled
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Create a single permissive policy for ALL operations (Select, Insert, Update, Delete)
-- This applies to both anonymous and authenticated users
CREATE POLICY "Enable all access for all users"
ON public.bills
FOR ALL
USING (true)
WITH CHECK (true);
