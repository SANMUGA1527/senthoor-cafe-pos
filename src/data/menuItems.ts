import { MenuItem } from '@/types/billing';

export const menuItems: MenuItem[] = [
  // Starters
  { id: '1', name: 'Paneer Tikka', price: 180, category: 'starters' },
  { id: '2', name: 'Gobi Manchurian', price: 140, category: 'starters' },
  { id: '3', name: 'Veg Spring Roll', price: 120, category: 'starters' },
  { id: '4', name: 'Mushroom 65', price: 160, category: 'starters' },
  { id: '5', name: 'Crispy Corn', price: 130, category: 'starters' },
  { id: '6', name: 'Aloo Tikki', price: 80, category: 'starters' },
  
  // Main Course
  { id: '7', name: 'Paneer Butter Masala', price: 220, category: 'main-course' },
  { id: '8', name: 'Dal Makhani', price: 180, category: 'main-course' },
  { id: '9', name: 'Chana Masala', price: 150, category: 'main-course' },
  { id: '10', name: 'Kadai Paneer', price: 200, category: 'main-course' },
  { id: '11', name: 'Veg Kolhapuri', price: 170, category: 'main-course' },
  { id: '12', name: 'Malai Kofta', price: 210, category: 'main-course' },
  
  // Rice
  { id: '13', name: 'Jeera Rice', price: 100, category: 'rice' },
  { id: '14', name: 'Veg Biryani', price: 180, category: 'rice' },
  { id: '15', name: 'Pulao', price: 120, category: 'rice' },
  { id: '16', name: 'Fried Rice', price: 140, category: 'rice' },
  
  // Breads
  { id: '17', name: 'Butter Naan', price: 45, category: 'breads' },
  { id: '18', name: 'Garlic Naan', price: 55, category: 'breads' },
  { id: '19', name: 'Roti', price: 25, category: 'breads' },
  { id: '20', name: 'Paratha', price: 40, category: 'breads' },
  { id: '21', name: 'Kulcha', price: 50, category: 'breads' },
  
  // Beverages
  { id: '22', name: 'Masala Chai', price: 30, category: 'beverages' },
  { id: '23', name: 'Filter Coffee', price: 40, category: 'beverages' },
  { id: '24', name: 'Lassi', price: 60, category: 'beverages' },
  { id: '25', name: 'Fresh Lime Soda', price: 50, category: 'beverages' },
  { id: '26', name: 'Buttermilk', price: 35, category: 'beverages' },
  
  // Desserts
  { id: '27', name: 'Gulab Jamun', price: 60, category: 'desserts' },
  { id: '28', name: 'Rasmalai', price: 80, category: 'desserts' },
  { id: '29', name: 'Ice Cream', price: 70, category: 'desserts' },
  { id: '30', name: 'Kheer', price: 65, category: 'desserts' },
];

export const categories = [
  { id: 'starters', name: 'Starters', icon: '🥗' },
  { id: 'main-course', name: 'Main Course', icon: '🍛' },
  { id: 'rice', name: 'Rice', icon: '🍚' },
  { id: 'breads', name: 'Breads', icon: '🫓' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'desserts', name: 'Desserts', icon: '🍨' },
];
