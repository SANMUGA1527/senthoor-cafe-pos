import { useState } from 'react';
import { Printer, RotateCcw, Receipt, PlusCircle } from 'lucide-react';
import { BillItem as BillItemType } from '@/types/billing';
import BillItem from './BillItem';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface BillSummaryProps {
  items: BillItemType[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearBill: () => void;
  onPrintBill: () => void;
  onManualAdd: (name: string, price: number) => void;
}

const BillSummary = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearBill,
  onPrintBill,
  onManualAdd
}: BillSummaryProps) => {
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAddManual = () => {
    if (!manualPrice) return;
    onManualAdd(manualName, Number(manualPrice));
    setManualName('');
    setManualPrice('');
  };

  return <div className="bg-card border border-border rounded-2xl h-full flex flex-col">
    {/* Header */}
    <div className="p-3 sm:p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base sm:text-lg">Current Bill</h2>
        </div>
        {items.length > 0 && <button onClick={onClearBill} className="text-muted-foreground hover:text-destructive transition-colors p-2">
          <RotateCcw className="w-4 h-4" />
        </button>}
      </div>
      <p className="text-xs text-muted-foreground mt-1 mb-2 sm:mb-3">
        {items.length} item{items.length !== 1 ? 's' : ''} added
      </p>

      {/* Manual Entry Form */}
      <div className="flex gap-1.5 sm:gap-2 items-center">
        <Input
          placeholder="Item Name"
          value={manualName}
          onChange={(e) => setManualName(e.target.value)}
          className="h-8 text-xs flex-1"
        />
        <Input
          type="number"
          placeholder="₹"
          value={manualPrice}
          onChange={(e) => setManualPrice(e.target.value)}
          className="h-8 w-16 sm:w-20 text-xs"
        />
        <Button size="sm" onClick={handleAddManual} className="h-8 w-8 p-0 shrink-0">
          <PlusCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>

    {/* Items List */}
    <div className="flex-1 overflow-y-auto p-4">
      {items.length === 0 ? <div className="h-full flex items-center justify-center text-center">
        <div className="text-muted-foreground">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No items added yet</p>
          <p className="text-xs mt-1">Manual add or click menu</p>
        </div>
      </div> : <div>
        {items.map(item => <BillItem key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} onRemove={onRemoveItem} />)}
      </div>}
    </div>

    {/* Totals - No GST */}
    {items.length > 0 && <div className="p-4 border-t border-border bg-muted/30 rounded-b-2xl">
      <div className="mb-4">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">₹{total.toFixed(2)}</span>
        </div>
      </div>

      <Button onClick={onPrintBill} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3" size="lg">
        <Printer className="w-5 h-5 mr-2" />
        Print Bill
      </Button>
    </div>}
  </div>;
};

export default BillSummary;