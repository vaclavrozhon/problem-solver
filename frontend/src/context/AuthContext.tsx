import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name?: string;
  picture_url?: string;
  credits_balance: number;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (idToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage on app start
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (idToken: string) => {
    try {
      const response = await fetch('/auth/google/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      setToken(data.access_token);
      setUser(data.user);

      // Save to localStorage
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
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