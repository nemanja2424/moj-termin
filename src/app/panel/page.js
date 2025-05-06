"use client";
import useAuth from '../../hooks/useAuth';

export default function PanelPage() {
  const isAuthenticated = useAuth();

  if (!isAuthenticated) {
    return (
      <main>
        <h1>Pristup odbijen</h1>
        <p>Token nije validan ili je istekao.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Panel</h1>
      <p>Dobrodošli u panel!</p>
    </main>
  );
}
