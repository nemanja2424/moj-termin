'use client';
import { useRouter } from "next/navigation";

export default function useLogout() {
  const router = useRouter();

  return () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rola');
    localStorage.removeItem('userId');
    localStorage.removeItem('zakaziForma');
    localStorage.removeItem('zakaziPreduzece');
    router.push('/login');
  };
}
