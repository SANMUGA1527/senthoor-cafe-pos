import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Employee {
  name: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  employee: Employee | null;
  isLoading: boolean;
  lastPasswordReset: string | null;
  signIn: (username: string, password: string, staffName?: string) => { success: boolean; error?: string };
  signOut: () => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials
const VALID_USERNAME = 'hotelsrisenthoor';
const VALID_PASSWORD = '12345678';
const DEFAULT_EMPLOYEE_NAME = 'Sri Senthoor Staff';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPasswordReset, setLastPasswordReset] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    const savedSession = localStorage.getItem('pos_session');
    const savedPasswordData = localStorage.getItem('pos_password_data');

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

    if (savedPasswordData) {
      try {
        const passwordData = JSON.parse(savedPasswordData);
        setLastPasswordReset(passwordData.lastReset);
      } catch {
        // Ignore invalid data
      }
    }

    setIsLoading(false);
  }, []);

  const signIn = (username: string, password: string, staffName?: string) => {
    // Get stored password or use default
    const passwordData = localStorage.getItem('pos_password_data');
    let storedPassword = VALID_PASSWORD;

    if (passwordData) {
      try {
        const data = JSON.parse(passwordData);
        storedPassword = data.password || VALID_PASSWORD;
      } catch {
        // Use default if parse fails
      }
    }

    if (username === VALID_USERNAME && password === storedPassword) {
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

  const changePassword = (currentPassword: string, newPassword: string) => {
    // Get stored password or use default
    const passwordData = localStorage.getItem('pos_password_data');
    let storedPassword = VALID_PASSWORD;

    if (passwordData) {
      try {
        const data = JSON.parse(passwordData);
        storedPassword = data.password || VALID_PASSWORD;
      } catch {
        // Use default if parse fails
      }
    }

    if (currentPassword !== storedPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    const now = new Date().toISOString();
    const newPasswordData = {
      password: newPassword,
      lastReset: now
    };

    localStorage.setItem('pos_password_data', JSON.stringify(newPasswordData));
    setLastPasswordReset(now);

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        employee,
        isLoading,
        lastPasswordReset,
        signIn,
        signOut,
        changePassword,
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
