import { forwardRef } from 'react';
import { BillItem } from '@/types/billing';

interface PrintableBillProps {
  items: BillItem[];
  billNumber: string;
  billedBy?: string;
}

const PrintableBill = forwardRef<HTMLDivElement, PrintableBillProps>(
  ({ items, billNumber, billedBy }, ref) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div ref={ref} className="p-8 bg-white text-black max-w-md mx-auto" style={{ fontFamily: 'monospace' }}>
        {/* Header */}
        <div className="text-center border-b border-dashed border-black pb-3 mb-3">
          <h1 className="text-lg font-bold">HOTEL SRI SENTHOOR</h1>
          <p className="text-sm font-semibold">& Cafe 77</p>
          <p className="text-xs mt-0.5">--- Pure Vegetarian ---</p>
          <div className="mt-2 text-[10px] leading-tight">
            <p>Near Nagampatti Toll Plaza,</p>
            <p>Krishnagiri District,</p>
            <p>Tamil Nadu – 635203</p>
            <p>Phone: +91 70106 95808</p>
          </div>
        </div>

        {/* Bill Info */}
        <div className="text-xs mb-4 space-y-1">
          <div className="flex justify-between">
            <span>{new Date().toLocaleString('en-IN')}</span>
          </div>
          {billedBy && (
            <div className="text-left">
              <span>Billed by: {billedBy}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="border-t border-b border-dashed border-black py-2 mb-4">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="w-1/2">Item</span>
            <span className="w-1/6 text-center">Qty</span>
            <span className="w-1/6 text-right">Rate</span>
            <span className="w-1/6 text-right">Amt</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs py-1">
              <span className="w-1/2 truncate">{item.name}</span>
              <span className="w-1/6 text-center">{item.quantity}</span>
              <span className="w-1/6 text-right">{item.price}</span>
              <span className="w-1/6 text-right">{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Total - No GST */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between font-bold text-lg border-t border-dashed border-black pt-2">
            <span>TOTAL:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-dashed border-black">
          <p className="text-xs">Thank you for dining with us!</p>
          <p className="text-xs mt-1">Visit Again ❤</p>
        </div>
      </div>
    );
  }
);

PrintableBill.displayName = 'PrintableBill';

export default PrintableBill;
