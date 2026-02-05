import { Leaf, LogOut, User, WifiOff } from 'lucide-react';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SettingsDialog from './SettingsDialog';

interface HeaderProps {
  billHistory?: ReactNode;
  isOffline?: boolean;
}

const Header = ({ billHistory, isOffline }: HeaderProps) => {
  const { employee, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  return (
    <header className="header-gradient text-primary-foreground py-3 px-3 sm:py-4 sm:px-6 shadow-warm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
            <Leaf className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-2xl font-bold tracking-tight truncate">Hotel Sri Senthoor</h1>
              {isOffline && (
                <span className="bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  <span className="hidden sm:inline">Offline</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm opacity-90 flex items-center gap-1 sm:gap-2">
              <span className="hidden sm:inline">& Cafe 77</span>
              <span className="bg-secondary px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap">
                Pure Veg
              </span>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
          {billHistory}
          <div className="text-right hidden sm:block">
            {employee && (
              <p className="text-sm font-medium flex items-center gap-1 justify-end">
                <User className="w-4 h-4" />
                {employee.name}
              </p>
            )}
            <p className="text-xs opacity-60">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <SettingsDialog />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            title="Logout"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;