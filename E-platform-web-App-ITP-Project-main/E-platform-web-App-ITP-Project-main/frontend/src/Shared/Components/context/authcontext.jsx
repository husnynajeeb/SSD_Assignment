import { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext({
  isLoggedIn: false,
  cusId: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
    return savedIsLoggedIn ? JSON.parse(savedIsLoggedIn) : false;
  });

  const [cusId, setCusId] = useState(() => {
    const savedCusId = localStorage.getItem('cusId');
    return savedCusId ? JSON.parse(savedCusId) : null;
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    localStorage.setItem('cusId', JSON.stringify(cusId));
  }, [isLoggedIn, cusId]);

  const login = (customerId) => {
    setIsLoggedIn(true);
    setCusId(customerId);
  };

  const logout = async () => {
    try {
      // Call backend to destroy session
      await axios.get("http://localhost:5000/login/logout", { withCredentials: true });
    } catch (err) {
      console.error("Backend logout failed:", err);
    } finally {
      // Clear frontend state no matter what
      setIsLoggedIn(false);
      setCusId(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("cusId");
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, cusId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
