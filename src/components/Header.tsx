import { Leaf } from 'lucide-react';
const Header = () => {
  return <header className="header-gradient text-primary-foreground py-4 px-6 shadow-warm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Leaf className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hotel Sri Senthoor</h1>
            <p className="text-sm opacity-90 flex items-center gap-2">
              <span>& Cafe 77</span>
              <span className="bg-secondary px-2 py-0.5 rounded-full text-xs font-medium">
                Pure Veg
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-75">Billing System</p>
          <p className="text-xs opacity-60">
            {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          </p>
        </div>
      </div>
    </header>;
};
export default Header;