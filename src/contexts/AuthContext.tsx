import React, { createContext, useContext, useState, ReactNode } from 'react';
import { isAslab } from '../utils/excelUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  npm: string | null;
  login: (npm: string) => Promise<boolean>;
  logout: () => void;
  isAslabUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [npm, setNpm] = useState<string | null>(null);
  const [isAslabUser, setIsAslabUser] = useState(false);

  const login = async (inputNpm: string) => {
    try {
      const aslabStatus = await isAslab(inputNpm);
      setIsAslabUser(aslabStatus);
      setIsAuthenticated(true);
      setNpm(inputNpm);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setNpm(null);
    setIsAslabUser(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, npm, login, logout, isAslabUser }}>
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