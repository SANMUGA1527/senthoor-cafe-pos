import { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { MenuItem } from '@/types/billing';

interface MenuBarProps {
  items: MenuItem[];
  onAddItem: (item: MenuItem) => void;
  onUpdateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  onDeleteMenuItem: (id: string) => void;
  onAddNewItem: (item: MenuItem) => void;
}

const MenuBar = ({ items, onAddItem, onUpdateMenuItem, onDeleteMenuItem, onAddNewItem }: MenuBarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use ref for buffer logic to avoid effect re-creation/cleanup on every keystroke
  const [displayBuffer, setDisplayBuffer] = useState('');
  const keyBufferRef = useRef('');
  // const keyTimeout = useRef<NodeJS.Timeout>(); // Unused

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddQuantity = () => {
    if (selectedItem && quantity) {
      const qty = parseInt(quantity);
      if (!isNaN(qty) && qty > 0) {
        for (let i = 0; i < qty; i++) {
          onAddItem(selectedItem);
        }
      }
      setQuantityDialogOpen(false);
      setSelectedItem(null);
      setQuantity('1');
    }
  };

  // Keyboard shortcut: Press numbers to select items
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (/[0-9]/.test(e.key)) {
        e.preventDefault();
        // Append key to buffer ref
        keyBufferRef.current += e.key;
        setDisplayBuffer(keyBufferRef.current);
      } else if (e.key === 'Enter') {
        // Confirm selection
        if (keyBufferRef.current) {
          e.preventDefault();
          const index = parseInt(keyBufferRef.current) - 1;

          if (index >= 0 && index < filteredItems.length) {
            setSelectedItem(filteredItems[index]);
            setQuantity('');
            setQuantityDialogOpen(true);
            keyBufferRef.current = '';
            setDisplayBuffer('');
          } else {
            // Invalid number
            keyBufferRef.current = '';
            setDisplayBuffer('');
          }
        }
      } else if (e.key === 'Backspace') {
        // Allow correction
        e.preventDefault();
        keyBufferRef.current = keyBufferRef.current.slice(0, -1);
        setDisplayBuffer(keyBufferRef.current);
      } else if (e.key === 'Escape') {
        // Clear selection
        e.preventDefault();
        keyBufferRef.current = '';
        setDisplayBuffer('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [filteredItems]);

  const handleStartEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim() && editPrice) {
      onUpdateMenuItem(id, {
        name: editName.trim(),
        price: parseFloat(editPrice),
      });
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newPrice) {
      onAddNewItem({
        id: `item-${Date.now()}`,
        name: newName.trim(),
        price: parseFloat(newPrice),
        category: 'menu',
      });
      setNewName('');
      setNewPrice('');
      setAddDialogOpen(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header with Search */}
      <div className="p-3 sm:p-4 border-b border-border bg-muted/30 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-base sm:text-lg">Menu Items</h2>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card">
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddNew} className="space-y-4">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Item name"
                  required
                />
                <Input
                  type="number"
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Price (₹)"
                  required
                />
                <Button type="submit" className="w-full">Add to Menu</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="pl-10"
          />
          {displayBuffer && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-mono font-bold animate-in fade-in zoom-in duration-200">
              #{displayBuffer}
            </div>
          )}
        </div>
      </div>

      {/* Menu Items - Two Column Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="border border-border rounded-lg hover:bg-muted/30 transition-colors group flex items-center"
              >
                {editingId === item.id ? (
                  /* Edit Mode */
                  <div className="flex items-center gap-2 p-2 w-full">
                    <div className="veg-indicator flex-shrink-0" />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 h-8"
                      autoFocus
                    />
                    <Input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-20 h-8"
                      min="1"
                    />
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    {/* Serial Number */}
                    <div className="w-8 py-2 px-2 text-center font-medium text-muted-foreground text-sm">
                      {index + 1}
                    </div>
                    
                    {/* Item Name with Veg Indicator */}
                    <div 
                      className="flex-1 py-2 px-1 cursor-pointer"
                      onClick={() => onAddItem(item)}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="veg-indicator flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{item.name}</span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div 
                      className="py-2 px-2 text-center font-semibold text-primary text-sm cursor-pointer"
                      onClick={() => onAddItem(item)}
                    >
                      ₹{item.price}
                    </div>
                    
                    {/* Actions */}
                    <div className="py-2 px-2 flex items-center gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(item);
                        }}
                        className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMenuItem(item.id);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddItem(item);
                        }}
                        className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground p-1 rounded transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quantity Dialog */}
      <Dialog open={quantityDialogOpen} onOpenChange={setQuantityDialogOpen}>
        <DialogContent className="sm:max-w-xs bg-card">
          <DialogHeader>
            <DialogTitle>Add {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Quantity</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddQuantity();
                }}
              />
            </div>
            <Button onClick={handleAddQuantity} className="w-full">Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuBar;
