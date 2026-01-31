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
      <div 
        ref={ref} 
        className="printable-bill bg-white text-black"
        style={{ 
          fontFamily: 'monospace',
          width: '72mm',
          padding: '2mm',
          fontSize: '10px',
          lineHeight: '1.3',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '4px', marginBottom: '4px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>HOTEL SRI SENTHOOR</div>
          <div style={{ fontSize: '11px', fontWeight: '600' }}>& Cafe 77</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>--- Pure Vegetarian ---</div>
          <div style={{ marginTop: '4px', fontSize: '8px', lineHeight: '1.4' }}>
            <div>Near Nagampatti Toll Plaza,</div>
            <div>Krishnagiri District,</div>
            <div>Tamil Nadu – 635203</div>
            <div>Phone: +91 70106 95808</div>
          </div>
        </div>

        {/* Bill Info */}
        <div style={{ fontSize: '9px', marginBottom: '6px' }}>
          <div>{new Date().toLocaleString('en-IN')}</div>
          {billedBy && <div>Billed by: {billedBy}</div>}
        </div>

        {/* Items Table */}
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', paddingTop: '4px', paddingBottom: '4px', marginBottom: '4px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', fontSize: '9px', fontWeight: 'bold', marginBottom: '4px' }}>
            <span style={{ flex: '2', textAlign: 'left' }}>Item</span>
            <span style={{ flex: '0.5', textAlign: 'center' }}>Qty</span>
            <span style={{ flex: '0.8', textAlign: 'right' }}>Rate</span>
            <span style={{ flex: '0.8', textAlign: 'right' }}>Amt</span>
          </div>
          {/* Items */}
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', fontSize: '9px', paddingTop: '2px', paddingBottom: '2px' }}>
              <span style={{ flex: '2', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              <span style={{ flex: '0.5', textAlign: 'center' }}>{item.quantity}</span>
              <span style={{ flex: '0.8', textAlign: 'right' }}>{item.price}</span>
              <span style={{ flex: '0.8', textAlign: 'right' }}>{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ borderTop: '1px dashed #000', paddingTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
            <span>TOTAL:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #000' }}>
          <div style={{ fontSize: '9px' }}>Thank you for dining with us!</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>Visit Again ❤</div>
        </div>
      </div>
    );
  }
);

PrintableBill.displayName = 'PrintableBill';

export default PrintableBill;
