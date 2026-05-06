import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Employee {
  name: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  employee: Employee | null;
  isLoading: boolean;
  signIn: (staffName: string) => { success: boolean; error?: string };
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('pos_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.isLoggedIn && session.name) {
          setEmployee({ name: session.name, isLoggedIn: true });
        }
      } catch {
        localStorage.removeItem('pos_session');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = (staffName: string) => {
    const name = staffName.trim();
    if (!name) {
      return { success: false, error: 'Please enter your name' };
    }
    const session = { name, isLoggedIn: true };
    localStorage.setItem('pos_session', JSON.stringify(session));
    setEmployee(session);
    return { success: true };
  };

  const signOut = () => {
    localStorage.removeItem('pos_session');
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ employee, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
