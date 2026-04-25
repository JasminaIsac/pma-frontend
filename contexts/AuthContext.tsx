import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi } from '@api/auth';
import { ID } from 'schemas';

interface JwtPayload {
  userId: ID;
  email: string;
  exp: number;
}

export interface AuthContextType {
  token: string | null;
  userId: ID | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<ID | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const loadToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      if (storedToken) {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        // console.log('AUTH CONTEXT: jwt decoded - ',storedToken);
        setToken(storedToken);
        setUserId(decoded.userId);
      }
    } catch (e) {
      console.error('Failed to load token', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginApi({ email, password });
    await SecureStore.setItemAsync('authToken', data.token);

    const decoded = jwtDecode<JwtPayload>(data.token);

    setToken(data.token);
    setUserId(decoded.userId);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setToken(null);
    setUserId(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ token, userId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
