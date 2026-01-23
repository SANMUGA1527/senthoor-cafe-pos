import { useState } from 'react';
import { History, Eye, X } from 'lucide-react';
import { Bill } from '@/types/billing';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface BillHistoryProps {
  bills: Bill[];
}

const BillHistory = ({ bills }: BillHistoryProps) => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const viewBillDetails = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailOpen(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="w-4 h-4" />
          History ({bills.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Bill History
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {bills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No bills yet</p>
              <p className="text-xs mt-1">Printed bills will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.billNumber}>
                    <TableCell className="font-medium">{bill.billNumber}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(bill.date)}
                    </TableCell>
                    <TableCell>{bill.items.length} items</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      ₹{bill.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => viewBillDetails(bill)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Bill Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <DialogTitle>Bill #{selectedBill?.billNumber}</DialogTitle>
            </DialogHeader>
            {selectedBill && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedBill.date)}
                </p>
                
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBill.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{selectedBill.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default BillHistory;
