import { useState, useRef, useEffect } from 'react';
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
  const { billHistory, saveBill, deleteBill, clearAllHistory, isLoading, error } = useBillHistory();
  const { employee } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const [billNumber, setBillNumber] = useState(`BL${Date.now().toString().slice(-6)}`);

  // Monthly Backup Alert
  useEffect(() => {
    const checkBackupReminder = () => {
      const today = new Date();
      // Format: YYYY-MM
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const lastReminder = localStorage.getItem('last_backup_reminder');

      if (lastReminder !== currentMonth) {
        toast('📅 Backup Reminder', {
          description: 'Please download your monthly bill history for your records.',
          duration: Infinity, // Stays until dismissed or clicked
          action: {
            label: 'Got it',
            onClick: () => {
              localStorage.setItem('last_backup_reminder', currentMonth);
              toast.dismiss();
            }
          },
          cancel: {
            label: 'Remind Later',
            onClick: () => toast.dismiss()
          }
        });
      }
    };

    // Check on mount
    const timeout = setTimeout(checkBackupReminder, 2000); // 2-second delay to not crowd initial load
    return () => clearTimeout(timeout);
  }, []);

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
      const success = await saveBill(newBill);
      if (success) {
        toast.success('Bill printed and saved!');
        handleClearBill();
      }
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

  const handleManualAdd = (name: string, price: number) => {
    const newItem: BillItem = {
      id: `manual-${Date.now()}`,
      name: name || 'Custom Item',
      price: price,
      category: 'Manual',
      quantity: 1
    };

    setBillItems(prev => [...prev, newItem]);
    toast.success('Manual item added');
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
      <Header billHistory={<BillHistory bills={billHistory} isLoading={isLoading} error={error} onDelete={deleteBill} onClearAll={clearAllHistory} />} />

      <main className="h-[calc(100vh-4rem)] p-2 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-full">
          {/* Menu Section */}
          <div className="h-full overflow-hidden">
            <MenuBar
              items={menuItems}
              onAddItem={handleAddItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onAddNewItem={handleAddMenuItem}
            />
          </div>

          {/* Bill Section */}
          <div className="h-full overflow-hidden">
            <BillSummary
              items={billItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearBill={handleClearBill}
              onPrintBill={handlePrint}
              onManualAdd={handleManualAdd}
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
