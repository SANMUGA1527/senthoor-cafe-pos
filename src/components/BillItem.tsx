import { Minus, Plus, Trash2 } from 'lucide-react';
import { BillItem as BillItemType } from '@/types/billing';

interface BillItemProps {
  item: BillItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const BillItem = ({ item, onUpdateQuantity, onRemove }: BillItemProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0 animate-slide-up">
      <div className="flex-1">
        <p className="font-medium text-sm text-foreground">{item.name}</p>
        <p className="text-xs text-muted-foreground">₹{item.price} each</p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-muted rounded-lg">
          <button 
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1.5 hover:bg-primary/10 rounded-l-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-3 font-semibold text-sm min-w-[2rem] text-center">
            {item.quantity}
          </span>
          <button 
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1.5 hover:bg-primary/10 rounded-r-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <span className="font-semibold text-sm min-w-[4rem] text-right">
          ₹{item.price * item.quantity}
        </span>
        
        <button 
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BillItem;
