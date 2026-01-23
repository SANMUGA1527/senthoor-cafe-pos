import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
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
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
        <h2 className="font-semibold text-lg">Menu Items</h2>
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

      {/* Menu Items List */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {items.map((item) => (
          <div 
            key={item.id}
            className="flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors group"
          >
            {editingId === item.id ? (
              /* Edit Mode */
              <div className="flex items-center gap-2 flex-1">
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
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => onAddItem(item)}
                >
                  <div className="veg-indicator flex-shrink-0" />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary mr-2">₹{item.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(item);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMenuItem(item.id);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAddItem(item)}
                    className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground p-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;
