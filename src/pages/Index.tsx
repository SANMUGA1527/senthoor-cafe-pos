import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import Header from '@/components/Header';
import MenuBar from '@/components/MenuBar';
import BillSummary from '@/components/BillSummary';
import PrintableBill from '@/components/PrintableBill';
<<<<<<< HEAD
import BillHistory from '@/components/BillHistory';
=======

>>>>>>> 9969471 (Sync local changes: Update MenuBar, Index, and BillItem)
import { MenuItem, BillItem, Bill } from '@/types/billing';
import { menuItems as initialMenuItems } from '@/data/menuItems';
import { useBillHistory } from '@/hooks/useBillHistory';

const Index = () => {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const { billHistory, saveBill } = useBillHistory();
  const printRef = useRef<HTMLDivElement>(null);
  const [billNumber, setBillNumber] = useState(`BL${Date.now().toString().slice(-6)}`);


  const saveBillToHistory = () => {
    const total = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const bill: Bill = {
      items: billItems,
      subtotal: total,
      gst: 0, // Assuming 0 for now as per current simple logic
      total: total,
      billNumber: billNumber,
      date: new Date()
    };

    const today = new Date().toISOString().split('T')[0];
    const storageKey = `pos_sales_${today}`;
    const existingData = localStorage.getItem(storageKey);
    const bills: Bill[] = existingData ? JSON.parse(existingData) : [];

    bills.push(bill);
    localStorage.setItem(storageKey, JSON.stringify(bills));
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
<<<<<<< HEAD
    onAfterPrint: async () => {
      // Save to database before clearing
      const total = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newBill: Bill = {
        items: [...billItems],
        subtotal: total,
        gst: 0,
        total: total,
        billNumber,
        date: new Date(),
      };
      await saveBill(newBill);
=======
    onAfterPrint: () => {
      saveBillToHistory();
>>>>>>> 9969471 (Sync local changes: Update MenuBar, Index, and BillItem)
      toast.success('Bill printed and saved!');
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

  const handleUpdateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
    toast.success('Menu item updated!');
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    // Also remove from bill if present
    setBillItems(prev => prev.filter(item => item.id !== id));
    toast.info('Menu item deleted');
  };

  return (
    <div className="min-h-screen bg-background">
<<<<<<< HEAD
      <Header billHistory={<BillHistory bills={billHistory} />} />
      
=======
      <div className="relative">
        <Header />

      </div>

>>>>>>> 9969471 (Sync local changes: Update MenuBar, Index, and BillItem)
      <main className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Section - Single Bar */}
          <div className="flex-1">
            <MenuBar
              items={menuItems}
              onAddItem={handleAddItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onAddNewItem={handleAddMenuItem}
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
