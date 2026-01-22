import { menuItems } from '@/data/menuItems';
import { MenuItem } from '@/types/billing';
import MenuItemCard from './MenuItemCard';

interface MenuGridProps {
  activeCategory: string;
  onAddItem: (item: MenuItem) => void;
}

const MenuGrid = ({ activeCategory, onAddItem }: MenuGridProps) => {
  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {filteredItems.map((item) => (
        <MenuItemCard 
          key={item.id} 
          item={item} 
          onAdd={onAddItem}
        />
      ))}
    </div>
  );
};

export default MenuGrid;
