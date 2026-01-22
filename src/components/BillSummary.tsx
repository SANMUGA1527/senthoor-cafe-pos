import { Printer, RotateCcw, Receipt } from 'lucide-react';
import { BillItem as BillItemType } from '@/types/billing';
import BillItem from './BillItem';
import { Button } from './ui/button';

interface BillSummaryProps {
  items: BillItemType[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearBill: () => void;
  onPrintBill: () => void;
}

const BillSummary = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearBill,
  onPrintBill 
}: BillSummaryProps) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstRate = 0.05; // 5% GST
  const gst = subtotal * gstRate;
  const total = subtotal + gst;

  return (
    <div className="bg-card border border-border rounded-2xl h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Current Bill</h2>
          </div>
          {items.length > 0 && (
            <button 
              onClick={onClearBill}
              className="text-muted-foreground hover:text-destructive transition-colors p-2"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {items.length} item{items.length !== 1 ? 's' : ''} added
        </p>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No items added yet</p>
              <p className="text-xs mt-1">Click on menu items to add</p>
            </div>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <BillItem 
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      {items.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30 rounded-b-2xl">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (5%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <Button 
            onClick={onPrintBill}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
            size="lg"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Bill
          </Button>
        </div>
      )}
    </div>
  );
};

export default BillSummary;
