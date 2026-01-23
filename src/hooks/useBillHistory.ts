import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bill, BillItem } from '@/types/billing';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export const useBillHistory = () => {
  const [billHistory, setBillHistory] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bills from database on mount
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBills: Bill[] = (data || []).map(bill => ({
        billNumber: bill.bill_number,
        items: bill.items as unknown as BillItem[],
        subtotal: Number(bill.subtotal),
        gst: 0,
        total: Number(bill.total),
        date: new Date(bill.created_at),
      }));

      setBillHistory(formattedBills);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bill history');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBill = async (bill: Bill) => {
    try {
      const { error } = await supabase.from('bills').insert([{
        bill_number: bill.billNumber,
        items: bill.items as unknown as Json,
        subtotal: bill.subtotal,
        total: bill.total,
      }]);

      if (error) throw error;

      // Add to local state immediately
      setBillHistory(prev => [bill, ...prev]);
      return true;
    } catch (error) {
      console.error('Error saving bill:', error);
      toast.error('Failed to save bill to database');
      return false;
    }
  };

  return {
    billHistory,
    isLoading,
    saveBill,
    refetchBills: fetchBills,
  };
};
