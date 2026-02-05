import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/billing';
import { toast } from 'sonner';

const CACHE_KEY = 'cached_menu_items';

const getCachedItems = (): MenuItem[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

const setCachedItems = (items: MenuItem[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to cache menu items:', e);
  }
};

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const fetchMenuItems = async (retryCount = 0) => {
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
      setCachedItems(items); // Cache on success
      setIsOffline(false);
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      
      // Retry on network errors
      if (retryCount < 2 && (error.message?.includes('fetch') || error.name === 'TypeError')) {
        console.log(`Retrying menu items... attempt ${retryCount + 1}`);
        setTimeout(() => fetchMenuItems(retryCount + 1), 1000);
        return;
      }
      
      // Load from cache if network fails
      const cached = getCachedItems();
      if (cached.length > 0) {
        setMenuItems(cached);
        setIsOffline(true);
        toast.info('Offline mode - using cached menu');
      } else {
        const isNetworkError = error.message?.includes('fetch') || error.name === 'TypeError';
        toast.error(isNetworkError ? 'Network error. No cached data available.' : 'Failed to load menu');
      }
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
    isOffline,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refetch: fetchMenuItems,
  };
};
