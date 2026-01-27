import { useState, useMemo } from 'react';
import { History, Eye, Download, Calendar, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { jsPDF } from 'jspdf';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

interface BillHistoryProps {
  bills: Bill[];
}

type FilterType = 'all' | 'day' | 'month' | 'range';

const BillHistory = ({ bills }: BillHistoryProps) => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Get available months from bills
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    bills.forEach(bill => {
      const date = new Date(bill.date);
      months.add(format(date, 'yyyy-MM'));
    });
    return Array.from(months).sort().reverse();
  }, [bills]);

  // Filter bills based on selection
  const filteredBills = useMemo(() => {
    if (filterType === 'all') return bills;
    
    if (filterType === 'day' && selectedDate) {
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      return bills.filter(bill => 
        isWithinInterval(new Date(bill.date), { start: dayStart, end: dayEnd })
      );
    }
    
    if (filterType === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthStart = startOfMonth(new Date(year, month - 1));
      const monthEnd = endOfMonth(new Date(year, month - 1));
      return bills.filter(bill => 
        isWithinInterval(new Date(bill.date), { start: monthStart, end: monthEnd })
      );
    }

    if (filterType === 'range' && startDate && endDate) {
      const rangeStart = startOfDay(startDate);
      const rangeEnd = endOfDay(endDate);
      return bills.filter(bill => 
        isWithinInterval(new Date(bill.date), { start: rangeStart, end: rangeEnd })
      );
    }
    
    return bills;
  }, [bills, filterType, selectedDate, selectedMonth, startDate, endDate]);

  // Calculate totals for filtered bills
  const filteredTotal = useMemo(() => {
    return filteredBills.reduce((sum, bill) => sum + bill.total, 0);
  }, [filteredBills]);

  // Download as CSV
  const downloadCSV = () => {
    const headers = ['Bill No.', 'Date & Time', 'Items', 'Total'];
    const rows = filteredBills.map(bill => [
      bill.billNumber,
      format(new Date(bill.date), 'dd MMM yyyy, HH:mm'),
      bill.items.map(item => `${item.name} x${item.quantity}`).join('; '),
      `₹${bill.total.toFixed(2)}`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    let filename = 'bills';
    if (filterType === 'day' && selectedDate) {
      filename += `_${format(selectedDate, 'yyyy-MM-dd')}`;
    } else if (filterType === 'month' && selectedMonth) {
      filename += `_${selectedMonth}`;
    }
    link.setAttribute('download', `${filename}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download as PDF with receipt layout
  const downloadPDF = (bill: Bill) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // Receipt width
    });

    const pageWidth = 80;
    let y = 10;

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SRI SENTHOOR', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('& Cafe 77', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setFontSize(8);
    doc.text('★ Pure Vegetarian ★', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text('123 Main Street, City', pageWidth / 2, y, { align: 'center' });
    y += 3;
    doc.text('Phone: +91 98765 43210', pageWidth / 2, y, { align: 'center' });
    y += 5;

    // Dashed line
    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    // Bill info
    doc.setFontSize(8);
    doc.text(`Bill No: ${bill.billNumber}`, 5, y);
    doc.text(format(new Date(bill.date), 'dd/MM/yyyy HH:mm'), pageWidth - 5, y, { align: 'right' });
    y += 5;

    // Dashed line
    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    // Items header
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 5, y);
    doc.text('Qty', 45, y, { align: 'center' });
    doc.text('Amt', pageWidth - 5, y, { align: 'right' });
    y += 4;

    // Items
    doc.setFont('helvetica', 'normal');
    bill.items.forEach(item => {
      const itemName = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;
      doc.text(itemName, 5, y);
      doc.text(item.quantity.toString(), 45, y, { align: 'center' });
      doc.text(`₹${(item.price * item.quantity).toFixed(0)}`, pageWidth - 5, y, { align: 'right' });
      y += 4;
    });

    y += 2;
    // Dashed line
    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 5, y);
    doc.text(`₹${bill.total.toFixed(2)}`, pageWidth - 5, y, { align: 'right' });
    y += 6;

    // Dashed line
    doc.setFontSize(8);
    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for dining with us!', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text('Visit Again ❤', pageWidth / 2, y, { align: 'center' });

    doc.save(`bill_${bill.billNumber}.pdf`);
  };

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

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-border">
          <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bills</SelectItem>
              <SelectItem value="day">By Day</SelectItem>
              <SelectItem value="month">By Month</SelectItem>
              <SelectItem value="range">Date Range</SelectItem>
            </SelectContent>
          </Select>

          {filterType === 'day' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}

          {filterType === 'month' && (
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.length > 0 ? (
                  availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(month + '-01'), 'MMMM yyyy')}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={selectedMonth}>
                    {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}

          {filterType === 'range' && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[130px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMM yy") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[130px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yy") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex-1" />

          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadCSV}
            disabled={filteredBills.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </div>

        {/* Summary */}
        {filteredBills.length > 0 && (
          <div className="flex items-center justify-between text-sm py-2 px-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">
              Showing {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''}
            </span>
            <span className="font-semibold text-primary">
              Total: ₹{filteredTotal.toFixed(2)}
            </span>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {filteredBills.length === 0 ? (
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
                {filteredBills.map((bill) => (
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
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => viewBillDetails(bill)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadPDF(bill)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
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
