import { useState, useMemo } from 'react';
import { History, Eye, Download, Calendar, FileText, FileArchive } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Bill } from '@/types/billing';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
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
  isLoading?: boolean;
  error?: string | null;
}

type FilterType = 'all' | 'day' | 'month' | 'range';

const BillHistory = ({ bills, isLoading = false, error }: BillHistoryProps) => {
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
      `Rs. ${bill.total.toFixed(2)}`
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

  // Generate PDF for a bill and return the doc
  const generateBillPDF = (bill: Bill): jsPDF => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    });

    const pageWidth = 80;
    let y = 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HOTEL SRI SENTHOOR', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('& Cafe 77 &', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setFontSize(8);
    doc.text('--- Pure Vegetarian ---', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text('Near Nagampatti Toll Plaza,', pageWidth / 2, y, { align: 'center' });
    y += 3.5;
    doc.text('Krishnagiri District,', pageWidth / 2, y, { align: 'center' });
    y += 3.5;
    doc.text('Tamil Nadu - 635203', pageWidth / 2, y, { align: 'center' });
    y += 3;
    doc.text('Phone: +91 70106 95808', pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    doc.setFontSize(8);
    doc.text(`Bill No: ${bill.billNumber}`, 5, y);
    doc.text(format(new Date(bill.date), 'dd/MM/yyyy HH:mm'), pageWidth - 5, y, { align: 'right' });
    y += 5;

    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Item', 5, y);
    doc.text('Qty', 45, y, { align: 'center' });
    doc.text('Amt', pageWidth - 5, y, { align: 'right' });
    y += 4;

    doc.setFont('helvetica', 'normal');
    bill.items.forEach(item => {
      const itemName = item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name;
      doc.text(itemName, 5, y);
      doc.text(item.quantity.toString(), 45, y, { align: 'center' });
      doc.text(`Rs. ${(item.price * item.quantity).toFixed(0)}`, pageWidth - 5, y, { align: 'right' });
      y += 4;
    });

    y += 2;
    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 5, y);
    doc.text(`Rs. ${bill.total.toFixed(2)}`, pageWidth - 5, y, { align: 'right' });
    y += 6;

    doc.setFontSize(8);
    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for dining with us!', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text('Visit Again', pageWidth / 2, y, { align: 'center' });

    return doc;
  };

  // Download single bill as PDF
  const downloadPDF = (bill: Bill) => {
    const doc = generateBillPDF(bill);
    doc.save(`bill_${bill.billNumber}.pdf`);
  };

  // Download all filtered bills as a single combined PDF (list format)
  const downloadAllAsSinglePDF = () => {
    if (filteredBills.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    let y = margin;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('HOTEL SRI SENTHOOR', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('& Cafe 77 &', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(10);
    doc.text('--- Pure Vegetarian ---', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Date range info
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    let dateInfo = 'All Bills';
    if (filterType === 'day' && selectedDate) {
      dateInfo = `Bills for ${format(selectedDate, 'dd MMMM yyyy')}`;
    } else if (filterType === 'month' && selectedMonth) {
      dateInfo = `Bills for ${format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}`;
    } else if (filterType === 'range' && startDate && endDate) {
      dateInfo = `Bills from ${format(startDate, 'dd MMM yyyy')} to ${format(endDate, 'dd MMM yyyy')}`;
    }
    doc.text(dateInfo, pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 10;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold'); // Keep bold for header text
    doc.text('Date & Time', margin + 3, y);
    doc.text('Item', margin + 65, y);
    doc.text('Qty', margin + 140, y, { align: 'center' });
    doc.text('Amount', pageWidth - margin - 3, y, { align: 'right' });
    y += 8;

    // Draw line under header
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);

    let grandTotal = 0;

    // Bills data
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    filteredBills.forEach((bill, billIndex) => {
      const billStartY = y;
      let isFirstItem = true;

      bill.items.forEach((item, itemIndex) => {
        // Check if we need a new page
        if (y > pageHeight - 25) {
          doc.addPage();
          y = margin;

          // Repeat header on new page
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold'); // Keep bold for header text
          doc.text('Date & Time', margin + 3, y);
          doc.text('Item', margin + 65, y);
          doc.text('Qty', margin + 140, y, { align: 'center' });
          doc.text('Amount', pageWidth - margin - 3, y, { align: 'right' });
          y += 8;
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y - 2, pageWidth - margin, y - 2);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          isFirstItem = true;
        }

        // Bill number and date only on first item row
        if (isFirstItem) {
          doc.text(bill.billNumber, margin + 3, y);
          doc.text(format(new Date(bill.date), 'dd/MM/yy HH:mm'), margin + 35, y);
          isFirstItem = false;
        }

        // Item details
        const itemName = item.name.length > 35 ? item.name.substring(0, 35) + '...' : item.name;
        doc.text(itemName, margin + 65, y);
        doc.text(item.quantity.toString(), margin + 140, y, { align: 'center' });
        doc.text(`Rs. ${(item.price * item.quantity).toFixed(0)}`, pageWidth - margin - 3, y, { align: 'right' });
        y += 5;
      });

      // Bill total row
      doc.setFont('helvetica', 'bold');
      doc.text('Bill Total:', margin + 115, y);
      doc.text(`Rs. ${bill.total.toFixed(2)}`, pageWidth - margin - 3, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      grandTotal += bill.total;
      y += 3;

      // Separator line between bills
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    });

    // Grand total
    y += 5;
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL:', margin + 100, y);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, pageWidth - margin - 3, y, { align: 'right' });
    y += 8;

    // Summary
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Bills: ${filteredBills.length}`, margin, y);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, pageWidth - margin, y, { align: 'right' });

    let filename = 'all_bills';
    if (filterType === 'day' && selectedDate) {
      filename = `bills_${format(selectedDate, 'yyyy-MM-dd')}`;
    } else if (filterType === 'month' && selectedMonth) {
      filename = `bills_${selectedMonth}`;
    } else if (filterType === 'range' && startDate && endDate) {
      filename = `bills_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`;
    }

    doc.save(`${filename}.pdf`);
  };

  // Download all filtered bills as ZIP
  const downloadAllAsZIP = async () => {
    if (filteredBills.length === 0) return;

    const zip = new JSZip();

    filteredBills.forEach(bill => {
      const doc = generateBillPDF(bill);
      const pdfBlob = doc.output('blob');
      zip.file(`bill_${bill.billNumber}.pdf`, pdfBlob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    let filename = 'all_bills';
    if (filterType === 'day' && selectedDate) {
      filename = `bills_${format(selectedDate, 'yyyy-MM-dd')}`;
    } else if (filterType === 'month' && selectedMonth) {
      filename = `bills_${selectedMonth}`;
    } else if (filterType === 'range' && startDate && endDate) {
      filename = `bills_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`;
    }

    saveAs(zipBlob, `${filename}.zip`);
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
        <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          <History className={cn("w-4 h-4", isLoading && "animate-spin")} />
          History {isLoading ? '...' : `(${bills.length})`}
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              disabled={filteredBills.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filteredBills.length === 0}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  PDF ({filteredBills.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card">
                <DropdownMenuItem onClick={downloadAllAsSinglePDF} className="gap-2 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  Single PDF (all receipts)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadAllAsZIP} className="gap-2 cursor-pointer">
                  <FileArchive className="w-4 h-4" />
                  ZIP (individual PDFs)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary */}
        {filteredBills.length > 0 && (
          <div className="flex items-center justify-between text-sm py-2 px-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">
              Showing {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''}
            </span>
            <span className="font-semibold text-primary">
              Total: Rs. {filteredTotal.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
              <p>Loading history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p className="font-semibold">Error loading history</p>
              <p className="text-sm mt-1 mb-4">{error}</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No bills yet</p>
              <p className="text-xs mt-1">Printed bills will appear here</p>
              {bills.length === 0 && (
                <div className="mt-6 p-4 border rounded-md bg-muted/20 max-w-xs mx-auto text-xs text-left">
                  <p className="font-semibold mb-1">Debug Info:</p>
                  <p>Total Bills: {bills.length}</p>
                  <p>Filter: {filterType}</p>
                </div>
              )}
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
                      Rs. {bill.total.toFixed(2)}
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
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rs. {selectedBill.total.toFixed(2)}</span>
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
