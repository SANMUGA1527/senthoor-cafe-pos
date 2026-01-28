-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL DEFAULT 'menu',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to menu_items"
ON public.menu_items
FOR SELECT
USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access to menu_items"
ON public.menu_items
FOR INSERT
WITH CHECK (true);

-- Allow public delete access
CREATE POLICY "Allow public delete access to menu_items"
ON public.menu_items
FOR DELETE
USING (true);

-- Allow public update access
CREATE POLICY "Allow public update access to menu_items"
ON public.menu_items
FOR UPDATE
USING (true);

-- Insert default menu items
INSERT INTO public.menu_items (name, price, category) VALUES
  ('Paneer Tikka', 180, 'starters'),
  ('Gobi Manchurian', 140, 'starters'),
  ('Veg Spring Roll', 120, 'starters'),
  ('Mushroom 65', 160, 'starters'),
  ('Crispy Corn', 130, 'starters'),
  ('Aloo Tikki', 80, 'starters'),
  ('Paneer Butter Masala', 220, 'main-course'),
  ('Dal Makhani', 180, 'main-course'),
  ('Chana Masala', 150, 'main-course'),
  ('Kadai Paneer', 200, 'main-course'),
  ('Veg Kolhapuri', 170, 'main-course'),
  ('Malai Kofta', 210, 'main-course'),
  ('Jeera Rice', 100, 'rice'),
  ('Veg Biryani', 180, 'rice'),
  ('Pulao', 120, 'rice'),
  ('Fried Rice', 140, 'rice'),
  ('Butter Naan', 45, 'breads'),
  ('Garlic Naan', 55, 'breads'),
  ('Roti', 25, 'breads'),
  ('Paratha', 40, 'breads'),
  ('Kulcha', 50, 'breads'),
  ('Masala Chai', 30, 'beverages'),
  ('Filter Coffee', 40, 'beverages'),
  ('Lassi', 60, 'beverages'),
  ('Fresh Lime Soda', 50, 'beverages'),
  ('Buttermilk', 35, 'beverages'),
  ('Gulab Jamun', 60, 'desserts'),
  ('Rasmalai', 80, 'desserts'),
  ('Ice Cream', 70, 'desserts'),
  ('Kheer', 65, 'desserts');