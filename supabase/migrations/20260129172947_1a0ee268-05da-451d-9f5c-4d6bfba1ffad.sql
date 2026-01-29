-- Create employees table for staff who can login
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policies for employees table
CREATE POLICY "Allow authenticated users to read employees"
ON public.employees
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to update own employee profile"
ON public.employees
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Add employee_id to bills table to track who created the bill
ALTER TABLE public.bills ADD COLUMN employee_id UUID REFERENCES public.employees(id);
ALTER TABLE public.bills ADD COLUMN employee_name TEXT;

-- Update bills policies to require authentication
DROP POLICY IF EXISTS "Allow public insert access to bills" ON public.bills;
DROP POLICY IF EXISTS "Allow public read access to bills" ON public.bills;

CREATE POLICY "Allow authenticated users to insert bills"
ON public.bills
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read bills"
ON public.bills
FOR SELECT
TO authenticated
USING (true);