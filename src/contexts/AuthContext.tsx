import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Employee {
  name: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  employee: Employee | null;
  isLoading: boolean;
  signIn: (username: string, password: string, staffName?: string) => { success: boolean; error?: string };
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials
const VALID_USERNAME = 'hotelsrisenthoor';
const VALID_PASSWORD = '12345678';
const DEFAULT_EMPLOYEE_NAME = 'Sri Senthoor Staff';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const savedSession = localStorage.getItem('pos_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.isLoggedIn) {
          setEmployee({ name: session.name, isLoggedIn: true });
        }
      } catch {
        localStorage.removeItem('pos_session');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = (username: string, password: string, staffName?: string) => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const session = { name: staffName || DEFAULT_EMPLOYEE_NAME, isLoggedIn: true };
      localStorage.setItem('pos_session', JSON.stringify(session));
      setEmployee(session);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const signOut = () => {
    localStorage.removeItem('pos_session');
    setEmployee(null);
  };

  return (
    <AuthContext.Provider
      value={{
        employee,
        isLoading,
        signIn,
        signOut,
      }}
    >
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
