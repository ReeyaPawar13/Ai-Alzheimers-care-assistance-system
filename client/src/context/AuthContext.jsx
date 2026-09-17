import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('caremate-user')) || null
  );
  const [token, setToken] = useState(localStorage.getItem('caremate-token') || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('caremate-token', token);
    } else {
      localStorage.removeItem('caremate-token');
    }

    if (user) {
      localStorage.setItem('caremate-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('caremate-user');
    }
  }, [user, token]);

  const login = async (emailOrPhone, password) => {
    const res = await axios.post('/auth/login', { emailOrPhone, password });
    setUser(res.data.user);
    setToken(res.data.token);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
