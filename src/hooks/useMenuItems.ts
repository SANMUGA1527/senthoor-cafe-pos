import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/billing';
import { toast } from 'sonner';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const items: MenuItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        category: item.category,
      }));

      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: item.name,
          price: item.price,
          category: item.category,
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: MenuItem = {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        category: data.category,
      };

      setMenuItems(prev => [...prev, newItem]);
      toast.success(`${item.name} added to menu!`);
      return newItem;
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
      return null;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: updates.name,
          price: updates.price,
          category: updates.category,
        })
        .eq('id', id);

      if (error) throw error;

      setMenuItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      );
      toast.success('Menu item updated!');
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast.info('Menu item deleted');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return {
    menuItems,
    loading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refetch: fetchMenuItems,
  };
};
