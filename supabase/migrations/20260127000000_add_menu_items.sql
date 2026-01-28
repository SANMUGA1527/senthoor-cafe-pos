-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (similar to bills)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to menu_items') THEN
    CREATE POLICY "Allow public read access to menu_items" ON public.menu_items FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert access to menu_items') THEN
    CREATE POLICY "Allow public insert access to menu_items" ON public.menu_items FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update access to menu_items') THEN
    CREATE POLICY "Allow public update access to menu_items" ON public.menu_items FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public delete access to menu_items') THEN
    CREATE POLICY "Allow public delete access to menu_items" ON public.menu_items FOR DELETE USING (true);
  END IF;
END $$;
