import { forwardRef } from 'react';
import { BillItem } from '@/types/billing';

interface PrintableBillProps {
  items: BillItem[];
  billNumber: string;
}

const PrintableBill = forwardRef<HTMLDivElement, PrintableBillProps>(
  ({ items, billNumber }, ref) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div ref={ref} className="p-4 bg-white text-black max-w-[80mm] mx-auto" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
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

        {/* Date Only (Bill No Removed) */}
        <div className="text-right text-[10px] mb-3">
          <span>{new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}</span>
        </div>

        {/* Items Table */}
        <div className="border-t border-b border-dashed border-black py-2 mb-3">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-dashed border-black/30">
                <th className="text-left py-1 font-bold w-1/2">Item</th>
                <th className="text-center py-1 font-bold">Qty</th>
                <th className="text-right py-1 font-bold">Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-1 text-left align-top">{item.name}</td>
                  <td className="py-1 text-center align-top">{item.quantity}</td>
                  <td className="py-1 text-right align-top">{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Display */}
        <div className="space-y-1">
          <div className="flex justify-between font-bold text-base border-t border-dashed border-black pt-2">
            <span>TOTAL:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-3 border-t border-dashed border-black">
          <p className="text-[10px]">Thank you for dining with us!</p>
          <p className="text-[10px] mt-0.5 font-bold">Visit Again</p>
        </div>
      </div>
    );
  }
);

PrintableBill.displayName = 'PrintableBill';

export default PrintableBill;
