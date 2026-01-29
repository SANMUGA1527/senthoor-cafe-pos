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

  const fetchBills = async () => {
    try {
      setError(null);
      console.log('Fetching bills from Supabase...');
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
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to load bill history: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBill = async (bill: Bill) => {
    try {
      console.log('Saving bill to Supabase...', bill);
      const { error: saveError } = await supabase.from('bills').insert([{
        bill_number: bill.billNumber,
        items: bill.items as unknown as Json,
        subtotal: bill.subtotal,
        total: bill.total,
      }]);

      if (saveError) {
        throw saveError;
      }

      // Add to local state immediately
      setBillHistory(prev => [bill, ...prev]);
      return true;
    } catch (err: any) {
      console.error('Error saving bill:', err);
      toast.error(`Failed to save bill: ${err.message || 'Unknown error'}`);
      return false;
    }
  };

  return {
    billHistory,
    isLoading,
    saveBill,
    refetchBills: fetchBills,
    error,
  };
};
