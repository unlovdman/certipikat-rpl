import { createContext, useContext, useState, ReactNode } from 'react';
import { isAslab } from '../utils/excelUtils';
import { getCurrentPeriod } from '../utils/excelUtils';

interface AuthContextType {
  npm: string | null;
  isAuthenticated: boolean;
  login: (npm: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [npm, setNpm] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (inputNpm: string) => {
    try {
      const currentPeriod = getCurrentPeriod();
      const aslabStatus = await isAslab(inputNpm, 'PBO', currentPeriod);
      
      if (aslabStatus) {
        setNpm(inputNpm);
        setIsAuthenticated(true);
        return true;
      }

      setNpm(inputNpm);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setNpm(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ npm, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 