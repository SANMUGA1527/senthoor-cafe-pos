import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import Header from '@/components/Header';
import MenuBar from '@/components/MenuBar';
import BillSummary from '@/components/BillSummary';
import PrintableBill from '@/components/PrintableBill';
import BillHistory from '@/components/BillHistory';
import { MenuItem, BillItem, Bill } from '@/types/billing';
import { useBillHistory } from '@/hooks/useBillHistory';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenuItems();
  const { billHistory, saveBill } = useBillHistory();
  const { employee } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const [billNumber, setBillNumber] = useState(`BL${Date.now().toString().slice(-6)}`);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
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
        billedBy: employee?.name,
      };
      await saveBill(newBill, employee?.id, employee?.name);
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

  const handleAddMenuItem = async (newItem: MenuItem) => {
    await addMenuItem({
      name: newItem.name,
      price: newItem.price,
      category: newItem.category,
    });
  };

  const handleUpdateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    await updateMenuItem(id, updates);
  };

  const handleDeleteMenuItem = async (id: string) => {
    await deleteMenuItem(id);
    // Also remove from bill if present
    setBillItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header billHistory={<BillHistory bills={billHistory} />} />

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
          billedBy={employee?.name}
        />
      </div>

    </div>
  );
};

export default Index;
