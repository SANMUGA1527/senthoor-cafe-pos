import { Plus } from 'lucide-react';
import { MenuItem } from '@/types/billing';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const MenuItemCard = ({ item, onAdd }: MenuItemCardProps) => {
  return (
    <div 
      className="bg-card border border-border rounded-xl p-4 hover:shadow-warm 
                 transition-all duration-200 hover:scale-[1.02] cursor-pointer
                 animate-fade-in group"
      onClick={() => onAdd(item)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="veg-indicator" />
            <h3 className="font-medium text-foreground">{item.name}</h3>
          </div>
          <p className="text-lg font-semibold text-primary">₹{item.price}</p>
        </div>
        <button 
          className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground
                     p-2 rounded-lg transition-all duration-200 group-hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(item);
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;
