export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface BillItem extends MenuItem {
  quantity: number;
}

export interface Bill {
  items: BillItem[];
  subtotal: number;
  gst: number;
  total: number;
  billNumber: string;
  date: Date;
  billedBy?: string;
}

export type Category = 'starters' | 'main-course' | 'rice' | 'breads' | 'beverages' | 'desserts';
