import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import MenuGrid from '@/components/MenuGrid';
import BillSummary from '@/components/BillSummary';
import PrintableBill from '@/components/PrintableBill';
import AddItemDialog from '@/components/AddItemDialog';
import { MenuItem, BillItem } from '@/types/billing';
import { menuItems as initialMenuItems } from '@/data/menuItems';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('starters');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const printRef = useRef<HTMLDivElement>(null);
  const [billNumber, setBillNumber] = useState(`BL${Date.now().toString().slice(-6)}`);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => {
      toast.success('Bill printed successfully!');
      handleClearBill();
    },
  });

  const handleAddItem = (item: MenuItem) => {
    setBillItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to bill`);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setBillItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setBillItems(prev => prev.filter(item => item.id !== id));
    toast.info('Item removed from bill');
  };

  const handleClearBill = () => {
    setBillItems([]);
    setBillNumber(`BL${Date.now().toString().slice(-6)}`);
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems(prev => [...prev, newItem]);
    toast.success(`${newItem.name} added to menu!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Section */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-xl font-semibold">Menu</h2>
              <AddItemDialog onAddMenuItem={handleAddMenuItem} />
            </div>
            
            <CategoryTabs 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />
            
            <MenuGrid 
              activeCategory={activeCategory} 
              onAddItem={handleAddItem}
            />
          </div>

          {/* Bill Section */}
          <div className="lg:w-96 lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">
            <BillSummary 
              items={billItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearBill={handleClearBill}
              onPrintBill={handlePrint}
            />
          </div>
        </div>
      </main>

      {/* Hidden Printable Bill */}
      <div className="hidden">
        <PrintableBill 
          ref={printRef}
          items={billItems}
          billNumber={billNumber}
        />
      </div>
    </div>
  );
};

export default Index;
