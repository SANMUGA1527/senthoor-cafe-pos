import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bill, BillItem } from '@/types/billing';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export const useBillHistory = () => {
  const [billHistory, setBillHistory] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bills from database on mount
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async (retryCount = 0) => {
    try {
      setError(null);
      console.log('Fetching bills...');
      const { data, error: supabaseError } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      console.log('Fetched bills:', data?.length);

      const formattedBills: Bill[] = (data || []).map(bill => ({
        billNumber: bill.bill_number,
        items: bill.items as unknown as BillItem[],
        subtotal: Number(bill.subtotal),
        gst: 0,
        total: Number(bill.total),
        date: new Date(bill.created_at),
      }));

      setBillHistory(formattedBills);
    } catch (err: any) {
      console.error('Error fetching bills:', err);
      
      // Retry on network errors
      if (retryCount < 2 && (err.message?.includes('fetch') || err.name === 'TypeError')) {
        console.log(`Retrying... attempt ${retryCount + 1}`);
        setTimeout(() => fetchBills(retryCount + 1), 1000);
        return;
      }
      
      const isNetworkError = err.message?.includes('fetch') || err.name === 'TypeError';
      const errorMessage = isNetworkError 
        ? 'Network error. Check your connection.' 
        : (err.message || 'Unknown error');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBill = async (bill: Bill, employeeId?: string, employeeName?: string) => {
    try {
      console.log('Saving bill to Supabase...', bill);
      const { error: saveError } = await supabase.from('bills').insert([{
        bill_number: bill.billNumber,
        items: bill.items as unknown as Json,
        subtotal: bill.subtotal,
        total: bill.total,
        employee_id: employeeId || null,
        employee_name: employeeName || null,
      }]);

      if (saveError) {
        throw saveError;
      }

      // Add to local state immediately with employee info
      const billWithEmployee = { ...bill, billedBy: employeeName };
      setBillHistory(prev => [billWithEmployee, ...prev]);
      return true;
    } catch (err: any) {
      console.error('Error saving bill:', err);
      toast.error(`Failed to save bill: ${err.message || 'Unknown error'}`);
      return false;
    }
  };

  const deleteBill = async (billNumber: string) => {
    try {
      console.log('Deleting bill:', billNumber);
      const { error: deleteError } = await supabase
        .from('bills')
        .delete()
        .eq('bill_number', billNumber);

      if (deleteError) {
        throw deleteError;
      }

      setBillHistory(prev => prev.filter(bill => bill.billNumber !== billNumber));
      toast.success('Bill deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting bill:', err);
      toast.error(`Failed to delete bill: ${err.message || 'Unknown error'}`);
      return false;
    }
  };

  const clearAllHistory = async () => {
    try {
      console.log('Clearing all history...');
      const { error: deleteError } = await supabase
        .from('bills')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete where ID is not empty (effectively all)

      if (deleteError) {
        throw deleteError;
      }

      setBillHistory([]);
      toast.success('All history cleared successfully');
      return true;
    } catch (err: any) {
      console.error('Error clearing history:', err);
      toast.error(`Failed to clear history: ${err.message || 'Unknown error'}`);
      return false;
    }
  };

  return {
    billHistory,
    isLoading,
    saveBill,
    deleteBill,
    clearAllHistory,
    refetchBills: fetchBills,
    error,
  };
};
