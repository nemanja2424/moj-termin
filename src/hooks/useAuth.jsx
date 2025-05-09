"use client";
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    
    if (authToken && isTokenValid(authToken)) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  function isTokenValid(token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  return isAuthenticated;
}

export default useAuth;
