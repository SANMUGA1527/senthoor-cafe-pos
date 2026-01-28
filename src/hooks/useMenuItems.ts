import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/billing';
import { menuItems as initialMenuItems } from '@/data/menuItems';
import { toast } from 'sonner';

export const useMenuItems = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const { data, error } = await (supabase
                .from('menu_items' as any) as any)
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                // If table doesn't exist yet, we'll use initial items
                if (error.code === '42P01') {
                    console.warn('menu_items table does not exist yet. Using static data.');
                    setMenuItems(initialMenuItems);
                    return;
                }
                throw error;
            }

            if (!data || data.length === 0) {
                // Seed database if empty
                console.log('Seeding menu items...');
                const { error: insertError } = await (supabase
                    .from('menu_items' as any) as any)
                    .insert(initialMenuItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        category: item.category
                    })));

                if (insertError) throw insertError;
                setMenuItems(initialMenuItems);
            } else {
                const formattedItems: MenuItem[] = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: Number(item.price),
                    category: item.category,
                }));
                setMenuItems(formattedItems);
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
            toast.error('Failed to load menu items');
            // Fallback to static data on error
            setMenuItems(initialMenuItems);
        } finally {
            setIsLoading(false);
        }
    };

    const addMenuItem = async (newItem: MenuItem) => {
        try {
            const { error } = await (supabase
                .from('menu_items' as any) as any)
                .insert([{
                    id: newItem.id,
                    name: newItem.name,
                    price: newItem.price,
                    category: newItem.category
                }]);

            if (error) {
                if (error.code === '42P01') {
                    toast.error('Database table "menu_items" is missing. Please run the SQL setup script.');
                    return false;
                }
                throw error;
            }

            setMenuItems(prev => [...prev, newItem]);
            toast.success(`${newItem.name} added to menu!`);
            return true;
        } catch (error: any) {
            console.error('Error adding menu item:', error);
            const errorMessage = error?.message || 'Failed to add item to database';
            toast.error(errorMessage);
            return false;
        }
    };

    const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
        try {
            const { error } = await (supabase
                .from('menu_items' as any) as any)
                .update({
                    name: updates.name,
                    price: updates.price,
                    category: updates.category
                } as any)
                .eq('id', id);

            if (error) {
                if (error.code === '42P01') {
                    toast.error('Database table "menu_items" is missing. Please run the SQL setup script.');
                    return false;
                }
                throw error;
            }

            setMenuItems(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, ...updates } : item
                )
            );
            toast.success('Menu item updated!');
            return true;
        } catch (error) {
            console.error('Error updating menu item:', error);
            toast.error('Failed to update item in database');
            return false;
        }
    };

    const deleteMenuItem = async (id: string) => {
        try {
            const { error } = await (supabase
                .from('menu_items' as any) as any)
                .delete()
                .eq('id', id);

            if (error) {
                if (error.code === '42P01') {
                    toast.error('Database table "menu_items" is missing. Please run the SQL setup script.');
                    return false;
                }
                throw error;
            }

            setMenuItems(prev => prev.filter(item => item.id !== id));
            toast.info('Menu item deleted');
            return true;
        } catch (error) {
            console.error('Error deleting menu item:', error);
            toast.error('Failed to delete item from database');
            return false;
        }
    };

    return {
        menuItems,
        isLoading,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        refreshMenuItems: fetchMenuItems
    };
};
