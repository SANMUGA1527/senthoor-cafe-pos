-- Create bills table for storing bill history
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Create policy for public read/write access (no auth required for POS system)
CREATE POLICY "Allow public read access to bills" 
ON public.bills 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to bills" 
ON public.bills 
FOR INSERT 
WITH CHECK (true);