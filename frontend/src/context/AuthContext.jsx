import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const persist = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => persist((await api.post('/auth/login', { email, password })).data);
  const register = async (name, email, password) => persist((await api.post('/auth/register', { name, email, password })).data);
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  const hasRole = (...roles) => !!user && roles.includes(user.role);

  return <AuthContext.Provider value={{ user, login, register, logout, hasRole }}>{children}</AuthContext.Provider>;
}
