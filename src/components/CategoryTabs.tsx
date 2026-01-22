import { categories } from '@/data/menuItems';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
            transition-all duration-200 whitespace-nowrap
            ${activeCategory === category.id 
              ? 'bg-primary text-primary-foreground shadow-warm scale-105' 
              : 'bg-card hover:bg-muted text-foreground border border-border'
            }
          `}
        >
          <span className="text-lg">{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
