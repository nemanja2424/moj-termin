"use client"
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation'; // Importuj useRouter

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    
    if (authToken && isTokenValid(authToken)) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

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
