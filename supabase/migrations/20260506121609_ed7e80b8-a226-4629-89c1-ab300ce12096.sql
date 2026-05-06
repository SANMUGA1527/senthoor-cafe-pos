ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS display_order INTEGER;
UPDATE public.menu_items SET display_order = sub.rn FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn FROM public.menu_items) sub WHERE public.menu_items.id = sub.id AND public.menu_items.display_order IS NULL;
CREATE INDEX IF NOT EXISTS menu_items_display_order_idx ON public.menu_items(display_order);