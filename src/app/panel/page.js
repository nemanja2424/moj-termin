"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../../hooks/useAuth';

export default function PanelPage() {
  const isAuthenticated = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    return <p>Učitavanje...</p>; // Loading dok proverava token
  }

  if (isAuthenticated === false) {
    return null; // Vrati ništa dok ne redirectuje
  }

  return (
    <main>
      <h1>Panel</h1>
      <p>Dobrodošli u panel!</p>
    </main>
  );
}
